# 04A: EPUB Reader Updates

**File:** `src/lib/components/epub-reader.svelte`
**Dependencies:** `01A-types.md`, `02A-book-store-extension.md`, `02B-settings-store.md`, `02D-reading-stats-store.md`
**Estimated Time:** 1.5 hours

## Purpose

Update the EPUB reader component to integrate with the new state management systems (settings, progress tracking, statistics) and support the new UI features (TOC, bookmarks).

## Key Responsibilities

1.  **Settings Application**: Apply styles from `settingsStore` (font, size, spacing) to the Folio view.
2.  **Progress Tracking**: Update `bookStore` with current location (CFI) and progress percentage.
3.  **Stats Tracking**: precise reading time tracking using `statsStore`.
4.  **Navigation**: Handle "Go to" requests and internal link clicks.
5.  **TOC Extraction**: Extract TOC on load and pass to parent/store.

## Integration Points

### Imports

```typescript
import { bookStore } from '$lib/stores/book.svelte';
import { settingsStore } from '$lib/stores/settings.svelte';
import { readingStatsStore } from '$lib/stores/stats.svelte';
import type { ReadingLocation, TocItem } from '$lib/types/reader';
```

### Reactivity

-   **Watch Settings**: Use `$effect` to watch `settingsStore.activeSettings`. When changed, call Folio's renderer methods (e.g., `view.renderer.setStyles()`) to update appearance dynamically without reloading.
-   **Restore Position**: On mount, check `bookStore.getProgress(path)` and initialize Folio at that CFI.

### Events & Methods

-   **`onRelocate`**: When Folio reports location change:
    -   Update local `currentLocation` state.
    -   Call `bookStore.updateProgress(path, location)`.
-   **`onTocReady`**: When TOC is parsed:
    -   Dispatch event or callback to parent with `TocItem[]`.
-   **`goTo(target)`**: Export a method (or use a bound prop) to allow parent to trigger navigation (e.g., from TOC drawer or "Go to" dialog).
    -   Supports jumping to CFI, page index, or percentage.

## Implementation Details

-   **Debounce Progress**: Avoid spamming storage updates on every scroll/page turn. Debounce `updateProgress` calls (e.g., 500ms).
-   **Lifecycle**:
    -   `mount`: `readingStatsStore.startSession(path)`
    -   `onDestroy`: `readingStatsStore.endSession()`
-   **Style Injection**: Folio views are often inside an iframe or shadow DOM. Ensure styles are injected correctly into that context.

## Acceptance Criteria

-   [ ] Reader initializes at last saved position (if any).
-   [ ] Changing font/size/theme in settings immediately updates the reader view.
-   [ ] Reading progress is saved to `bookStore` as user reads.
-   [ ] Reading time is tracked via `statsStore`.
-   [ ] TOC is correctly extracted and exposed.
-   [ ] External navigation (e.g., jump to chapter) works.
