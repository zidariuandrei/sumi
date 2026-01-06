# 04A: Mobile Gestures & Haptics

**Files:** `src/lib/utils/gestures.ts`, `src/lib/components/reader-shell.svelte`
**Dependencies:** `tauri-plugin-haptics` (TBD)

## Purpose
Implement fluid, native-feeling touch interactions for mobile devices.

## Implementation
- **Swipe Logic**: Use `touchstart`, `touchmove`, and `touchend` to calculate horizontal displacement.
    - Trigger `onNext` / `onPrev` when swipe exceeds 20% of screen width.
    - Implement a "peek" animation that slides the current page as the user drags.
- **Pinch Zoom**: Implement multi-touch scaling for `pdf-reader.svelte`.
- **Haptics**: Trigger a light "tick" on page turn and a "medium" buzz on long-press selection.

## Mobile Selection Menu
- Redesign the `selection-menu.svelte` to be larger and bottom-aligned for thumb reachability on mobile.
