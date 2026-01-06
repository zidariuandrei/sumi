# 01A: Annotations Store

**Files:** `src/lib/stores/annotations.svelte.ts`, `src/lib/types/reader.ts`
**Dependencies:** `02A-book-store-extension.md` (Sprint 2)

## Purpose
Manage persistent highlights and notes across all books.

## Data Structure
```typescript
interface Annotation {
    id: string;
    bookPath: string;
    cfi?: string;         // EPUB anchor
    page?: number;        // PDF anchor
    rects?: DOMRect[];    // Coordinates for PDF
    text: string;         // Highlighted text
    note?: string;        // User note
    color: string;        // Hex or preset name
    createdAt: number;
}
```

## Features
- **Persistence**: Store annotations in `annotations.json` via `storage.ts`.
- **Reactivity**: Use `$state` for annotations list, filtered by `activeBookPath`.
- **Methods**:
    - `addHighlight(bookPath, cfi/page, text, color)`
    - `addNote(annotationId, text)`
    - `removeAnnotation(id)`
    - `getAnnotationsForBook(path)`
