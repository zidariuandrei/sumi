# 02A: Selection Menu

**Files:** `src/lib/components/selection-menu.svelte`, `src/lib/components/reader-shell.svelte`
**Dependencies:** `01A-annotations-store.md`

## Purpose
Provide contextual actions when the user selects text in the reader.

## Implementation
- **Positioning**: Use `getSelection().getRangeAt(0).getBoundingClientRect()` to position a floating menu.
- **Events**:
    - Listen for `selectionchange` or `mouseup` in the reader iframe/canvas.
- **Actions**:
    - **Highlight**: Save selection to `annotationsStore`.
    - **Note**: Open a small popover to type a note.
    - **Copy**: Copy text to clipboard.
    - **Search**: Search for this term in the current book.

## UI/UX
- Minimalist floating toolbar (pill shape).
- Quick color dots for highlights.
- Auto-hide when selection is cleared.
