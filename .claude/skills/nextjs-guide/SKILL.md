---
name: nextjs-guide
description: Apply Next.js 14-15 best practices including App Router, Server Components, data fetching, and project structure. Use when building, reviewing, or optimizing Next.js applications.
---

# Next.js Best Practices

## Quick Start

When working with Next.js 14-15:

1. **Server Components by default**: Only use `"use client"` when necessary
2. **App Router structure**: Use route groups, layouts, and proper file organization
3. **Data fetching**: Fetch directly in Server Components, use proper caching
4. **Component composition**: Keep client boundary small, compose Server Components inside Client Components
5. **Project structure**: Use `src/` directory with proper separation (components, lib, utils)
6. **Performance**: Leverage automatic optimizations (code-splitting, prefetching, caching)

## Server vs Client Components

### Server Components (Default)

Use Server Components by default for data fetching and rendering:

```tsx
// ✅ Good: Server Component (no "use client")
async function ProductPage({ params }: { params: { id: string } }) {
  const product = await fetch(`https://api.example.com/products/${params.id}`, {
    next: { revalidate: 60 }
  }).then(res => res.json());
  
  return <div>{product.name}</div>;
}
```

**Use Server Components when**:
- Fetching data from APIs or databases
- Accessing environment variables
- Rendering static or semi-static content
- Keeping bundle size small

### Client Components

Add `"use client"` only when genuinely needed:

```tsx
// ✅ Good: Client Component with "use client"
"use client";

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

**Use Client Components when**:
- Event handlers (`onClick`, `onChange`, `onSubmit`)
- Browser APIs (`window`, `localStorage`, `IntersectionObserver`)
- React state and effects (`useState`, `useEffect`, `useRef`)
- Third-party libraries that require client-side execution

### Composition Pattern

Keep client boundary small by composing Server Components inside Client Components:

```tsx
// ✅ Good: Client Component receiving Server Component as children
// components/dashboard/DashboardLayout.tsx
"use client";

import { useState } from 'react';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div>
      <button onClick={() => setSidebarOpen(!sidebarOpen)}>Toggle</button>
      {children}
    </div>
  );
}
```

```tsx
// ✅ Good: Server Component passing content to Client Component
// app/dashboard/page.tsx
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard'; // Server Component

export default async function DashboardPage() {
  const stats = await fetchStats(); // Server-side data fetching
  
  return (
    <DashboardLayout>
      <StatsCard data={stats} />
    </DashboardLayout>
  );
}
```

## Data Fetching

### Direct Fetching in Server Components

Fetch data directly without `useEffect`:

```tsx
// ✅ Good: Direct data fetching
async function ProductList() {
  const products = await fetch('https://api.example.com/products', {
    next: { revalidate: 60 } // Revalidate every 60 seconds
  }).then(res => res.json());
  
  return (
    <ul>
      {products.map(product => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  );
}
```

### Parallel Fetching

Use `Promise.all()` for multiple resources:

```tsx
// ✅ Good: Parallel data fetching
async function Dashboard() {
  const [users, products, orders] = await Promise.all([
    fetch('https://api.example.com/users').then(res => res.json()),
    fetch('https://api.example.com/products').then(res => res.json()),
    fetch('https://api.example.com/orders').then(res => res.json())
  ]);
  
  return (
    <div>
      <UsersSection users={users} />
      <ProductsSection products={products} />
      <OrdersSection orders={orders} />
    </div>
  );
}
```

### Caching Strategies

```tsx
// Time-based revalidation
const data = await fetch(url, {
  next: { revalidate: 3600 } // Revalidate every hour
});

// No caching (always fresh)
const data = await fetch(url, { cache: 'no-store' });

// On-demand revalidation
// In your route handler:
import { revalidateTag } from 'next/cache';

revalidateTag('products'); // Revalidate all data tagged with 'products'

// In your fetch:
const data = await fetch(url, {
  next: { tags: ['products'] }
});
```

## Project Structure

### Core Directory Layout

```
src/
├── app/                    # App Router (routes)
│   ├── (auth)/            # Route group (doesn't affect URL)
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/       # Another route group
│   │   ├── layout.tsx     # Shared layout for dashboard routes
│   │   ├── page.tsx       # /dashboard
│   │   └── settings/
│   ├── api/               # API routes
│   │   └── users/
│   │       └── route.ts
│   ├── globals.css
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/
│   ├── ui/                # Reusable UI components (Button, Card, Modal)
│   ├── layout/            # Layout components (Header, Footer, Sidebar)
│   └── features/          # Feature-specific components
│       ├── auth/
│       ├── dashboard/
│       └── products/
├── lib/                   # Business logic, API clients, auth
│   ├── api.ts
│   ├── auth.ts
│   └── db.ts
├── utils/                 # Pure utility functions
│   ├── cn.ts
│   └── formatters.ts
├── types/                 # TypeScript types
│   └── index.ts
└── styles/                # Additional styles
    └── variables.css

public/                    # Static assets
├── images/
└── fonts/
```

### Route Organization

Use route groups for organization without affecting URL structure:

```
app/
├── (marketing)/          # Marketing pages: /, /about, /contact
│   ├── page.tsx         # /
│   ├── about/
│   │   └── page.tsx     # /about
│   └── contact/
│       └── page.tsx     # /contact
├── (auth)/              # Auth pages: /login, /register
│   ├── login/
│   │   └── page.tsx     # /login
│   └── register/
│       └── page.tsx     # /register
└── (app)/               # App routes: /dashboard, /settings
    ├── dashboard/
    │   └── page.tsx     # /dashboard
    └── settings/
        └── page.tsx     # /settings
```

### Component Organization

Each component in its own folder:

```
components/ui/Button/
├── Button.tsx           # Main component
├── Button.test.tsx      # Tests
├── Button.stories.tsx   # Storybook (optional)
└── index.ts            # Barrel export
```

```tsx
// components/ui/Button/Button.tsx
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  children, 
  ...props 
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'font-medium rounded transition-colors',
        {
          'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
          'bg-gray-200 text-gray-900 hover:bg-gray-300': variant === 'secondary',
          'border border-gray-300 hover:bg-gray-100': variant === 'outline',
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

## Utils vs Lib

Distinguish between utils and lib:

```typescript
// ✅ utils/formatters.ts - Pure functions, no side effects
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

// ✅ lib/api.ts - Business logic, external dependencies
import { ENV } from './env';

export async function fetchUser(id: string) {
  const response = await fetch(`${ENV.API_URL}/users/${id}`, {
    headers: {
      'Authorization': `Bearer ${ENV.API_KEY}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  
  return response.json();
}
```

## Performance Optimizations

### Automatic Optimizations (Built-in)

Next.js provides by default:
- **Code-splitting**: By route segments
- **Link prefetching**: `<Link>` components prefetch in viewport
- **Prerendering**: At build time
- **Intelligent caching**: Data requests and rendered components

### Image Optimization

```tsx
import Image from 'next/image';

// ✅ Good: Optimized image
<Image
  src="/hero.jpg"
  alt="Hero banner"
  width={1200}
  height={630}
  priority  // For above-the-fold images
  quality={85}
/>
```

### Font Optimization

```tsx
// ✅ Good: Optimized fonts
import { Inter } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
```

## Error Handling

### Error Boundaries

```tsx
// app/error.tsx
"use client";

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

### Not Found Handling

```tsx
// app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div>
      <h2>Page Not Found</h2>
      <p>Could not find requested resource</p>
      <Link href="/">Return Home</Link>
    </div>
  );
}
```

### Loading States

```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );
}
```

## API Routes

### RESTful API Structure

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const users = await db.user.findMany();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const user = await db.user.create({ data: body });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 400 }
    );
  }
}
```

## Testing

### Component Testing with Vitest

```tsx
// __tests__/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    screen.getByRole('button').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant classes', () => {
    const { container } = render(<Button variant="primary">Test</Button>);
    expect(container.firstChild).toHaveClass('bg-blue-600');
  });
});
```

## Commands

### Essential Next.js Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checker
npm run test         # Run test suite
```

## Anti-Patterns to Avoid

### ❌ Bad: Unnecessary Client Components

```tsx
// ❌ Bad: Using Client Component when Server Component suffices
"use client";

export async function ProductPage({ params }) {
  const product = await fetchProduct(params.id);
  return <div>{product.name}</div>;
}
```

```tsx
// ✅ Good: Server Component
export async function ProductPage({ params }) {
  const product = await fetchProduct(params.id);
  return <div>{product.name}</div>;
}
```

### ❌ Bad: Large Client Components

```tsx
// ❌ Bad: Everything in one Client Component
"use client";

export function Dashboard() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetchData().then(setData);
  }, []);
  
  return <div>...</div>;
}
```

```tsx
// ✅ Good: Split Server and Client
async function Dashboard() {
  const data = await fetchData();
  return <DashboardClient initialData={data} />;
}

"use client";

function DashboardClient({ initialData }) {
  const [data, setData] = useState(initialData);
  return <div>...</div>;
}
```

### ❌ Bad: Waterfall Fetching

```tsx
// ❌ Bad: Sequential fetching
async function Page() {
  const user = await fetchUser();
  const posts = await fetchPosts(user.id);
  const comments = await fetchComments(posts[0].id);
  // ...
}
```

```tsx
// ✅ Good: Parallel fetching
async function Page() {
  const [user, posts, comments] = await Promise.all([
    fetchUser(),
    fetchPosts(user.id),
    fetchComments(posts[0].id)
  ]);
}
```

## Examples

### Example 1: E-commerce Product Page

```tsx
// app/products/[id]/page.tsx
import { notFound } from 'next/navigation';
import { ProductImages } from './ProductImages';
import { AddToCart } from './AddToCart';

async function getProduct(id: string) {
  const res = await fetch(`https://api.example.com/products/${id}`, {
    next: { revalidate: 3600, tags: ['products'] }
  });
  
  if (!res.ok) return null;
  return res.json();
}

export default async function ProductPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const product = await getProduct(params.id);
  
  if (!product) {
    notFound();
  }
  
  return (
    <div>
      <ProductImages images={product.images} />
      <div>
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        <p>${product.price}</p>
        <AddToCart productId={product.id} />
      </div>
    </div>
  );
}
```

```tsx
// app/products/[id]/AddToCart.tsx
"use client";

import { useState } from 'react';

export function AddToCart({ productId }: { productId: string }) {
  const [quantity, setQuantity] = useState(1);
  
  return (
    <div>
      <input
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
        min={1}
      />
      <button onClick={() => addToCart(productId, quantity)}>
        Add to Cart
      </button>
    </div>
  );
}
```

### Example 2: Dashboard with Authentication

```tsx
// app/(dashboard)/dashboard/page.tsx
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCards } from './StatsCards';

export default async function DashboardPage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }
  
  return (
    <DashboardLayout user={session.user}>
      <StatsCards userId={session.user.id} />
    </DashboardLayout>
  );
}
```

## Additional Resources

- For complete API details, see [Next.js Documentation](https://nextjs.org/docs)
- For App Router patterns, see [Next.js App Router Guide](https://nextjs.org/docs/app)
- For production checklist, see [Next.js Production Guide](https://nextjs.org/docs/app/guides/production-checklist)
