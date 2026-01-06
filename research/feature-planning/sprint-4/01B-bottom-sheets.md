# 04B: Mobile Layout & Bottom Sheets

**Files:** `src/lib/components/ui/sheet`, `src/lib/hooks/is-mobile.svelte.ts`
**Dependencies:** `bits-ui`, `vaul-svelte` (optional)

## Purpose
Adapt navigation and drawers for one-handed mobile usage.

## Implementation
- **Bottom Sheets**: On mobile (`isMobile` is true), all `Sheet` (Drawer) components should slide up from the bottom instead of from the left/right.
- **Dynamic Chrome**:
    - Tap middle to toggle Header/Footer.
    - Auto-hide UI when scrolling or turning pages.
    - Floating Action Button (FAB) for "Add Bookmark" if header is hidden.
- **SafeArea**: Use CSS `env(safe-area-inset-bottom)` to ensure bottom bars don't conflict with OS home indicators.
