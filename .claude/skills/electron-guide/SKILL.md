---
name: electron-guide
description: Apply ElectronJS best practices for security, performance, and maintainability. Use when building, reviewing, or optimizing Electron desktop applications.
---

# ElectronJS Best Practices

## Quick Start

When working with Electron applications, follow these core principles:

1. **Security First**: Enable context isolation, sandbox mode, disable Node integration
2. **Performance**: Profile before optimizing, avoid blocking main/renderer processes
3. **Modern Architecture**: Use preload scripts with contextBridge for secure IPC
4. **Code Quality**: Bundle code, defer loading, minimize dependencies
5. **Testing**: Test security configurations and IPC communication

## Security Configuration

### Mandatory Security Settings (Electron 20+)

**Always enable these in BrowserWindow options**:[1][2]

```typescript
// ✅ Good: Secure window configuration
const mainWindow = new BrowserWindow({
  webPreferences: {
    contextIsolation: true,      // Run preload in separate context
    nodeIntegration: false,      // Disable Node.js in renderer
    sandbox: true,               // Enable Chromium sandbox
    webSecurity: true,           // Enable web security features
    allowRunningInsecureContent: false,
    experimentalFeatures: false
  }
})
```

**Critical Security Rules**:[2][3]

1. **Never enable Node integration with remote code**
2. **Always validate IPC inputs** in main process
3. **Use Content Security Policy (CSP)**
4. **Expose only specific APIs** via contextBridge

### Secure IPC Pattern

**Preload Script (preload.ts)**:[2]

```typescript
import { contextBridge, ipcRenderer } from 'electron'

// ✅ Good: Expose specific, validated APIs only
contextBridge.exposeInMainWorld('electronAPI', {
  // Typed methods for sending
  send: (channel: string, data: unknown) => {
    const validChannels = ['to-main-process', 'user-action']
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data)
    }
  },
  
  // Typed methods for receiving
  on: (channel: string, func: (...args: unknown[]) => void) => {
    const validChannels = ['from-main-process', 'data-update']
    if (validChannels.includes(channel)) {
      // Strip event data for security
      ipcRenderer.on(channel, (_event, ...args) => func(...args))
    }
  },
  
  // Specific API calls instead of full IPC access
  getUserData: async () => {
    return await ipcRenderer.invoke('get-user-data')
  },
  
  saveFile: async (path: string, content: string) => {
    // Validate inputs before sending
    if (typeof path !== 'string' || typeof content !== 'string') {
      throw new Error('Invalid arguments')
    }
    return await ipcRenderer.invoke('save-file', { path, content })
  }
})
```

**Main Process (main.ts)**:[2]

```typescript
import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'

// ✅ Good: Validate all IPC inputs
ipcMain.handle('save-file', async (_event, { path, content }) => {
  // Validate path is within allowed directory
  const allowedDir = app.getPath('userData')
  const resolvedPath = path.resolve(path)
  
  if (!resolvedPath.startsWith(allowedDir)) {
    throw new Error('Invalid file path')
  }
  
  // Validate content
  if (typeof content !== 'string' || content.length > MAX_FILE_SIZE) {
    throw new Error('Invalid content')
  }
  
  // Safe to proceed
  await fs.promises.writeFile(resolvedPath, content)
  return { success: true }
})
```

### Content Security Policy

**Set CSP in main process**:[1][3]

```typescript
const session = mainWindow.webContents.session

// ✅ Good: Restrictive CSP
session.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "connect-src 'self' https://api.example.com"
      ]
    }
  })
})
```

## Performance Optimization

### Measure First

**Profile before optimizing**:[4]

1. Use Chrome DevTools Performance tab
2. Use Chrome Tracing for multi-process analysis
3. Identify actual bottlenecks, don't guess

```bash
# Profile startup performance
electron --js-flags="--prof" your-app

# Generate heap snapshot
electron --js-flags="--heap-prof" your-app
```

### Performance Checklist

**Apply these optimizations**:[4]

### 1. Minimize Dependencies

```typescript
// ❌ Bad: Loading heavy module unnecessarily
const request = require('request')  // Large, slow to load

// ✅ Good: Use lighter alternatives or built-in
const fetch = require('node-fetch')  // Smaller, faster
// Or use Chromium's built-in fetch in renderer
```

**Before adding any module**:[4]
- Check dependency size
- Measure load time with `--cpu-prof --heap-prof`
- Consider if built-in APIs work instead

### 2. Defer Loading

```typescript
// ❌ Bad: Eager loading
const fooParser = require('foo-parser')
const heavyModule = require('heavy-module')

class Parser {
  constructor() {
    this.files = fs.readdirSync('.')
  }
}

// ✅ Good: Lazy loading
class Parser {
  async getFiles() {
    // Load only when needed
    this.files = this.files || await fs.promises.readdir('.')
    return this.files
  }
  
  async getParsedFiles() {
    // Defer expensive module load
    const fooParser = await import('foo-parser')
    const files = await this.getFiles()
    return fooParser.parse(files)
  }
}
```

### 3. Avoid Blocking Main Process

```typescript
// ❌ Bad: Blocking main process
ipcMain.handle('heavy-computation', async () => {
  const result = heavyCalculation()  // Blocks UI
  return result
})

// ✅ Good: Use worker threads
import { Worker } from 'worker_threads'

ipcMain.handle('heavy-computation', async (data) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./worker.ts', { workerData: data })
    worker.on('message', resolve)
    worker.on('error', reject)
  })
})
```

**Main Process Rules**:[4]
- Never block with synchronous operations
- Use async file I/O (`fs.promises`)
- Offload CPU-heavy work to workers
- Avoid synchronous IPC

### 4. Optimize Renderer Process

```typescript
// ✅ Good: Use requestIdleCallback for low-priority work
requestIdleCallback(() => {
  performLowPriorityTask()
}, { timeout: 2000 })

// ✅ Good: Use Web Workers for heavy tasks
const worker = new Worker('./heavy-task.worker.ts')
worker.postMessage(data)
worker.onmessage = (event) => {
  handleResult(event.data)
}
```

**Renderer Optimization**:[4]
- Use `requestIdleCallback()` for background tasks
- Use Web Workers for CPU-intensive work
- Avoid large synchronous operations
- Don't block animation frame

### 5. Remove Unnecessary Polyfills

```typescript
// ❌ Bad: Unnecessary polyfill in Electron
import 'regenerator-runtime/runtime'  // Electron supports async/await
import jQuery from 'jquery'  // Most jQuery features in vanilla JS

// ✅ Good: Use built-in features
// Electron's Chromium includes modern JavaScript features
// Check caniuse.com for specific feature support
```

**Check Before Polyfilling**:[4]
- Electron's Chromium version supports most modern features
- Check [caniuse.com](https://caniuse.com/)
- Remove jQuery if using vanilla JS methods

### 6. Bundle Code

```typescript
// ✅ Good: Use bundler (Webpack, Vite, Parcel)
// webpack.config.js
module.exports = {
  mode: 'production',
  entry: './src/main.ts',
  output: {
    filename: 'bundle.js',
    path: __dirname + '/dist'
  },
  target: 'electron-main',
  module: {
    rules: [{ test: /\.ts$/, use: 'ts-loader' }]
  }
}
```

**Benefits**:[4]
- Single `require()` call instead of many
- Faster startup time
- Better tree-shaking

### 7. Optimize Menu Loading

```typescript
import { app, Menu } from 'electron'

// ✅ Good: Remove default menu if not needed
app.whenReady().then(() => {
  Menu.setApplicationMenu(null)
  createWindow()
})
```

**Call before `app.ready`** if you don't need the default menu.[4]

## Project Structure

### Recommended Layout

```
electron-app/
├── src/
│   ├── main/                 # Main process code
│   │   ├── index.ts          # Entry point
│   │   ├── window-manager.ts # Window management
│   │   ├── ipc-handlers.ts   # IPC handlers
│   │   └── app-menu.ts       # Menu setup
│   ├── preload/              # Preload scripts
│   │   └── index.ts          # Secure bridge API
│   ├── renderer/             # Renderer process (React/Vue/etc)
│   │   ├── index.tsx         # UI entry point
│   │   ├── components/       # UI components
│   │   └── hooks/            # Custom hooks for IPC
│   └── shared/               # Shared types/utils
│       └── types.ts
├── tests/
│   ├── main/                 # Main process tests
│   ├── renderer/             # Renderer tests
│   └── e2e/                  # End-to-end tests
├── build/                    # Build configuration
│   └── electron-builder.yml
├── package.json
├── tsconfig.json
├── vite.config.ts (or webpack.config.js)
└── playwright.config.ts (for e2e)
```

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "types": ["node", "electron"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## Testing

### Security Testing

```typescript
// tests/security.test.ts
import { describe, it, expect } from 'vitest'
import { BrowserWindow } from 'electron'

describe('Security Configuration', () => {
  it('should have context isolation enabled', () => {
    const window = new BrowserWindow({
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true
      }
    })
    
    const prefs = window.webContents.getWebPreferences()
    expect(prefs.contextIsolation).toBe(true)
    expect(prefs.nodeIntegration).toBe(false)
  })
  
  it('should not allow remote module', () => {
    // Remote module is deprecated and dangerous
    const window = new BrowserWindow()
    expect(window.webContents.getWebPreferences().enableRemoteModule).toBe(false)
  })
})
```

### IPC Testing

```typescript
// tests/ipc.test.ts
import { ipcMain, ipcRenderer } from 'electron'
import { describe, it, expect, beforeEach } from 'vitest'

describe('IPC Communication', () => {
  beforeEach(() => {
    // Clear all handlers
    ipcMain.removeHandler('test-handler')
  })
  
  it('should validate input before processing', async () => {
    ipcMain.handle('save-file', async (_event, data) => {
      if (!data.path || typeof data.path !== 'string') {
        throw new Error('Invalid path')
      }
      return { success: true }
    })
    
    // Should reject invalid input
    await expect(
      ipcRenderer.invoke('save-file', { path: null })
    ).rejects.toThrow('Invalid path')
  })
})
```

### Performance Testing

```typescript
// tests/performance.test.ts
import { describe, it, expect } from 'vitest'

describe('Performance', () => {
  it('should start under 2 seconds', async () => {
    const startTime = performance.now()
    
    const app = new Application()
    await app.start()
    await app.waitForWindow()
    
    const endTime = performance.now()
    const startupTime = endTime - startTime
    
    expect(startupTime).toBeLessThan(2000)
  })
  
  it('should use less than 200MB memory at idle', async () => {
    const app = new Application()
    await app.start()
    await app.waitForIdle()
    
    const memoryUsage = process.memoryUsage()
    const memoryMB = memoryUsage.heapUsed / 1024 / 1024
    
    expect(memoryMB).toBeLessThan(200)
  })
})
```

## Commands

/electron-guide-security-audit: Review security configuration and IPC handlers
/electron-guide-optimize: Profile and suggest performance optimizations
/electron-guide-structure: Set up recommended project structure
/electron-guide-test: Run security and performance tests

## Anti-Patterns to Avoid

### ❌ Bad: Disabling Security Features

```typescript
// ❌ NEVER DO THIS
const window = new BrowserWindow({
  webPreferences: {
    contextIsolation: false,  // DANGEROUS
    nodeIntegration: true,    // DANGEROUS
    sandbox: false,           // DANGEROUS
    webSecurity: false,       // DANGEROUS
    allowRunningInsecureContent: true  // DANGEROUS
  }
})
```

### ❌ Bad: Exposing Full IPC Access

```typescript
// ❌ Bad: Exposing entire ipcRenderer
contextBridge.exposeInMainWorld('electronAPI', {
  ipcRenderer: ipcRenderer  // DANGEROUS: Full access!
})

// ✅ Good: Expose specific methods only
contextBridge.exposeInMainWorld('electronAPI', {
  send: (channel, data) => { /* validated */ },
  receive: (channel, func) => { /* validated */ }
})
```

### ❌ Bad: Blocking Main Process

```typescript
// ❌ Bad: Synchronous file I/O
ipcMain.handle('read-file', (event, path) => {
  return fs.readFileSync(path, 'utf-8')  // Blocks UI
})

// ✅ Good: Asynchronous file I/O
ipcMain.handle('read-file', async (event, path) => {
  return await fs.promises.readFile(path, 'utf-8')
})
```

### ❌ Bad: Not Validating IPC Input

```typescript
// ❌ Bad: Trusting renderer input
ipcMain.handle('delete-file', (event, path) => {
  fs.unlinkSync(path)  // DANGEROUS: No validation!
})

// ✅ Good: Validate and sanitize
ipcMain.handle('delete-file', async (event, path) => {
  const allowedDir = app.getPath('userData')
  const resolvedPath = path.resolve(path)
  
  if (!resolvedPath.startsWith(allowedDir)) {
    throw new Error('Access denied')
  }
  
  await fs.promises.unlink(resolvedPath)
})
```

## Examples

### Example 1: Secure Window Setup

User: "Create a new BrowserWindow with proper security"

Agent:
1. Create window with security settings enabled
2. Set up preload script with contextBridge
3. Configure CSP headers
4. Verify settings with security audit

Follow patterns from security configuration section.

### Example 2: Performance Optimization

User: "App startup is slow, optimize it"

Agent:
1. Profile startup with `--cpu-prof --heap-prof`
2. Identify slow module loads
3. Defer non-critical initialization
4. Bundle code with Webpack/Vite
5. Remove unnecessary dependencies
6. Re-profile and verify improvement

### Example 3: IPC Implementation

User: "Add file saving feature"

Agent:
1. Define secure API in preload script
2. Create IPC handler in main process
3. Validate path (within allowed directory)
4. Validate content (type, size limits)
5. Use async file I/O
6. Add error handling
7. Test with invalid inputs

## Additional Resources

- [Electron Security Guide](https://www.electronjs.org/docs/latest/tutorial/security)
- [Electron Performance Guide](https://www.electronjs.org/docs/latest/tutorial/performance)
- [Electron Security Checklist](https://www.electronjs.org/docs/latest/tutorial/security#security-checklist)
- [OWASP Electron Guidelines](https://owasp.org/www-project-electron-security-guidelines/)

## Notes

- **Electron Version**: These practices target Electron 20+ (latest stable as of 2026)
- **Default Security**: Electron 20+ enables context isolation, nodeIntegration disabled, and sandbox by default
- **Remote Module**: Deprecated since Electron 12, completely removed in Electron 14+
- **Performance Baseline**: Modern Electron 34+ achieves <500ms cold start with proper optimization
