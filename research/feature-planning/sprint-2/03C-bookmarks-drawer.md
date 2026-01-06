# 03C: Bookmarks Drawer Component

**File:** `src/lib/components/bookmarks-drawer.svelte`  
**Dependencies:** `02C-bookmarks-store.md`, shadcn Sheet  
**Estimated Time:** 1 hour

## Purpose

Slide-out drawer displaying bookmarks for the current book. Allows viewing, navigating to, editing, and deleting bookmarks.

## Props

```typescript
interface Props {
    open: boolean;
    onClose: () => void;
    bookPath: string;
    onNavigate: (location: string) => void;
}
```

## Features

1. **List bookmarks** for current book, sorted by page/location
2. **Navigate** - clicking a bookmark calls `onNavigate(location)` and closes drawer
3. **Edit** - inline edit label/note (or small dialog)
4. **Delete** - remove bookmark with confirmation or undo toast
5. **Empty state** - friendly message when no bookmarks

## UI Structure

```
┌─────────────────────────────────────┐
│ Bookmarks                      [X]  │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ Chapter 3 · Page 42             │ │
│ │ "My label"                      │ │
│ │ Note preview...          [···]  │ │ <- Menu: Edit, Delete
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Chapter 5 · Page 87             │ │
│ │ (no label)                      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ─ ─ ─ ─ OR ─ ─ ─ ─                 │
│                                     │
│     No bookmarks yet.               │
│     Press B to add one.             │
└─────────────────────────────────────┘
```

## Integration

```svelte
<script lang="ts">
    import { bookmarksStore } from '$lib/stores/bookmarks.svelte';
    
    let { open, onClose, bookPath, onNavigate }: Props = $props();
    
    let bookmarks = $derived(bookmarksStore.getBookmarksForBook(bookPath));
</script>
```

## Component Dependencies

- Uses shadcn `Sheet` for drawer behavior
- Uses `bookmarksStore` for data
- Optional: shadcn `DropdownMenu` for edit/delete actions

## Acceptance Criteria

- [ ] Opens from right side
- [ ] Lists all bookmarks for given `bookPath`
- [ ] Clicking bookmark navigates and closes drawer
- [ ] Can delete bookmarks
- [ ] Can edit bookmark label/note
- [ ] Shows empty state when no bookmarks
- [ ] Keyboard accessible (Escape to close)
- [ ] Mobile-friendly touch targets