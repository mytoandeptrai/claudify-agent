---
name: react-guide
description: Apply React best practices including modern patterns, hooks, TypeScript, performance optimization, and testing. Use when writing, reviewing, or refactoring React code.
---

# React Best Practices

## Quick Start

When working with React code, follow these core principles:

1. **Modern Patterns**: Use hooks and function components (no class components)
2. **TypeScript**: Add proper types, avoid `any`
3. **Server Components**: Use RSC for data fetching when possible
4. **Performance**: Prevent re-renders, code-split, optimize bundles
5. **Testing**: Use React Testing Library with user-behavior queries
6. **Accessibility**: Build accessible components by default

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

## Testing Patterns

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

## Project Structure

### Component Organization

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Modal.tsx
│   ├── forms/           # Form components
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   └── Form.tsx
│   └── layout/          # Layout components
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── Layout.tsx
├── hooks/               # Custom hooks
│   ├── useFetch.ts
│   ├── useLocalStorage.ts
│   └── useDebounce.ts
├── lib/                 # Utilities
│   ├── api.ts
│   └── utils.ts
├── types/               # TypeScript types
│   └── index.ts
└── pages/               # Page components (Next.js)
    ├── index.tsx
    └── products/
        └── [id].tsx
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

## Commands

Run these commands for quality checks:

```bash
npm run lint          # ESLint with React hooks plugin
npm run typecheck     # TypeScript compiler
npm run test          # Jest + React Testing Library
npm run build         # Production build with optimizations
```

## Examples

### User Authentication Flow

See: `@src/components/auth/LoginForm.tsx` for login pattern
See: `@src/hooks/useAuth.ts` for authentication hook pattern
See: `@src/components/auth/ProtectedRoute.tsx` for route protection

### Data Fetching Pattern

See: `@src/hooks/useFetch.ts` for generic fetch hook
See: `@src/components/products/ProductList.tsx` for server component pattern
See: `@src/lib/api.ts` for API client setup

### Form Handling

See: `@src/components/forms/ContactForm.tsx` for controlled form pattern
See: `@src/components/forms/FormField.tsx` for accessible input pattern

## Additional Resources

- [React Documentation](https://react.dev) - Official docs with modern patterns
- [Vercel React Best Practices](https://vercel.com/blog/introducing-react-best-practices) - Performance framework
- [React Testing Library](https://testing-library.com/react) - Testing guidelines
- [WebAIM](https://webaim.org) - Accessibility guidelines
