---
name: nestjs-guide
description: Comprehensive enterprise guide for NestJS backends covering modular architecture, TypeORM/Prisma transactions, dependency injection, validation pipes, guards, interceptors, and error handling.
---

# NestJS Enterprise Backend Engineering Guide

## Quick Start
When architecting NestJS microservices and APIs:
1. **Modules as Domain Boundaries**: Separate features cleanly (`UsersModule`, `PaymentsModule`). Never dump everything into `AppModule`.
2. **DTO Validation**: Enforce strict `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true`.
3. **Stateless Services**: Default to `Scope.DEFAULT` (Singleton). Never store user request state inside service instance properties.
4. **Transactions via QueryRunner / $transaction**: Always handle atomic operations explicitly. Never leave transactions dangling without rollback.
5. **Thin Controllers, Rich Services**: Controllers handle HTTP protocol concerns only. Business logic belongs strictly in Services.

---

## 1. Enterprise Module Architecture

```text
src/
├── common/                   # Cross-cutting concerns
│   ├── decorators/           # Custom parameter decorators (@CurrentUser(), @Public())
│   ├── filters/              # Global HttpExceptionFilter
│   ├── guards/               # AuthGuard, RolesGuard
│   ├── interceptors/         # LoggingInterceptor, TransformInterceptor
│   └── pipes/                # Custom validation/parse pipes
├── modules/
│   ├── auth/
│   │   ├── dto/
│   │   ├── guards/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   └── orders/
│       ├── dto/
│       │   ├── create-order.dto.ts
│       │   └── order-response.dto.ts
│       ├── entities/
│       │   └── order.entity.ts
│       ├── orders.controller.ts
│       ├── orders.service.ts
│       └── orders.module.ts
├── config/                   # Configuration namespaces via @nestjs/config
├── app.module.ts
└── main.go / main.ts
```

---

## 2. Robust Input Validation (Zero-Trust Boundaries)

```typescript
// src/modules/orders/dto/create-order.dto.ts
import { IsUUID, IsNumber, Min, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsUUID('4')
  productId: string;

  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(1)
  quantity: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unitPrice: number;
}

export class CreateOrderDto {
  @IsUUID('4')
  customerId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
```

### Main.ts Bootstrap Guard
```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              // Strips unexpected payload keys
      forbidNonWhitelisted: true,   // Throws 400 if malicious unexpected fields are sent
      transform: true,              // Automatically maps incoming JSON into TS DTO instances
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
  Logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
```

---

## 3. Database Transactions with Pessimistic Locking (TypeORM)

```typescript
@Injectable()
export class OrdersService {
  constructor(private readonly dataSource: DataSource) {}

  async processOrderPayment(orderId: string, amount: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Lock the order row exclusively to prevent concurrent double-payments
      const order = await queryRunner.manager.findOne(OrderEntity, {
        where: { id: orderId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${orderId} not found`);
      }

      if (order.status === OrderStatus.PAID) {
        throw new ConflictException(`Order ${orderId} has already been settled`);
      }

      // 2. Perform state changes
      order.status = OrderStatus.PAID;
      order.paidAt = new Date();
      await queryRunner.manager.save(order);

      // 3. Record ledger entry
      const ledgerEntry = queryRunner.manager.create(PaymentLedgerEntity, {
        orderId,
        amount,
        status: 'SUCCESS',
      });
      await queryRunner.manager.save(ledgerEntry);

      // 4. Commit all operations atomically
      await queryRunner.commitTransaction();
    } catch (err) {
      // Rollback on any failure
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // Always release query runner back to the connection pool
      await queryRunner.release();
    }
  }
}
```

---

## 4. Global Exception Filter (Consistent Error Responses)

```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    this.logger.error(`HTTP Status: ${status} Error Message: ${JSON.stringify(message)}`);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: typeof message === 'object' ? message : { message },
    });
  }
}
```
