# 02C: Bookmarks Store

**File:** `src/lib/stores/bookmarks.svelte.ts`  
**Dependencies:** `01A-types.md`, `01B-storage-utility.md`  
**Estimated Time:** 45 min

## Purpose

Manage user bookmarks across all books. Store bookmarks with location, optional labels/notes, and provide CRUD operations.

## Class: BookmarksStore

### State

```typescript
class BookmarksStore {
    private _bookmarks = $state<Record<string, Bookmark[]>>({});
    activeBookPath = $state<string | null>(null);
}
```

### Methods

```typescript
// CRUD
addBookmark(bookPath: string, location: string, options?: { label?: string; note?: string; displayPage?: number; displaySection?: string }): Bookmark
removeBookmark(id: string): boolean
updateBookmark(id: string, updates: { label?: string; note?: string }): Bookmark | null

// Queries
getBookmarksForBook(bookPath: string): Bookmark[]
getBookmark(id: string): Bookmark | undefined
hasBookmarkAt(bookPath: string, location: string): boolean
getBookmarkAt(bookPath: string, location: string): Bookmark | undefined

// Convenience
toggleBookmark(bookPath: string, location: string, options?): Bookmark | null  // Add if missing, remove if exists
clearBookmarksForBook(bookPath: string): number
setActiveBook(bookPath: string | null): void

// Computed
get activeBookBookmarks(): Bookmark[]
get totalCount(): number
```

### Storage

- Key: `sumi:bookmarks`
- Structure: `{ [bookPath: string]: Bookmark[] }`
- Load on construction, save after each mutation

### Bookmark ID Generation

Use `crypto.randomUUID()` with fallback for older browsers.

## Acceptance Criteria

- [ ] Bookmarks persisted to localStorage via storage utility
- [ ] Each bookmark has unique UUID
- [ ] `toggleBookmark` adds or removes based on existence
- [ ] `hasBookmarkAt` checks by location string match
- [ ] Svelte 5 runes (`$state`) used for reactivity
- [ ] Export singleton `bookmarksStore`
