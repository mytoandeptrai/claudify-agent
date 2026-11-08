# React & State Management Mastery

## Architecture Rules
1. **Single Source of Truth:** Keep state as close to where it is consumed as possible.
2. **State Elevation:** Only elevate state to global store (Zustand, Context) when shared across distant siblings.
3. **Pure Components:** Keep rendering pure. Side effects belong strictly in `useEffect` or event handlers.
4. **Custom Hooks:** Extract reusable component logic and state handling into `use[Feature]` custom hooks.

## Performance Checklist
- Memoize expensive calculations with `useMemo`.
- Avoid premature optimization; profile render frequency before adding `useCallback` everywhere.
- Always provide stable, unique `key` props (never use array index for dynamic/reorderable lists).
