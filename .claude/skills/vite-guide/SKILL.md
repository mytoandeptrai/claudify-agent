---
name: vite-guide
description: Optimize Vite projects for maximum performance. Use when configuring Vite, improving dev server speed, optimizing builds, or when the user mentions Vite, vite.config, build performance, or HMR issues.
---

# Vite Best Practices

## Quick Start

When working with Vite projects:

1. **Check configuration** - Review vite.config.js for performance issues
2. **Audit plugins** - Identify slow plugins or heavy operations
3. **Optimize imports** - Remove barrel files, use explicit extensions
4. **Configure warmup** - Pre-transform frequently used files
5. **Profile if slow** - Use `vite --profile` to identify bottlenecks

## Configuration Fundamentals

### Use defineConfig

Always use the `defineConfig` helper for TypeScript intelligence:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  // ... config options
})
```

### Plugin Selection

**Preferred**: Use `@vitejs/plugin-react-swc` instead of `@vitejs/plugin-react` for 6-8x faster HMR.

```javascript
// ✅ Good - SWC-based (fast)
import react from '@vitejs/plugin-react-swc'

// ❌ Avoid - Babel-based (slower)
import react from '@vitejs/plugin-react'
```

## Performance Optimization

### Development Server Speed

#### 1. Replace Babel with SWC

Switch to SWC for dramatically faster transformations:

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
})
```

**Impact**: Reduces HMR transformation from 3-4s to <500ms.

#### 2. Avoid Barrel Files

Barrel files force Vite to process thousands of modules unnecessarily.

```javascript
// ❌ Bad - Barrel file import
import { slash, formatDate, debounce } from './utils'

// ✅ Good - Direct imports
import { slash } from './utils/slash.js'
import { formatDate } from './utils/formatDate.js'
import { debounce } from './utils/debounce.js'
```

**Why**: Barrel files (index.js re-exporting everything) require loading all files even when you need one function.

#### 3. Use Explicit Import Extensions

Enable TypeScript bundler module resolution and use explicit extensions:

```json
// tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true
  }
}
```

```typescript
// ✅ Good - Explicit extension
import { Component } from './Component.jsx'

// ❌ Avoid - Implicit extension (requires 6+ filesystem checks)
import { Component } from './Component'
```

#### 4. Configure File Warmup

Pre-transform frequently used files to avoid request waterfalls:

```javascript
// vite.config.js
export default defineConfig({
  server: {
    warmup: {
      clientFiles: [
        './src/main.jsx',
        './src/App.jsx',
        './src/components/BigComponent.jsx',
        './src/utils/big-utils.js',
      ],
    },
  },
})
```

**How to find files to warmup**: Run `vite --debug transform` and look for files with >100ms transform time.

#### 5. Optimize Dependency Pre-bundling

Control which dependencies are pre-bundled:

```javascript
// vite.config.js
export default defineConfig({
  optimizeDeps: {
    include: ['lodash-es', 'axios'], // Force pre-bundling
    exclude: ['@custom/large-lib'], // Skip pre-bundling
    entries: ['./src/**/*.jsx'], // Custom entry points
  },
})
```

### Build Optimization

#### 1. Manual Chunking

Avoid single large bundle by implementing manual chunks:

```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['lodash-es', 'dayjs'],
        },
      },
    },
  },
})
```

#### 2. CSS Optimization

Use native tooling when possible:

```javascript
// vite.config.js
export default defineConfig({
  css: {
    transformer: 'lightningcss', // Experimental but faster
    lightningcssOptions: {
      minify: true,
    },
  },
})
```

**Alternative**: Stick with PostCSS for better compatibility.

#### 3. Asset Handling

**Preferred**: Import SVGs as URLs, not components:

```javascript
// ✅ Good - URL import
import logo from './logo.svg'
<img src={logo} alt="Logo" />

// ❌ Avoid - SVG as component (slower)
import { ReactComponent as Logo } from './logo.svg'
<Logo />
```

## Plugin Audit Practices

### Slow Plugin Detection

Identify slow plugins using debug mode:

```bash
# See transform times
vite --debug plugin-transform

# Profile entire build
vite --profile
# Press 'p + enter' to generate .cpuprofile
```

### Plugin Best Practices

When evaluating community plugins:

1. **Check hooks**: Avoid plugins with heavy `buildStart`, `config`, or `configResolved` hooks
2. **Dynamic imports**: Large dependencies should be dynamically imported
3. **Conditional transforms**: Plugins should check file extensions before transforming

**Example optimization** (for plugin authors):

```javascript
// ✅ Good - Check before transform
transform(code, id) {
  if (!id.endsWith('.jsx')) return null
  if (!code.includes('useState')) return null
  // ... transformation
}

// ❌ Bad - Always transform
transform(code, id) {
  // ... heavy transformation
}
```

## Common Performance Issues

### Issue 1: Slow Dev Server Start

**Symptoms**: Server takes >5s to start.

**Fixes**:
1. Check for plugins with heavy `config` hooks
2. Reduce `optimizeDeps.include` to essentials only
3. Use `@vitejs/plugin-react-swc` instead of Babel
4. Run `vite --profile` to identify bottlenecks

### Issue 2: Slow HMR Updates

**Symptoms**: Changes take >1s to reflect in browser.

**Fixes**:
1. Remove barrel file imports
2. Disable "Disable Cache" in Chrome DevTools Network tab
3. Check browser extensions (test in incognito mode)
4. Warm up frequently changed files

### Issue 3: Large Production Bundles

**Symptoms**: Main chunk >500KB gzipped.

**Fixes**:
1. Implement manual chunking
2. Check for accidentally bundled node_modules
3. Use dynamic imports for heavy components
4. Analyze bundle with `npm run build -- --sourcemap`

### Issue 4: Slow Full Page Reloads

**Symptoms**: Full reload takes >3s.

**Fixes**:
1. Ensure browser cache is enabled (not disabled in DevTools)
2. Reduce number of transformed files
3. Avoid transforming SVGs to components
4. Use CSS instead of Sass/Less when possible

## Profiling and Debugging

### Debug Commands

```bash
# Profile startup and transformations
vite --profile

# See detailed transform timings
vite --debug plugin-transform

# Debug resolve operations
vite --debug resolve

# Check transform cache
vite --debug transform
```

### Analyzing CPU Profiles

1. Run `vite --profile`
2. Use the app normally
3. Press `p + enter` in terminal
4. Open `.cpuprofile` in [speedscope.app](https://www.speedscope.app/)
5. Look for:
   - Long-running hooks (`buildStart`, `config`)
   - Slow transformations (>100ms)
   - Excessive resolve operations

### Performance Checklist

Before considering a Vite project optimized:

- [ ] Using `@vitejs/plugin-react-swc` (for React projects)
- [ ] No barrel file imports in critical path
- [ ] Explicit import extensions enabled
- [ ] Frequently used files warmed up
- [ ] Browser cache enabled in DevTools
- [ ] Manual chunking configured for build
- [ ] No heavy operations in plugin hooks
- [ ] Profiled with `vite --profile` (no major bottlenecks)

## Commands

**Profile Vite**: Run profiling to identify performance issues
**Optimize config**: Review and optimize vite.config.js
**Fix HMR**: Diagnose and fix slow HMR updates
**Audit plugins**: Check for slow community plugins

## Examples

### Example 1: Optimized vite.config.js

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true }), // Analyze bundle
  ],
  
  server: {
    warmup: {
      clientFiles: [
        './src/main.jsx',
        './src/App.jsx',
      ],
    },
  },
  
  optimizeDeps: {
    include: ['lodash-es', 'axios'],
  },
  
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['lodash-es', 'dayjs'],
        },
      },
    },
  },
})
```

### Example 2: Fixing Barrel File Imports

**Before** (slow):

```javascript
// src/App.jsx
import { Button, Input, Modal } from './components'
import { formatDate, validateEmail } from './utils'
```

**After** (fast):

```javascript
// src/App.jsx
import { Button } from './components/Button.jsx'
import { Input } from './components/Input.jsx'
import { Modal } from './components/Modal.jsx'
import { formatDate } from './utils/formatDate.js'
import { validateEmail } from './utils/validateEmail.js'
```

### Example 3: Diagnosing Slow HMR

**User**: "My HMR is taking 3-4 seconds to update"

**Agent Response**:
"I'll diagnose the slow HMR issue. Let me check:

1. **Browser setup**: Is 'Disable Cache' checked in DevTools?
   - Fix: Uncheck it in Network tab

2. **Plugin audit**: Running `vite --debug plugin-transform`
   - Looking for transforms >100ms

3. **Import patterns**: Checking for barrel files
   - Found: `import { X } from './utils'` in 5 files
   - Fix: Use direct imports

4. **Plugin choice**: Using `@vitejs/plugin-react`?
   - Fix: Switch to `@vitejs/plugin-react-swc`

Let me start by checking your vite.config.js and running a profile..."

## Additional Resources

- [Vite Performance Guide](https://vitejs.dev/guide/performance/)
- [Vite Config Reference](https://vitejs.dev/config/)
- [speedscope.app](https://www.speedscope.app/) - CPU profile viewer
- [rollup-plugin-visualizer](https://github.com/btd/rollup-plugin-visualizer) - Bundle analyzer

## Anti-Patterns to Avoid

### 1. Windows-Style Paths
- ✅ Use: `./src/components/Button.jsx`
- ❌ Avoid: `.\src\components\Button.jsx`

### 2. Too Many Warmup Files
```javascript
// ❌ Bad - Overloads dev server
warmup: {
  clientFiles: ['./src/**/*'] // All files!
}

// ✅ Good - Only critical files
warmup: {
  clientFiles: [
    './src/main.jsx',
    './src/App.jsx',
  ]
}
```

### 3. Time-Sensitive Configuration
```javascript
// ❌ Bad - Will become outdated
// "Use Vite 5.0 features before 2026"

// ✅ Good - Use current stable features
// Use manualChunks for code splitting
```
