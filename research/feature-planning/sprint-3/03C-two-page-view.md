# 03C: Two-Page View

**Files:** `src/lib/components/epub-reader.svelte`, `src/lib/stores/settings.svelte.ts`
**Dependencies:** None

## Purpose
Utilize horizontal screen space on desktops and tablets by showing two pages side-by-side.

## Implementation
- **Foliate Integration**: Configure `foliate-js` renderer to use a two-column layout when active.
- **Responsive Toggle**: Automatically switch to single-page view if the window width falls below a certain threshold (e.g., 1024px).
- **Settings Integration**: Add a "Layout" toggle in the Settings Drawer: `Auto`, `Single`, `Double`.

## UX
- Ensure the progress slider and page numbers reflect the current "spread" correctly.
- Handle "Cover" page as a single centered page if desired.
