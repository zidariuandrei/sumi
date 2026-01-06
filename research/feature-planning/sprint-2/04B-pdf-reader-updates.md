# 04B: PDF Reader Updates

**File:** `src/lib/components/pdf-reader.svelte`
**Dependencies:** `01A-types.md`, `02A-book-store-extension.md`, `02D-reading-stats-store.md`
**Estimated Time:** 1.5 hours

## Purpose

Update the PDF reader component to support progress tracking, statistics, and navigation, aligning its capabilities with the EPUB reader where possible.

## Key Responsibilities

1.  **Progress Tracking**: Track current page number and update `bookStore`.
2.  **Stats Tracking**: Track reading time via `statsStore`.
3.  **Navigation**: Support jumping to specific pages.
4.  **Zoom/Layout**: Handle basic view settings (Fit Width / Fit Page) - *Note: detailed font settings from `settingsStore` don't apply to PDF, but layout preferences might be stored there or locally.*

## Integration Points

### Imports

```typescript
import { bookStore } from '$lib/stores/book.svelte';
import { readingStatsStore } from '$lib/stores/stats.svelte';
import type { ReadingLocation, TocItem } from '$lib/types/reader';
```

### Reactivity

-   **Restore Position**: On mount, check `bookStore.getProgress(path)` and initialize PDF.js viewer at that page.

### Events & Methods

-   **Page Change**: Listen to scroll or intersection observer events to determine current page.
    -   Call `bookStore.updateProgress(path, { page, totalPages, fraction })`.
-   **Outline/TOC**: If PDF has an outline, extract it and convert to `TocItem[]`.
-   **`goTo(target)`**: Export method to scroll specific page into view.

## Implementation Details

-   **Virtualization**: Ensure large PDFs don't crash by rendering only visible pages (standard PDF.js pattern or using a wrapper like `svelte-pdf`).
-   **Debounce Updates**: Update progress only after settling on a page for >500ms.
-   **Lifecycle**:
    -   `mount`: `readingStatsStore.startSession(path)`
    -   `onDestroy`: `readingStatsStore.endSession()`
-   **Fit Modes**: Implement "Fit Width" vs "Fit Height" logic, potentially saving this preference in a PDF-specific section of `settingsStore` or local component state if scope is limited.

## Acceptance Criteria

-   [ ] Reader initializes at last saved page.
-   [ ] Current page updates are saved to `bookStore`.
-   [ ] Reading time is tracked.
-   [ ] "Go to Page" navigation works.
-   [ ] PDF Outline (if present) is extracted as TOC.
