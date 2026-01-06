# Project Instructions: Sumi

This document defines the strict development standards and architectural rules for the **Sumi** project.

## 🎯 Project Mission
Build a lightweight, high-performance, and privacy-focused ebook reader for Desktop and Mobile using SvelteKit and Tauri v2.

## 🛠 Tech Stack Enforcement
*   **Frontend:** Svelte 5 (must use **Runes** API).
*   **Styling:** Tailwind CSS v4 (CSS-first configuration).
*   **Components:** shadcn-svelte (v1+ compatible with Svelte 5).
*   **Runtime/PM:** Bun (use `bun` for all commands).
*   **Backend:** Tauri v2 (Rust).
*   **Language:** Strict TypeScript for frontend.

## 📐 Architectural Rules
1.  **SPA Mode:** SvelteKit must be configured with `@sveltejs/adapter-static` and `ssr = false`. No server-side logic (`+page.server.ts`) is allowed.
2.  **Tauri IPC:** Use Tauri's `invoke` for system-level operations (file system, system info). Do not use Node.js APIs.
3.  **State Management:** 
    *   Prefer Svelte 5 Runes (`$state`, `$derived`) for component and global state.
    *   Avoid legacy Svelte stores unless a specific library requires them.
4.  **UI Components:**
    *   Always check `src/lib/components/ui` before creating new primitive components.
    *   Use `bun x shadcn-svelte@latest add <component>` to bring in new shadcn components.
    *   Maintain mobile-first responsiveness using Tailwind breakpoints.

## 📝 Coding Standards
1.  **Reactivity:** Use `$state()` for mutable state, `$derived()` for computed values, and `$props()` for component inputs.
2.  **Navigation State:** Use `import { page } from '$app/state'` for URL and navigation state. Do **NOT** use the legacy `$app/stores` module.
3.  **Event Handlers:** Use the new Svelte 5 syntax (e.g., `onclick={...}` instead of `on:click={...}`).
4.  **Path Aliases:** Always use `$lib/` for internal imports to avoid deep relative paths.
5.  **Security:** Follow Tauri v2 ACL (Access Control List) principles. Define permissions in `src-tauri/capabilities/`.

## 🚀 Common Workflows
*   **Dev:** `bun tauri dev`
*   **Mobile Dev:** `bun tauri android dev`
*   **Add Component:** `bun x shadcn-svelte@latest add <name>`
*   **Type Check:** `bun check`

## 🤖 AI Agent Protocol
1.  **Strict Plan Adherence:** Agents must strictly follow the plans provided to them. No additional alterations or "improvements" are allowed outside the scope of the approved plan.
2.  **Branching Strategy:** All work must be performed on a separate branch prefixed with `ai/` (e.g., `ai/task-name`).
3.  **No Unauthorized Merges:** Agents are permitted to commit and push to their respective `ai/` branches. However, merging into `main` or any other branch is strictly prohibited without explicit user approval.
4.  **Multi-Agent Concurrency (Git Worktrees):**
    *   **Requirement:** When multiple agents operate simultaneously on this local machine, they **MUST** use Git Worktrees to isolate their working environments.
    *   **Setup:** Run `git worktree add ../sumi-<task-name> <new-branch-name>` (ensure the path is outside the current repo root).
    *   **Execution:** The agent must effectively "move" to that directory for all file operations and commands.
    *   **Cleanup:** After pushing changes, run `git worktree remove ../sumi-<task-name>`.

## 📂 Reference Docs
Refer to the `research/` directory for deep-dives into specific technologies:
- `research/svelte-kit-5.md`: Runes and Snippets patterns.
- `research/tauri-v2.md`: Mobile and Security configuration.
- `research/ui-styling.md`: Tailwind 4 and shadcn-svelte usage.
