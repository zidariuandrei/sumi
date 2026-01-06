# Gemini Reader - Cross-Platform Ebook Reader

## 📖 Project Scope
A lightweight, high-performance ebook reader built for **Desktop (Linux, Windows, macOS)** and **Mobile (Android)**.
Designed to be fast, privacy-focused, and capable of handling large libraries.

## 🏗️ Architecture
- **Frontend:** SvelteKit (SPA Mode)
- **Runtime:** Bun (Development & Build Tooling)
- **Engine:** Tauri v2 (Rust-backed Native WebView)
- **Language:** TypeScript + Rust (Minimal)

## 🚀 Getting Started

### Prerequisites
1.  **Bun:** [Install Bun](https://bun.sh/)
2.  **Rust:** [Install Rust](https://www.rust-lang.org/tools/install)
3.  **Android SDK (Optional):** Required only for mobile builds.

### Installation
```bash
# Clone the repo (if not already here)
cd sumi

# Install dependencies
bun install
```

### Development
```bash
# Run Desktop App (Dev Mode)
bun tauri dev

# Run Mobile App (Android)
bun tauri android dev
```

### Build for Production
```bash
# Build Desktop
bun tauri build

# Build Android
bun tauri android build
```

## 🛠️ Tech Stack Details
- **SvelteKit:** configured with `@sveltejs/adapter-static` and `ssr: false` to function as a pure client-side application suitable for WebViews.
- **Tauri v2:** Uses the OS native webview (WebKitGTK on Linux, WebView2 on Windows) to keep the bundle size tiny (~10MB).
- **Bun:** Used for lightning-fast package installation and script execution.
- **UI/Styling:** Tailwind CSS v4 + shadcn-svelte for accessible, modern UI components.

## 📂 Project Structure
- `src/` - SvelteKit Frontend code.
- `src-tauri/` - Rust backend code and Tauri configuration.
- `static/` - Static assets (icons, etc).
