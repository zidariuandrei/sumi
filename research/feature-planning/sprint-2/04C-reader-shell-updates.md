# 04C: Reader Shell Updates

**File:** `src/lib/components/reader-shell.svelte`
**Dependencies:** `01C-keyboard-utility.md`, `03A-toc-drawer.md`, `03B-settings-drawer.md`, `03C-bookmarks-drawer.md`, `03D-goto-dialog.md`, `03E-shortcuts-modal.md`
**Estimated Time:** 1 hour

## Purpose

The Reader Shell is the layout wrapper for the reading experience. It manages the visibility of all drawers/modals (TOC, Settings, Bookmarks) and orchestrates keyboard shortcuts, delegating actions to the specific reader components.

## State Management

```typescript
// Drawer states
let showToc = $state(false);
let showSettings = $state(false);
let showBookmarks = $state(false);

// Dialog states
let showGoTo = $state(false);
let showShortcuts = $state(false);

// Header/Controls visibility (for immersive mode)
let showControls = $state(true);
```

## Integration

### Keyboard Shortcuts

-   Import `createKeyboardHandler` and `SHORTCUTS` from `$lib/utils/keyboard`.
-   Attach event listener to `window` (or a high-level container).
-   **Handlers**:
    -   `T` -> Toggle `showToc`
    -   `S` -> Toggle `showSettings`
    -   `B` -> Toggle `showBookmarks` (or Add Bookmark if simple `b`)
    -   `G` -> Open `showGoTo`
    -   `?` -> Open `showShortcuts`
    -   `Esc` -> Close any open drawer/modal.

### Component Composition

-   Render `TocDrawer`, `SettingsDrawer`, `BookmarksDrawer` as siblings to the main content.
-   Render `GoToDialog` and `ShortcutsModal`.
-   **Main Content**: Renders `<slot />` or specifically `<EpubReader>` / `<PdfReader>` depending on route/prop.
-   **Props Passing**:
    -   Pass `onNavigate` callbacks from drawers to the active reader instance (binding or callback prop).
    -   Pass `currentLocation` from reader to drawers.

## Layout Changes

-   Ensure drawers overlay the content or push it (overlay is usually better for "immersive" reading).
-   Add a top bar (header) that can slide in/out, containing hamburger menu for TOC, title, and buttons for Settings/Bookmarks.

## Acceptance Criteria

-   [ ] All drawers and modals can be toggled via keyboard shortcuts.
-   [ ] All drawers and modals can be opened via UI buttons in the header.
-   [ ] "Escape" key closes the topmost open panel.
-   [ ] Navigation events from TOC/Bookmarks/GoTo are correctly passed to the reader.
-   [ ] Immersive mode: controls hide when reading, show on hover/click/key.
