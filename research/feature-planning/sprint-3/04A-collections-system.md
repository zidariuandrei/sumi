# 04A: Collections System

**Files:** `src/lib/stores/collections.svelte.ts`, `src/routes/+page.svelte`
**Dependencies:** `02A-book-store-extension.md`

## Purpose
Allow users to organize their library into custom groups or tags.

## Data Model
```typescript
interface Collection {
    id: string;
    name: string;
    bookPaths: string[]; // List of book paths in this collection
    icon?: string;
}
```

## Implementation
- **Store**: Manage a list of collections.
- **Library View Integration**:
    - Sidebar or Dropdown to filter library by collection.
    - Drag-and-drop or right-click to add books to collections.
- **Smart Collections**:
    - "Unread" (progress == 0)
    - "Finished" (progress == 1)
    - "Favorites" (star property on Book)

## Acceptance Criteria
- User can create a new collection.
- User can add/remove books from collections.
- Library grid updates correctly when a collection is selected.
