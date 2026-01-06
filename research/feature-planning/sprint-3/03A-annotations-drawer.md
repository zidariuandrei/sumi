# 03A: Annotations Drawer

**Files:** `src/lib/components/annotations-drawer.svelte`, `src/lib/components/reader-shell.svelte`
**Dependencies:** `01A-annotations-store.md`

## Purpose
A centralized view for all reader-created content (bookmarks, highlights, notes).

## Features
- **Categorized View**: Tabs for "Highlights" and "Notes" (or merged timeline).
- **Navigation**: Click any item to jump to its location in the book.
- **Editing**: Inline editing of notes.
- **Export**: Simple "Export to Markdown" or "Copy All" functionality for study.

## UI Components
- Use Svelte 5 snippets for the annotation cards.
- Scrollable list with group headings (by Chapter or Page).
