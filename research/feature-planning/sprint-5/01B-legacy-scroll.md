# 05B: Legacy Formats & Vertical Scroll

**Files:** `src/lib/components/epub-reader.svelte`, `src/lib/types/reader.ts`
**Dependencies:** None

## Purpose
Support MOBI/AZW3 and provide a continuous scrolling alternative to pagination.

## MOBI Implementation
- Since MOBI is essentially a precursor to EPUB, we can use a converter or a specialized parser to extract the HTML content and feed it into our existing reader shell.

## Vertical Scroll Mode
- Add a "Scroll" option to the layout settings.
- In Scroll mode, the EPUB content is rendered as a single continuous document.
- Navigation bar becomes a traditional scroll progress indicator.
- Maintain CFI stability even during scrolling for bookmarks/highlights.
