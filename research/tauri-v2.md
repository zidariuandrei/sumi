# Tauri v2 Knowledge Base

## Core Architecture
Tauri v2 brings mobile support and a hardened security model.

### Cross-Platform
- **Desktop:** Uses WebView2 (Windows), WebKitGTK (Linux), WebKit (macOS).
- **Mobile:** Uses standard Android WebView and WKWebView (iOS).

## Mobile Development
- **Commands:**
  - `bun tauri android init` - Initialize Android project.
  - `bun tauri android dev` - Run on emulator/device.
- **UI Considerations:**
  - Mobile webviews may have different CSS support (though generally modern).
  - Handle "Safe Areas" (notches) using CSS env variables: `padding-top: env(safe-area-inset-top);`.

## Security & Permissions (ACL)
Tauri v2 uses a Capability-based permission system (`src-tauri/capabilities/`).

- **Capabilities:** JSON/TOML files defining what the frontend can do.
- **Permissions:** Granular access controls (e.g., `fs:read`, `http:request`).
- **Configuration:** `tauri.conf.json` references these capabilities.

**Rule:** By default, the frontend has **zero** access to the OS. You must explicitly enable plugins and permissions.

## Inter-Process Communication (IPC)
- **Commands:** Rust functions annotated with `#[tauri::command]`.
- **Invoke:** Frontend calls backend via `invoke('command_name', { args })`.
- **Events:** `emit` and `listen` for bi-directional real-time communication.

## Rules & Conventions
1. **Async IPC:** All IPC calls are asynchronous. Handle them with `await`.
2. **Minimize Payload:** Keep data passing between Rust and JS minimal for performance.
3. **Security First:** Only expose exact permissions needed. Avoid wildcard permissions in production.
4. **Plugin Prefix:** Tauri v2 plugins are prefixed (e.g., `tauri-plugin-fs`). Ensure `Cargo.toml` and `package.json` versions match.
