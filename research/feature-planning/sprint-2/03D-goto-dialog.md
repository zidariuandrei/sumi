# 03D: Go To Page/Location Dialog

**File:** `src/lib/components/goto-dialog.svelte`  
**Dependencies:** shadcn Dialog component  
**Estimated Time:** 30 min

## Purpose

A dialog that allows users to jump to a specific page number or percentage in the current book.

## Props

```typescript
interface Props {
    open: boolean;
    onClose: () => void;
    totalPages?: number;           // For PDF and EPUB with page info
    currentPage?: number;
    onNavigate: (target: { page?: number; percentage?: number }) => void;
}
```

## UI Elements

- Input field for page number (if `totalPages` provided)
- Input field for percentage (0-100)
- "Go" button to confirm
- "Cancel" button or click outside to close
- Show current location as hint (e.g., "Currently on page 42 of 200")

## Behavior

- Open via `g` keyboard shortcut (handled by reader-shell)
- Auto-focus input on open
- Enter key submits
- Escape closes
- Validate input is within valid range
- Close dialog after successful navigation

## Validation

- Page: 1 to `totalPages` (integer)
- Percentage: 0 to 100 (can have decimals)
- Show error state for invalid input
- Disable "Go" button when input invalid

## Acceptance Criteria

- [ ] Uses shadcn Dialog component
- [ ] Auto-focuses input on open
- [ ] Enter submits, Escape closes
- [ ] Validates page/percentage range
- [ ] Calls `onNavigate` with correct target
- [ ] Shows current location hint
- [ ] Closes after navigation