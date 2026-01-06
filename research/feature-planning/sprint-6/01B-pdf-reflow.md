# 06B: PDF Reflow & Margin Crop

**Files:** `src/lib/components/pdf-reader.svelte`, `src/lib/utils/pdf-reflow.ts`
**Dependencies:** `pdf.js`

## Purpose
Make fixed-layout PDFs readable on small mobile screens.

## Implementation
- **Reflow**:
    - Extract text and basic formatting from PDF pages.
    - Render as a responsive HTML stream inside the EPUB reader shell.
    - Allow font size and family adjustments (Impossible in standard PDF view).
- **Smart Crop**:
    - Automatically detect the bounding box of text on a PDF page.
    - Adjust the scale/offset to zoom in on text and hide empty margins.
    - Manual "manual crop" slider for custom adjustment.
