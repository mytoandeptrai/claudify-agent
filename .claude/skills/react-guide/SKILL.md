---
name: react-guide
description: Apply React best practices including modern patterns, hooks, TypeScript, performance optimization, and testing, following a modules → containers → hooks → components frontend architecture. Use when writing, reviewing, or refactoring React code.
---

# React Best Practices

## Quick Start

When working with React code, follow these core principles:

1. **Architecture**: Split every feature into `modules/<feature>/{containers,hooks,components}` with strict suffixes (see "Frontend Architecture")
2. **Modern Patterns**: Use hooks and function components (no class components, except error boundaries)
3. **TypeScript**: Add proper types, avoid `any`
4. **Server Components**: Use RSC for data fetching when possible *(Next.js projects only — in a client-side SPA such as Vite, fetch through hooks + a query library instead)*
5. **Performance**: Prevent re-renders, code-split, optimize bundles
6. **Testing**: Use React Testing Library with user-behavior queries
7. **Accessibility**: Build accessible components by default

---

# Frontend Architecture (modules → containers → hooks → components)

Apply this when the project has (or should have) `src/modules/`. The layering is the rule; the libraries below are the defaults it was written with: React 19, Vite, TanStack Router + Query + Table, react-hook-form + zod, i18next, shadcn/ui, Tailwind, Biome, Vitest. If the project uses others (React Router, SWR, ESLint, Jest...), keep the layering and use the project's own libraries and scripts. Names like `login`, `order`, `@/apis/<domain>` are examples, not requirements.

## modules → containers → hooks → components

Every feature/page lives in `src/modules/<feature>/` and is split into 3 layers with strict responsibilities:

| Layer | Folder | Suffix | Responsibility |
|---|---|---|---|
| Container | `containers/<name>-container/` | `-container` | Wrapper/composer. Calls **one hook**, passes results to UI components, composes child containers/layout. No business logic inline. |
| Hook | `hooks/` | `use-<name>-container.ts(x)` | **All logic**: queries/mutations, form (`useForm`), state, handlers, navigation, toasts, derived data. Returns a flat object for the container. |
| Component | `components/<name>-ui/` | `-ui` | **Presentational only**: receives props, renders. No fetching, no mutations, no routing, no business decisions. |

Data flow is one-way: `route → Container → useXxxContainer() → <XxxUi {...props} />`.

### Folder layout

```
src/modules/<feature>/
├── index.ts                         # export { default as XxxContainer } from './containers/xxx-container';
├── containers/
│   └── xxx-container/
│       ├── index.ts                 # export { default } from './xxx-container';
│       ├── xxx-container.tsx
│       └── create-columns.tsx       # (optional) container-local helpers, e.g. table columns
├── hooks/
│   ├── index.ts                     # export * from './use-xxx-container'; export * from './schema';
│   ├── use-xxx-container.ts
│   └── schema.ts                    # zod schema + initial form data + FormData type
└── components/
    ├── index.ts                     # export { default as XxxFormUi } from './xxx-form-ui';
    └── xxx-form-ui/
        ├── index.ts                 # export { default } from './xxx-form-ui'; export * from './xxx-form-ui';
        └── xxx-form-ui.tsx
```

Pages with several sub-flows nest them: `modules/auth/{login,register,forgot-password,...}/` each with its own `containers/ hooks/ components/ index.ts`.

### Naming rules

- Folder + file: kebab-case, suffix by role: `login-container`, `login-form-ui`, `login-header-ui`, `use-login-container.ts`.
- Component identifiers: PascalCase with the same suffix: `LoginContainer`, `LoginFormUi`.
- Hook: `use<Name>Container`, one hook per container, named after it (`OrderTableContainer` ↔ `useOrderListContainer` is acceptable when the hook serves the data concern; keep it obvious).
- Schema: `schema.ts` or `<name>.schema.ts` in `hooks/`. Export `xxxSchema`, `initialXxxFormData`, `type XxxFormData`.
- Components/containers use **default export** + `index.ts` re-export; hooks use **named export**.
- Each folder has an `index.ts` barrel. Import siblings through the barrel (`'../../hooks'`, `'../../components'`), not deep paths.
- Module `index.ts` exposes only the top-level container(s). Routes import from there: `import { LoginContainer } from '@/modules/auth/login'`.
- Use the `@/` alias for anything outside the module; relative `../../` only for same-module layers.

### Container — wrapper only

```tsx
// containers/login-container/login-container.tsx
const LoginContainer = () => {
  const { form, isLoading, onSubmit } = useLoginContainer();
  return (
    <Card className='w-full max-w-md gap-10'>
      <LoginHeaderUi />
      <CardContent>
        <FormWrapper form={form} onSubmit={onSubmit}>
          <LoginFormUi isLoading={isLoading} />
        </FormWrapper>
      </CardContent>
    </Card>
  );
};
export default LoginContainer;
```

- Compose layout (`PageContainer`, `Card`, `Dialog`, `DataTable`, `FormWrapper`) + child containers + `-ui` components.
- A container may nest other containers (`OrdersContainer` → `OrderTableContainer` + `CreateOrderDialogContainer`).
- A small container may hold light wiring (e.g. `OrderActionsContainer` binds a mutation to `OrderActionsUi`), but once it has form/state/navigation/multiple handlers, move it into `hooks/use-*-container.ts`.
- Memoize derived objects passed to heavy children (`useMemo(() => createColumns({ t }), [t])`).

### Hook — all logic

```ts
// hooks/use-login-container.ts
export const useLoginContainer = () => {
  const { t } = useTranslation('login-page');
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema(t)),
    defaultValues: initialFormData,
    mode: 'onChange',
  });
  const loginMutation = useLoginMutation();
  const isLoading = loginMutation.isPending;

  const onSubmit = async (payload: LoginFormData) => {
    if (isLoading) return;
    const { data } = await loginMutation.mutateAsync(payload);
    // ...success handling, toast, navigation
  };

  return { t, form, isLoading, onSubmit };
};
```

- Owns: API hooks from `@/apis/<domain>`, `useForm`, `useState`, router (`Route.useSearch/useNavigate/useParams`), stores, contexts, toasts, `queryClient.invalidateQueries`.
- Handlers are named `onXxx` (`onSubmit`, `onOpenChange`, `onPaginationChange`, `onSortingChange`, `onCopy`, `onCancel`).
- Return a **flat** object with only what the container needs (`t`, flags like `isLoading`, handlers, `form`, derived `tableData`).
- Zod schemas that need i18n are factories: `loginFormSchema(t)`; always `.trim()` / reject whitespace-only for text/email fields.
- Hooks never return JSX. (`.tsx` extension only when the file genuinely needs JSX, e.g. a toast with `<ToastLink>`.)
- Effects: only for syncing with external systems (see "Common Pitfalls").

### Component (`-ui`) — props in, JSX out

```tsx
type OrderActionsUiProps = {
  order: IOrder;
  isCancelling?: boolean;
  onCopy: () => void;
  onCancel: () => void;
};

const OrderActionsUi = ({ order, isCancelling = false, onCopy, onCancel }: OrderActionsUiProps) => { ... };
export default OrderActionsUi;
```

- Props type named `<Component>Props`, declared with `type` right above the component; optional flags get defaults (`isLoading = false`).
- Event props are `onXxx` callbacks supplied by the container; the UI never calls an API itself.
- Allowed inside a `-ui` component (existing convention): `useTranslation` for static labels, `useFormContext` to bind fields under `FormWrapper`, trivial presentational conditions, local UI-only state (e.g. popover open).
- **Not allowed**: `useQuery`/`useMutation`, `useNavigate`/`Route.use*`, store access, `queryClient`, toasts, schema building, data transformation beyond display.
- Form data type comes from the module: `import type { LoginFormData } from '../../hooks'`.
- Prefer `Show`, `HStack`, `VStack` from `@/components/utilities` over ad-hoc conditionals/raw flex wrappers where it improves readability.

### Where does it go?

| Code | Place |
|---|---|
| Route component, page wrapper, dialog shell, table shell | `containers/` |
| `useForm`, mutation, search params, pagination handlers | `hooks/` |
| zod schema, initial form values | `hooks/schema.ts` |
| Form fields layout, header, buttons, modal body | `components/*-ui` |
| Table `createColumns` | next to the table container |
| Reusable across modules (no domain knowledge) | `src/components/**` (ui, form-fields, utilities, containers, layouts) |
| Generic hook (`use-copy`, `use-debounce`) | `src/hooks/` |
| API request/query/key/types | `src/apis/<domain>/{requests,queries,keys,types,index}.ts` |
| Global state | `src/stores/`, `src/contexts/`, `src/integrations/` |

### Routes

Routes are thin: `src/routes/**` only wires path, `validateSearch` (zod), and `component: XxxContainer` imported from the module barrel. No logic in route files.

```tsx
export const Route = createFileRoute('/(auth)/login')({
  validateSearch: (search) => loginSearchSchema.parse(search),
  component: LoginContainer,
});
```

### New feature checklist

1. Create `modules/<feature>/` with `containers/`, `hooks/`, `components/`, `index.ts`.
2. Add API layer under `src/apis/<domain>` if needed (requests → queries/mutations → keys → types → index).
3. Write schema + `use-<name>-container` hook.
4. Write `-ui` components (props only), then the `-container` that wires hook → UI.
5. Add barrels (`index.ts`) at every level; export the container from the module `index.ts`.
6. Register the route to the container; add i18n keys to the feature namespace (`useTranslation('<feature>-page')`, shared strings in `common`).
7. Run `npm run check`, `npm run build`, `npm run test`.

### Project conventions

- **UI/styling**: colors only via design tokens in `src/styles.css`; reuse `src/components/ui` (shadcn) before building new primitives; pages are full-width within the layout.
- **i18n**: every user-facing string via `t()`; namespace per feature, shared strings in `common`. No literal text in JSX.
- **Forms**: `react-hook-form` + `zodResolver`, `mode: 'onChange'`, fields from `@/components/form-fields/*` inside `FormWrapper`.
- **Server state**: TanStack Query via `@/apis/*`; after a mutation `invalidateQueries({ queryKey: [KEYS.X] })`. Don't copy server data into `useState`.
- **URL state**: table filters/pagination/sort live in router search params, changed with `navigate({ search, replace: true })`.
- **Style**: single quotes (JSX too), arrow-function components, Biome formatting.

---

## Component Architecture

### Function Components with Hooks

```tsx
// ✅ Good: Function component with hooks
interface UserCardProps {
  userId: string;
  showDetails?: boolean;
}

export function UserCard({ userId, showDetails = false }: UserCardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      const data = await fetchUserById(userId);
      setUser(data);
      setLoading(false);
    }
    fetchUser();
  }, [userId]);

  if (loading) return <Spinner />;
  if (!user) return <ErrorMessage />;

  return (
    <Card>
      <h2>{user.name}</h2>
      {showDetails && <p>{user.email}</p>}
    </Card>
  );
}
```

> Under this architecture the logic is split: the fetching goes into `use-user-card-container.ts` (via `@/apis/*` + TanStack Query rather than a manual `useEffect`), and `UserCardUi` only renders props.

### Custom Hooks for Reusable Logic

```tsx
// ✅ Good: Extract stateful logic into custom hooks
interface UseFetchOptions {
  enabled?: boolean;
}

export function useFetch<T>(
  endpoint: string,
  options: UseFetchOptions = {}
) {
  const { enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();
    
    async function fetchData() {
      setLoading(true);
      try {
        const response = await fetch(endpoint, {
          signal: controller.signal,
        });
        const result = await response.json();
        setData(result);
      } catch (err) {
        if (err instanceof Error) setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    return () => controller.abort();
  }, [endpoint, enabled]);

  return { data, loading, error };
}

// Usage in component
function UserProfile({ userId }: { userId: string }) {
  const { data: user, loading, error } = useFetch<User>(
    `/api/users/${userId}`
  );

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!user) return <NotFound />;

  return <div>{user.name}</div>;
}
```

## React Server Components (RSC)

> Reference only: applies to Next.js. In a client-side SPA (e.g. Vite) there is no `'use client'`; data fetching goes through hooks + a query library.

### Server Component Pattern

```tsx
// ✅ Good: Server Component for data fetching
import { db } from '@/lib/db';
import { ProductList } from './ProductList';

export default async function ProductsPage() {
  const products = await db.product.findMany();
  
  return (
    <div>
      <h1>Products</h1>
      <ProductList products={products} />
    </div>
  );
}
```

### Client Component When Needed

```tsx
// ✅ Good: Client Component only when interactivity needed
'use client';

import { useState } from 'react';

interface ProductListProps {
  products: Product[];
}

export function ProductList({ products }: ProductListProps) {
  const [filter, setFilter] = useState('');

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        value={filter}
        onChange={e => setFilter(e.target.value)}
        placeholder="Filter products..."
        aria-label="Filter products"
      />
      <ul>
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ul>
    </div>
  );
}
```

## Performance Optimization

### Prevent Unnecessary Re-renders

```tsx
// ✅ Good: React.memo for pure components
interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
}

export const ProductCard = React.memo(function ProductCard({
  product,
  onAddToCart,
}: ProductCardProps) {
  return (
    <div>
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button onClick={() => onAddToCart(product.id)}>
        Add to Cart
      </button>
    </div>
  );
});

// ✅ Good: useCallback for stable function references
function ProductList() {
  const [cart, setCart] = useState<Product[]>([]);

  const addToCart = useCallback((productId: string) => {
    setCart(prev => [...prev, { id: productId }]);
  }, []);

  return (
    <div>
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={addToCart}
        />
      ))}
    </div>
  );
}

// ✅ Good: useMemo for expensive calculations
function ShoppingCart({ items }: { items: CartItem[] }) {
  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  return <div>Total: ${total}</div>;
}
```

Project notes:
- `useMemo` for table columns and derived table data (see the table container and its list hook).
- Use `placeholderData` (keep previous data) for filter/pagination to avoid flicker.
- Known React Compiler incompatibilities: TanStack Table `useReactTable`; don't assume the compiler memoizes it.

### Code Splitting

```tsx
// ✅ Good: Lazy loading for route-based splitting
import { lazy, Suspense } from 'react';

const ProductDetails = lazy(() => import('./ProductDetails'));
const Checkout = lazy(() => import('./Checkout'));

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/checkout" element={<Checkout />} />
      </Routes>
    </Suspense>
  );
}
```

> Here route-level splitting is handled by TanStack Router; use `lazy` + `Suspense` for heavy, rarely-used widgets.

## TypeScript Best Practices

### Proper Typing

```tsx
// ✅ Good: Specific types, no any
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
}

export function Button({
  variant = 'primary',
  size = 'medium',
  children,
  onClick,
  disabled = false,
  ariaLabel,
}: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}

// ✅ Good: Type event handlers properly
interface FormProps {
  onSubmit: (data: FormData) => void;
}

export function Form({ onSubmit }: FormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" name="email" />
      <input type="password" name="password" />
      <button type="submit">Submit</button>
    </form>
  );
}
```

> Project rules: use `import type` for types; API types come from `@/apis/<domain>`; prefer `type XxxUiProps = {...}` for props; real forms use RHF + zod (`FormWrapper`, `@/components/form-fields/*`) instead of manual `FormData`.

## Testing Patterns

Vitest + React Testing Library. Test each layer in isolation: hook (`renderHook`), `-ui` component (render with props, assert callbacks), container (wiring, mocked providers), schema (pure unit tests).

### React Testing Library

```tsx
// ✅ Good: Test user behavior, not implementation
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from './UserProfile';

describe('UserProfile', () => {
  it('displays user data after loading', async () => {
    render(<UserProfile userId="123" />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading...');

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /john doe/i })).toBeInTheDocument();
    });
  });

  it('allows editing user name', async () => {
    const user = userEvent.setup();
    render(<UserProfile userId="123" />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /john doe/i })).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    const nameInput = screen.getByLabelText(/name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Jane Doe');

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /jane doe/i })).toBeInTheDocument();
    });
  });

  it('shows error message when fetch fails', async () => {
    server.use(
      rest.get('/api/users/123', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    render(<UserProfile userId="123" />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/error/i);
    });
  });
});
```

### Testing Custom Hooks

```tsx
// ✅ Good: Test custom hooks in isolation
import { renderHook, waitFor } from '@testing-library/react';
import { useFetch } from './useFetch';

describe('useFetch', () => {
  it('fetches data successfully', async () => {
    const { result } = renderHook(() => useFetch('/api/users'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockUsers);
    expect(result.current.error).toBeNull();
  });

  it('handles fetch error', async () => {
    const { result } = renderHook(() => useFetch('/api/invalid'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.data).toBeNull();
  });

  it('respects enabled option', () => {
    renderHook(() => useFetch('/api/users', { enabled: false }));

    expect(fetch).not.toHaveBeenCalled();
  });
});
```

## Accessibility

### Semantic HTML and ARIA

```tsx
// ✅ Good: Semantic HTML with proper ARIA
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="modal-overlay"
      onClick={onClose}
    >
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <header>
          <h2 id="modal-title">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="close-button"
          >
            ×
          </button>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
```

> In this repo prefer the shadcn/Radix `Dialog` (`@/components/ui/dialog`), which already handles focus trap, Escape and `aria-*`; the hand-rolled version above is the reference for what it must provide.

### Form Accessibility

```tsx
// ✅ Good: Accessible form with labels and error messages
interface InputFieldProps {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
}

export function InputField({
  id,
  label,
  error,
  required = false,
}: InputFieldProps) {
  return (
    <div className="form-field">
      <label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <input
        id={id}
        name={id}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <span id={`${id}-error`} role="alert" className="error-message">
          {error}
        </span>
      )}
    </div>
  );
}
```

> Real fields come from `@/components/form-fields/*` (`FormInput`, `FormSelect`, ...), which wrap this pattern.

## State Management

### Keep State Minimal

```tsx
// ✅ Good: Minimal state, compute derived values
interface ShoppingCartProps {
  items: CartItem[];
}

export function ShoppingCart({ items }: ShoppingCartProps) {
  // ✅ Good: Compute derived values during render
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const hasItems = items.length > 0;

  return (
    <div>
      <p>Items: {itemCount}</p>
      <p>Total: ${total}</p>
      {hasItems ? <Checkout /> : <EmptyCart />}
    </div>
  );
}
```

### State Colocation

```tsx
// ✅ Good: Colocate state to where it's needed
function ProductList() {
  const [products] = useFetch<Product[]>('/api/products');
  
  return (
    <div>
      {products?.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  // ✅ Good: State only where needed
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div>
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      {isExpanded && <ProductDetails product={product} />}
      <button onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? 'Show Less' : 'Show More'}
      </button>
    </div>
  );
}
```

Server data lives in TanStack Query (not `useState`); URL-driven state (filters, pagination, sort) lives in router search params.

## Error Handling

### Error Boundaries

```tsx
// ✅ Good: Error boundary for graceful failures
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error?: Error }> },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback || DefaultErrorFallback;
      return <Fallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

// Usage
function App() {
  return (
    <ErrorBoundary fallback={ProductErrorFallback}>
      <ProductList />
    </ErrorBoundary>
  );
}
```

API errors are surfaced by the HTTP instance / mutation layer + `toast`; hooks handle the success path and domain-specific messages. For route-level render failures prefer the router `errorComponent`.

## Project Structure

### Overall `src/` organization

```
src/
├── modules/             # Feature modules (containers / hooks / components) — see Project Architecture
│   └── <feature>/
├── routes/              # TanStack file routes (thin: path + validateSearch + component)
├── components/          # Shared, domain-agnostic components
│   ├── ui/              # shadcn primitives (Button, Card, Dialog, ...)
│   ├── form-fields/     # RHF-bound fields (FormInput, FormSelect, ...)
│   ├── containers/      # Shared wrappers (PageContainer, LoadingContainer, ...)
│   ├── layouts/         # App layouts
│   └── utilities/       # Show, HStack, VStack
├── hooks/               # Generic custom hooks (use-copy, use-debounce, ...)
├── apis/                # API layer per domain (requests, queries, keys, types, index)
├── integrations/        # i18n, tanstack-query, auth, dialog providers
├── stores/ contexts/    # Global state
├── constant/ utils/ lib/ types/
└── styles.css           # Design tokens
```

## Common Pitfalls to Avoid

### ❌ Bad: Effects as Second Rendering System

```tsx
// ❌ Bad: Computing derived state in effect
function ShoppingCart({ items }: { items: CartItem[] }) {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setTotal(items.reduce((sum, item) => sum + item.price, 0));
  }, [items]);

  return <div>Total: ${total}</div>;
}

// ✅ Good: Compute during render
function ShoppingCart({ items }: { items: CartItem[] }) {
  const total = items.reduce((sum, item) => sum + item.price, 0);
  return <div>Total: ${total}</div>;
}
```

### ❌ Bad: Missing Cleanup

```tsx
// ❌ Bad: Memory leak from unsubscribed event listener
function WindowTracker() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    window.addEventListener('resize', () => {
      setWidth(window.innerWidth);
    });
  }, []);

  return <div>Window width: {width}</div>;
}

// ✅ Good: Proper cleanup
function WindowTracker() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <div>Window width: {width}</div>;
}
```

### ❌ Bad: Array/Object in Dependencies

```tsx
// ❌ Bad: Object reference changes every render
function UserProfile({ userId }: { userId: string }) {
  const config = { timeout: 5000, retries: 3 };

  useEffect(() => {
    fetchUser(userId, config);
  }, [userId, config]); // config changes every render!

  return <div>...</div>;
}

// ✅ Good: Stable reference or primitive values
function UserProfile({ userId }: { userId: string }) {
  useEffect(() => {
    const config = { timeout: 5000, retries: 3 };
    fetchUser(userId, config);
  }, [userId]);

  return <div>...</div>;
}
```

### ❌ Bad: Logic inside UI components / containers (architecture)

```tsx
// ❌ Bad: -ui component fetching and mutating
const OrderActionsUi = ({ order }: { order: IOrder }) => {
  const cancelMutation = useCancelOrderMutation();
  const onCancel = async () => {
    await cancelMutation.mutateAsync({ id: order.id });
    toast.success('Cancelled');
  };
  return <Button onClick={onCancel}>Cancel</Button>;
};

// ✅ Good: logic in container/hook, UI receives props
const OrderActionsUi = ({ onCancel, isCancelling }: OrderActionsUiProps) => (
  <Button onClick={onCancel} disabled={isCancelling}>{t('buttons.cancel')}</Button>
);
```

Effect-related extras: use `useEffectEvent` for effect callbacks that must read the latest values without re-triggering; in React 19 pass `ref` as a prop (no `forwardRef`).

## Commands

Run these commands for quality checks:

```bash
# Use the project's own scripts (see BACKBONE.md Commands / package.json). Typical:
npm run lint          # lint (Biome or ESLint)
npm run format        # formatter
npm run test          # unit tests + React Testing Library
npm run build         # build + typecheck
```

## Examples

### Reading order for an existing feature

Open one feature in `src/modules/` and follow the one-way flow: route → `*-container` → `use-*-container` hook (+ `schema.ts`) → `*-ui`. For the API layer see `src/apis/<domain>`. Copy the closest existing feature (form/dialog, table with URL-state pagination, row actions) instead of inventing a new shape.

## Additional Resources

- [React Documentation](https://react.dev) - Official docs with modern patterns
- [Vercel React Best Practices](https://vercel.com/blog/introducing-react-best-practices) - Performance framework
- [React Testing Library](https://testing-library.com/react) - Testing guidelines
- [WebAIM](https://webaim.org) - Accessibility guidelines
