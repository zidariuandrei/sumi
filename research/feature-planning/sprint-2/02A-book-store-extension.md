# 02A: Book Store Extension

**File:** `src/lib/stores/book.svelte.ts` (modify existing)  
**Dependencies:** `01A-types.md`, `01B-storage-utility.md`  
**Estimated Time:** 1 hour

## Purpose

Extend the existing `Book` interface and `BookStore` class to support reading progress persistence, enabling "Continue Reading" functionality and progress display on book cards.

## Changes to Book Interface

Add these optional fields to the existing `Book` interface:

```typescript
interface Book {
    // ... existing fields (path, title, author, addedAt, lastReadAt)
    
    // New fields
    currentLocation?: ReadingLocation;  // From 01A-types
    progress?: number;                   // 0-1 fraction
    totalPages?: number;
    totalReadingTime?: number;           // Seconds
}
```

## New Methods to Add

```typescript
// Update progress when reader location changes
updateProgress(path: string, location: ReadingLocation): void

// Get saved progress for restoring position
getProgress(path: string): ReadingLocation | undefined

// Clear progress (reset to beginning)
clearProgress(path: string): void

// Add reading time to a book's total
addReadingTime(path: string, seconds: number): void

// Format reading time for display ("2h 30m")
getFormattedReadingTime(path: string): string
```

## New Getters to Add

```typescript
// Most recently read book (for "Continue Reading")
get lastReadBook(): Book | undefined

// Books sorted by lastReadAt descending
get recentlyReadBooks(): Book[]

// Books with progress > 0 and < 1
get inProgressBooks(): Book[]
```

## Implementation Notes

- Import `ReadingLocation` from `$lib/types/reader`
- Import `storage` from `$lib/utils/storage` (replace raw localStorage calls)
- All new Book fields must be optional (`?`) for backward compatibility
- Call `saveToStorage()` after any mutation
- `updateProgress()` should also update `lastReadAt` timestamp

## Acceptance Criteria

- [ ] `Book` interface extended with new optional fields
- [ ] `updateProgress()` saves location and updates `lastReadAt`
- [ ] `getProgress()` returns saved location or undefined
- [ ] `lastReadBook` getter returns most recently read book
- [ ] `getFormattedReadingTime()` returns human-readable string
- [ ] Existing functionality unchanged (backward compatible)
- [ ] Uses `storage` utility instead of raw localStorage