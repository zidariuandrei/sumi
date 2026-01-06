# 02D: Reading Statistics Store

**File:** `src/lib/stores/stats.svelte.ts`  
**Dependencies:** `01A-types.md`, `01B-storage-utility.md`  
**Estimated Time:** 30 min

## Purpose

Track reading time per book with session-based tracking. Auto-saves periodically to prevent data loss.

## Store API

```typescript
class ReadingStatsStore {
    // Start tracking when opening a book
    startSession(bookPath: string): void
    
    // End tracking when leaving reader
    endSession(): void
    
    // Get total reading time for a book (seconds)
    getReadingTimeForBook(bookPath: string): number
    
    // Format seconds to "2h 30m" or "45m"
    formatDuration(seconds: number): string
    
    // Cleanup (clear timers) - call in onDestroy
    cleanup(): void
}

export const readingStatsStore: ReadingStatsStore;
```

## Key Behaviors

- Only record sessions >= 5 seconds (avoid accidental opens)
- Auto-save every 30 seconds during active session
- Pause session on `document.hidden` (tab switch)
- Resume on visibility restore
- Limit stored sessions per book (e.g., last 100) to prevent unbounded growth

## Storage Schema

Key: `sumi:readingStats`

```typescript
{
    [bookPath: string]: {
        totalTime: number;      // Accumulated seconds
        sessionCount: number;
        lastRead?: number;      // Timestamp
    }
}
```

Note: Individual session history is optional. For MVP, just track aggregate stats.

## Acceptance Criteria

- [ ] `startSession()` begins time tracking
- [ ] `endSession()` saves accumulated time
- [ ] Sessions < 5 seconds ignored
- [ ] Auto-save runs during active session
- [ ] `formatDuration()` returns human-readable string
- [ ] Handles page visibility changes
- [ ] `cleanup()` clears intervals