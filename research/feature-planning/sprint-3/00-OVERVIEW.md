# Sprint 3: The Interactive & Organized Reader

**Goal:** Transform Sumi from a viewer into a study and organization tool by adding annotations, search, and library curation.

## Themes
- **Knowledge Retention**: Highlights, notes, and full-text search.
- **Library Curation**: Tags, collections, and metadata editing.
- **Reading Comfort**: Advanced themes (Sepia, etc.) and two-page view.

## Roadmap

### Level 0: Foundation
- **01A: Annotations Store**: Persistence for highlights and notes.
- **01B: Search Engine**: Indexing and querying book content.

### Level 1: Interactive Reader
- **02A: Selection Menu**: Contextual actions on text selection.
- **02B: Highlight Rendering**: Visualizing annotations in EPUB/PDF.
- **02C: Search UI**: Integrated search bar and results list.

### Level 2: Advanced Reader UI
- **03A: Annotations Drawer**: List view of all bookmarks, highlights, and notes.
- **03B: Advanced Themes**: Sepia, Solarized, and custom color presets.
- **03C: Two-Page View**: Side-by-side rendering for tablets/large screens.

### Level 3: Library Organization
- **04A: Collections & Tags**: Grouping books and taxonomies.
- **04B: Metadata Editor**: Manual corrections for title, author, and cover.

## Architectural Notes
- **CFI Anchors**: All annotations must use EPUB CFIs for stability.
- **Overlay Layer**: PDF highlights will use a custom SVG overlay to avoid modifying the original PDF file.
- **Svelte 5 Snippets**: Extensive use of snippets for repetitive list items in drawers.
