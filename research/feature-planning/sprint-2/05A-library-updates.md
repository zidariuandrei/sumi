# 05A: Library Updates

**Files:** `src/routes/+page.svelte`, `src/lib/components/book-card.svelte`
**Dependencies:** `02A-book-store-extension.md`, `02D-reading-stats-store.md`
**Estimated Time:** 1.5 hours

## Purpose

Update the main library view to reflect reading progress, improved sorting, and "Continue Reading" functionality.

## Book Card Updates (`book-card.svelte`)

-   **Progress Bar**: Add a visual progress bar (using shadcn `Progress` or simple `div`) at the bottom of the card cover.
    -   Show only if `progress > 0`.
    -   Display percentage tooltip or text.
-   **Badges**:
    -   "New" (added recently, unread).
    -   "Finished" (progress >= 100% or user marked).

## Library Page Updates (`+page.svelte`)

### "Continue Reading" Section

-   Query `bookStore.lastReadBook`.
-   If exists, display a prominent "hero" card or section at the top.
-   "Jump back in" button directly opens the reader at saved location.

### Sorting & Filtering

-   **Controls**: Add a toolbar with:
    -   **Sort**: Recently Read (default), Title, Author, Date Added.
    -   **Filter**: All, In Progress, Unread, Finished.
-   **Implementation**:
    -   Use `$derived` state to filter/sort the `bookStore.books` array based on selected criteria.

### Grid Layout

-   Ensure responsive grid handles the new card elements (progress bars) gracefully without breaking alignment.

## Integration

-   Import `bookStore` and use its new getters (`recentlyReadBooks`, `inProgressBooks`).
-   Format dates and durations using standard utils.

## Acceptance Criteria

-   [ ] Book cards show progress bars for started books.
-   [ ] "Continue Reading" section appears if history exists.
-   [ ] User can sort library by Recency, Title, etc.
-   [ ] User can filter library (e.g., show only "In Progress").
-   [ ] Clicking a book navigates correctly to the reader with restored position.
