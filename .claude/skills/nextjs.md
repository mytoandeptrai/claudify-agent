# Next.js 14+ / App Router Mastery Skill

## Core Principles
1. **Server Components by Default:** Keep components as React Server Components (RSC) unless interactivity (hooks, state, browser events) is strictly required.
2. **Client Components Boundary:** Push `'use client'` to the leaf nodes of the component tree to maximize server-side performance.
3. **Data Fetching:** Fetch data directly inside Server Components using async/await. Avoid `useEffect` for data loading.
4. **Server Actions:** Use Server Actions for mutations. Always validate incoming inputs with Zod before database operations.
5. **Route Handlers:** Place API endpoints in `app/api/[route]/route.ts`. Return typed `NextResponse.json(...)`.

## Anti-Patterns to Avoid
- ❌ Do NOT add `'use client'` to top-level page components (`page.tsx`) just to use a small client button.
- ❌ Do NOT leak secrets or database queries into Client Components.
- ❌ Do NOT use `router.refresh()` in loops.
