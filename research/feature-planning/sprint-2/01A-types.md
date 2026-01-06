# 01A: Type Definitions

**File:** `src/lib/types/reader.ts`  
**Dependencies:** None  
**Estimated Time:** 30 min

## Purpose

Define all TypeScript interfaces for Sprint 2 features: reading progress, TOC, settings, bookmarks, and statistics.

## Types to Define

### ReadingLocation
- `cfi?: string` - EPUB CFI
- `page?: number` - Current page (1-indexed)
- `totalPages?: number`
- `fraction: number` - Progress 0-1
- `label?: string` - Human-readable location

### TocItem
- `id: string`
- `label: string`
- `href: string` - Navigation target
- `level: number` - Nesting depth (0 = top)
- `page?: number`
- `children?: TocItem[]`

### ReaderSettings
- `fontFamily: 'serif' | 'sans-serif' | 'monospace'`
- `fontSize: number` - 12-32px
- `lineHeight: number` - 1.0-2.5
- `marginHorizontal: number` - 0-100px
- `marginVertical: number` - 0-100px
- `textAlign: 'left' | 'justify'`

Export `DEFAULT_READER_SETTINGS` constant with sensible defaults.

### Bookmark
- `id: string` - UUID
- `bookPath: string`
- `location: string` - CFI or page
- `label?: string`
- `note?: string`
- `createdAt: number`
- `displayPage?: number`
- `displaySection?: string`

### ReadingSession
- `id: string`
- `bookPath: string`
- `startTime: number`
- `endTime?: number`
- `duration: number` - Seconds

### BookStatistics
- `bookPath: string`
- `totalTime: number` - Total seconds
- `sessionCount: number`
- `firstOpened?: number`
- `lastRead?: number`

### UI Types
- `DrawerType = 'toc' | 'settings' | 'bookmarks' | null`
- `SortOption = 'title' | 'author' | 'lastRead' | 'dateAdded'`
- `SortDirection = 'asc' | 'desc'`

## Acceptance Criteria

- [ ] All types exported from `$lib/types/reader`
- [ ] `DEFAULT_READER_SETTINGS` exported
- [ ] No circular dependencies
- [ ] `bun check` passes