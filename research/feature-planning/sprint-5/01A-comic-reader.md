# 05A: Comic & Manga Reader (CBZ/CBR)

**Files:** `src/lib/components/comic-reader.svelte`, `src/lib/utils/archive.ts`
**Dependencies:** `fflate` or `zip.js`

## Purpose
Native support for image-based archives (Comics and Manga).

## Implementation
- **Archive Extraction**: Use `fflate` to list and extract images from `.cbz` (ZIP) or `.cbr` (RAR).
- **Virtual List**: Render images in a vertically scrolling list (Webtoon style) or a paginated viewer.
- **Manga Mode**: A toggle to swap navigation direction (Left-to-Right vs Right-to-Left).
- **Image Optimization**: Pre-load the next 2-3 images in the background to ensure zero-lag page turns.
