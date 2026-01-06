# 01B: Storage Utility

**File:** `src/lib/utils/storage.ts`  
**Dependencies:** None  
**Estimated Time:** 30 min

## Purpose

Type-safe localStorage wrapper with prefix namespacing, error handling, and SSR safety.

## API

```typescript
// Core functions
function get<T>(key: string, defaultValue: T): T
function set<T>(key: string, value: T): boolean
function remove(key: string): boolean
function has(key: string): boolean

// All keys prefixed with 'sumi:'
const STORAGE_KEYS = {
    RECENT_BOOKS: 'recentBooks',
    BOOK_PROGRESS: 'bookProgress', 
    READER_SETTINGS: 'readerSettings',
    BOOKMARKS: 'bookmarks',
    READING_STATS: 'readingStats',
} as const;
```

## Requirements

- Prefix all keys with `sumi:` to avoid collisions
- Return `defaultValue` on parse errors (don't throw)
- Check `typeof window !== 'undefined'` for SSR safety
- Export both individual functions and `storage` namespace object

## Acceptance Criteria

- [ ] All functions handle JSON serialization/parsing
- [ ] Graceful error handling (console.warn, return default)
- [ ] SSR safe
- [ ] `STORAGE_KEYS` constants exported