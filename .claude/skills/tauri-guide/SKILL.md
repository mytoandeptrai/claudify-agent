---
name: tauri-guide
description: Build secure and performant Tauri desktop applications with Rust backends. Covers security architecture, trust boundaries, CSP, capabilities, IPC patterns, and development workflow. Use when building, reviewing, or optimizing Tauri applications.
---

# Tauri Best Practices

## Quick Start

When working with Tauri:

1. **Security First**: Understand trust boundaries between Rust core and WebView frontend
2. **Follow Principle of Least Privilege**: Use capabilities to restrict frontend access
3. **Configure CSP**: Restrict Content Security Policy to prevent XSS
4. **Use IPC Safely**: Validate all data passed between frontend and backend
5. **Keep Dependencies Updated**: Regularly audit Rust and Node.js dependencies

## Core Security Architecture

### Trust Boundaries

Tauri's security model differentiates between:

- **Rust Core**: Full OS access, runs plugins and backend commands
- **WebView Frontend**: Restricted access, communicates via IPC layer

**Critical Rule**: All data passed between boundaries must be validated and access-controlled.

```rust
// ✅ Good: Validate input in backend command
#[tauri::command]
async fn read_file(path: String) -> Result<String, String> {
    // Validate path is within allowed directory
    let safe_path = validate_path(&path)?;
    std::fs::read_to_string(&safe_path)
        .map_err(|e| e.to_string())
}

// ❌ Bad: No validation, direct file access
#[tauri::command]
async fn read_file(path: String) -> Result<String, String> {
    Ok(std::fs::read_to_string(&path)?) // Path traversal vulnerability!
}
```

### Capabilities System

Use capabilities to restrict frontend access to backend commands:

```json
{
  "identifier": "default",
  "description": "Default capabilities for the app",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "shell:allow-open",
    "fs:allow-read-text-file"
  ]
}
```

**Best Practices**:
- Start with minimal permissions
- Add permissions only when needed
- Use specific permissions (e.g., `fs:allow-read-text-file`) instead of broad ones
- Separate capabilities for different windows/views

### Content Security Policy (CSP)

Configure CSP in `tauri.conf.json` to prevent XSS:

```json
{
  "csp": {
    "default-src": "'self' customprotocol: asset:",
    "connect-src": "ipc: http://ipc.localhost",
    "font-src": "https://fonts.gstatic.com",
    "img-src": "'self' asset: http://asset.localhost blob: data:",
    "style-src": "'self' https://fonts.googleapis.com"
  }
}
```

**Rules**:
- Make CSP as restrictive as possible
- Only trust hosts you own or control
- Avoid `'unsafe-inline'` and `'unsafe-eval'`
- Tauri auto-appends nonces/hashes at compile time

## Development Workflow

### Project Structure

```
my-tauri-app/
├── src/                  # Frontend code
│   ├── components/
│   ├── lib/
│   └── App.tsx
├── src-tauri/            # Rust backend
│   ├── src/
│   │   ├── main.rs
│   │   ├── commands.rs
│   │   └── lib.rs
│   ├── capabilities/
│   │   └── default.json
│   ├── tauri.conf.json
│   └── Cargo.toml
├── package.json
└── vite.config.ts
```

### Essential Commands

```bash
# Development
npm run tauri dev        # Run dev server with hot reload
cargo check              # Check Rust code without building

# Build
npm run tauri build      # Build production app
cargo clippy             # Run Rust linter
cargo fmt                # Format Rust code

# Security
cargo audit              # Check Rust dependencies for vulnerabilities
npm audit                # Check Node.js dependencies
cargo vet                # Audit dependency tree (recommended)
```

### IPC Pattern (Frontend → Backend)

**Frontend (TypeScript)**:

```typescript
import { invoke } from '@tauri-apps/api/core'

// Call backend command
const content = await invoke<string>('read_file', { 
  path: 'config.json' 
})

// Handle errors
try {
  await invoke('sensitive_operation', { data })
} catch (error) {
  console.error('Backend error:', error)
}
```

**Backend (Rust)**:

```rust
use tauri::command;

#[command]
async fn read_file(path: String) -> Result<String, String> {
    // Validate and sanitize input
    let safe_path = validate_path(&path)
        .map_err(|e| format!("Invalid path: {}", e))?;
    
    // Execute operation
    std::fs::read_to_string(&safe_path)
        .map_err(|e| format!("IO error: {}", e))
}

// Register commands
tauri::generate_handler![read_file]
```

### Error Handling

**Return structured errors**:

```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub enum AppError {
    IoError(String),
    ValidationError(String),
    Unauthorized(String),
}

impl std::fmt::Display for AppError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            AppError::IoError(e) => write!(f, "IO error: {}", e),
            AppError::ValidationError(e) => write!(f, "Validation: {}", e),
            AppError::Unauthorized(e) => write!(f, "Unauthorized: {}", e),
        }
    }
}

#[command]
async fn process_data(input: String) -> Result<String, AppError> {
    if input.is_empty() {
        return Err(AppError::ValidationError("Input cannot be empty".into()));
    }
    // ... processing
}
```

**Frontend error handling**:

```typescript
interface AppError {
  IoError?: string;
  ValidationError?: string;
  Unauthorized?: string;
}

try {
  await invoke('process_data', { input })
} catch (error) {
  const appError = error as AppError;
  if (appError.ValidationError) {
    showWarning(appError.ValidationError);
  } else if (appError.Unauthorized) {
    redirectToLogin();
  }
}
```

## Performance Optimization

### Rust Backend

- **Use async/await**: For I/O operations to avoid blocking
- **Clone minimally**: Use references and `Arc` for shared state
- **Batch operations**: Reduce IPC calls by batching data
- **Use channels**: For high-frequency frontend-backend communication

```rust
// ✅ Good: Use Arc for shared state
use std::sync::Arc;
use tokio::sync::Mutex;

struct AppState {
    cache: Arc<Mutex<HashMap<String, String>>>,
}

#[command]
async fn get_cached(key: String, state: State<'_, AppState>) -> Option<String> {
    state.cache.lock().await.get(&key).cloned()
}
```

### Frontend

- **Debounce IPC calls**: Prevent flooding backend with requests
- **Use Tauri events**: For backend → frontend notifications
- **Lazy load plugins**: Only initialize when needed
- **Optimize bundle**: Use tree-shaking and code splitting

```typescript
// ✅ Good: Debounced file watcher
import { debounce } from 'lodash-es'

const watchFile = debounce(async (path: string) => {
  const content = await invoke('read_file', { path })
  updateUI(content)
}, 300)
```

## Security Checklist

Before deploying:

- [ ] CSP configured and restrictive
- [ ] Capabilities follow least privilege principle
- [ ] All backend commands validate input
- [ ] No hardcoded secrets in code
- [ ] Dependencies audited (`cargo audit`, `npm audit`)
- [ ] Development server disabled in production
- [ ] Error messages don't leak sensitive information
- [ ] File access restricted to allowed directories
- [ ] IPC payloads sanitized and validated

## Common Patterns

### File System Access

```rust
// Secure file access with base directory validation
use tauri::{api::path::BaseDirectory, Env};

#[command]
async fn read_config(app: AppHandle) -> Result<String, String> {
    let config_path = app
        .path_resolver()
        .resolve_resource("config.json", Some(BaseDirectory::AppData))?;
    
    std::fs::read_to_string(config_path)
        .map_err(|e| e.to_string())
}
```

### Database Access

```rust
// Use connection pool with sqlx
use sqlx::{SqlitePool, Row};

struct AppState {
    db: SqlitePool,
}

#[command]
async fn get_user(id: i32, state: State<'_, AppState>) -> Result<String, String> {
    let user = sqlx::query("SELECT name FROM users WHERE id = ?")
        .bind(id)
        .fetch_one(&state.db)
        .await
        .map_err(|e| e.to_string())?;
    
    Ok(user.get::<String, _>("name"))
}
```

### System Tray Integration

```rust
// Create system tray with menu
use tauri::{CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayEvent};

fn create_tray() -> SystemTray {
    let show = CustomMenuItem::new("show".to_string(), "Show");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    
    SystemTray::new().with_menu(
        SystemTrayMenu::new()
            .add_item(show)
            .add_item(quit)
    )
}

// Handle tray events
.on_system_tray_event(|app, event| match event {
    SystemTrayEvent::MenuItemClick { id, .. } => {
        match id.as_str() {
            "show" => {
                if let Some(window) = app.get_webview_window("main") {
                    window.show().unwrap();
                    window.set_focus().unwrap();
                }
            }
            "quit" => std::process::exit(0),
            _ => {}
        }
    }
    _ => {}
})
```

## Commands

/tauri-guide-security-review: Full security audit of Tauri app
/tauri-guide-setup: Initialize new Tauri project with best practices
/tauri-guide-optimize: Performance optimization recommendations

## Examples

### User: "Add file reading to my Tauri app"

**Agent Response**:
"I'll add secure file reading following Tauri best practices:

1. **Backend Command** (src-tauri/src/commands.rs):
   - Validate path to prevent directory traversal
   - Restrict to allowed directories
   - Return structured errors

2. **Capability** (src-tauri/capabilities/default.json):
   - Add minimal fs permission
   - Restrict to read-only operations

3. **Frontend Call** (src/lib/files.ts):
   - Use invoke with proper typing
   - Handle errors gracefully

4. **CSP Update** (src-tauri/tauri.conf.json):
   - Ensure file:// protocol allowed

Shall I proceed with implementation?"

### User: "Review my Tauri app security"

**Agent Response**:
"Running security review on your Tauri application...

### Findings

#### ❌ Blocker: Missing Path Validation
```rust
// ❌ Current
#[command]
async fn read_file(path: String) -> Result<String, String> {
    Ok(std::fs::read_to_string(&path)?)
}

// ✅ Fix
#[command]
async fn read_file(path: String) -> Result<String, String> {
    let base_dir = std::env::current_dir()?;
    let full_path = base_dir.join(&path);
    
    // Prevent directory traversal
    if !full_path.starts_with(&base_dir) {
        return Err("Access denied".into());
    }
    
    std::fs::read_to_string(&full_path)
}
```

#### ⚠️ Warning: Overly Permissive CSP
- `style-src: 'unsafe-inline'` allows XSS attacks
- Remove and use nonce-based approach instead

#### ✅ Good
- Capabilities properly configured
- Dependencies up to date
- Error handling in place

Recommend fixing blocker before deployment."

## Additional Resources

- For complete API documentation, see [Tauri v2 Docs](https://v2.tauri.app/)
- For security concepts, see [Tauri Security](https://v2.tauri.app/security/)
- For CSP configuration, see [CSP Guide](https://tauri.app/security/csp/)
- For IPC patterns, see [IPC Documentation](https://v2.tauri.app/concept/inter-process-communication/)
