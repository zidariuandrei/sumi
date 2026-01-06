# 03E: Shortcuts Modal

**File:** `src/lib/components/shortcuts-modal.svelte`  
**Dependencies:** `01C-keyboard-utility.md`  
**Estimated Time:** 30 min

## Purpose

Modal dialog showing all available keyboard shortcuts, grouped by category. Opened with `?` key.

## Props

```typescript
interface Props {
    open: boolean;
    onClose: () => void;
}
```

## Content Structure

Display shortcuts grouped by category using `getShortcutsByCategory()` from keyboard utility:

```
┌────────────────────────────────────┐
│ Keyboard Shortcuts            [X]  │
├────────────────────────────────────┤
│ Navigation                         │
│   ← →      Previous/Next page      │
│   Space    Next page               │
│   Home     Go to beginning         │
│                                    │
│ Interface                          │
│   T        Toggle TOC              │
│   B        Add bookmark            │
│   S        Toggle settings         │
│   G        Go to page              │
│   Esc      Close panel             │
│                                    │
│ Reading                            │
│   + -      Adjust font size        │
│   0        Reset font size         │
└────────────────────────────────────┘
```

## Implementation Notes

- Use shadcn Dialog component as base
- Import `getShortcutsByCategory()`, `formatShortcutDisplay()`, `CATEGORY_LABELS` from keyboard utility
- Display shortcuts in a clean two-column layout: key on left, description on right
- Use `<kbd>` elements for key display with appropriate styling
- Close on Escape key or clicking outside
- Scrollable if content exceeds viewport

## Styling

- `<kbd>` elements: monospace font, subtle background, rounded corners
- Category headers: bold, slightly larger
- Compact spacing for dense information display
- Dark/light mode support via Tailwind

## Acceptance Criteria

- [ ] Uses shadcn Dialog component
- [ ] Shows all shortcuts from `SHORTCUTS` registry
- [ ] Grouped by category with labels
- [ ] Keys formatted correctly for platform (⌘ on Mac)
- [ ] Closes on Escape or outside click
- [ ] Accessible (focus trap, screen reader friendly)