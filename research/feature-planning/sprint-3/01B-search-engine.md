# 01B: Search Engine

**Files:** `src/lib/utils/search-worker.ts`, `src/lib/components/search-results.svelte`
**Dependencies:** None

## Purpose
Enable full-text search within the currently open book.

## Implementation
- **Worker**: Use a Web Worker to avoid blocking the main UI thread during indexing/searching.
- **EPUB**: Leverage `foliate-js` search interface if available, or iterate through spine items.
- **PDF**: Use `pdf.js` `getTextContent` for each page and cache it.
- **Result Structure**:
    ```typescript
    interface SearchResult {
        location: string; // CFI or Page
        excerpt: string;  // Snippet with match highlighted
        preview: string;  // Context before/after
    }
    ```

## Features
- **Incremental Search**: Show results as the user types.
- **Case Sensitivity**: Optional toggle.
- **Result Navigation**: Clicking a result closes search and jumps to location.
