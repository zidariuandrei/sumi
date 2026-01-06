# General Workflow & Project Rules

## Tooling
- **Runtime:** `Bun` is the source of truth for all scripts and package management.
  - Run: `bun run dev`, `bun add package`, `bun x tool`.
- **Formatting:** `Prettier` (if installed) or editor defaults. Maintain consistent indentation (Tabs or 2/4 Spaces - check `.editorconfig` if present).

## Project Structure
```
src/
├── lib/
│   ├── components/     # Reusable UI components
│   │   └── ui/         # shadcn-svelte components
│   ├── utils/          # Helper functions
│   └── stores/         # Global state (Svelte stores or Runes state)
├── routes/             # SvelteKit Pages
│   ├── +layout.svelte  # Root layout
│   └── +page.svelte    # Home page
└── src-tauri/          # Rust Backend
```

## Development Loop
1. **Start Dev Server:** `bun tauri dev`
   - Opens the native window.
   - Hot Module Replacement (HMR) is active for Svelte files.
2. **Adding Dependencies:**
   - Frontend: `bun add [package]`
   - Backend: Edit `src-tauri/Cargo.toml` manually or use `cargo add` inside `src-tauri`.

## Git / Version Control
- Commit `bun.lock` to ensure consistent dependency versions.
- Do not commit `src-tauri/target/` or `node_modules/`.

## Quality Assurance
- **Type Check:** Run `bun check` (mapped to `svelte-check`) before major commits.
- **Lint:** Ensure no unused imports or variables.
