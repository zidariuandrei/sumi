# Sprint 2: Reading Experience & Persistence

**Goal:** Enhance the reading experience with progress tracking, bookmarks, table of contents navigation, and improved reader settings.

## 📋 Features & Tasks

### 1. Reading Progress Persistence
- [ ] Save reading position (page/CFI) per book to localStorage or SQLite.
- [ ] Restore reading position when reopening a book.
- [ ] Display reading progress percentage in the Library view (on book cards).
- [ ] Add a "Continue Reading" button/section for the last opened book.

### 2. Table of Contents (TOC) Navigation
- [ ] Extract and parse TOC from EPUB files (already available via foliate-js).
- [ ] Extract TOC/bookmarks from PDF files (via pdf.js outline API).
- [ ] Create a TOC sidebar/drawer component (slideover panel).
- [ ] Implement navigation to specific chapters/sections from TOC.
- [ ] Highlight current chapter in TOC based on reading position.

### 3. Reader Settings Panel
- [ ] Create a reader settings drawer/popover component.
- [ ] **Font settings:**
  - [ ] Font family selection (serif, sans-serif, monospace).
  - [ ] Font size adjustment (slider or +/- buttons).
  - [ ] Line height/spacing control.
- [ ] **Layout settings:**
  - [ ] Margins/padding adjustment.
  - [ ] Text alignment (left, justify).
- [ ] Persist reader settings per-book or globally.

### 4. Bookmarks System
- [ ] Implement "Add Bookmark" functionality at current position.
- [ ] Store bookmarks with optional user notes/labels.
- [ ] Create a Bookmarks list view (within TOC drawer or separate tab).
- [ ] Navigate to bookmarked positions.
- [ ] Delete bookmarks.

### 5. Enhanced Navigation
- [ ] Add keyboard shortcuts for common actions:
  - [ ] `Space` / `Shift+Space` for page navigation.
  - [ ] `Home` / `End` for start/end of book.
  - [ ] `T` to toggle TOC sidebar.
  - [ ] `B` to add bookmark at current position.
  - [ ] `Esc` to close sidebars/modals.
- [ ] Implement "Go to page/location" dialog.
- [ ] Add swipe gestures for mobile navigation (touch events).

### 6. Improved Library View
- [ ] Add sorting options (by title, author, last read, date added).
- [ ] Add search/filter functionality for the library.
- [ ] Implement "Remove from Library" with confirmation dialog.
- [ ] Show book metadata on hover/long-press (tooltip or popover).

### 7. Reading Statistics (Basic)
- [ ] Track total reading time per book.
- [ ] Track reading sessions (start/end timestamps).
- [ ] Display "Time spent reading" on book details.

## 🛠 Tech Notes for this Sprint

### State Management
- Extend `bookStore` with reading progress and bookmarks:
  ```typescript
  interface Book {
      path: string;
      title: string;
      author?: string;
      addedAt: number;
      lastReadAt?: number;
      // New fields:
      progress?: number;           // 0-1 fraction
      currentLocation?: string;    // CFI for EPUB, page number for PDF
      totalPages?: number;
      readingTime?: number;        // Total seconds spent reading
  }
  
  interface Bookmark {
      id: string;
      bookPath: string;
      location: string;            // CFI or page number
      label?: string;
      createdAt: number;
  }
  ```

### Storage Strategy
- **Phase 1:** Use localStorage for simplicity (current approach).
- **Phase 2:** Consider migrating to Tauri's SQLite plugin for better performance with large libraries.

### Component Architecture
- Create reusable drawer/sidebar component for TOC and Settings.
- Use shadcn `Sheet` component for slide-out panels.
- Keep reader-specific UI in `reader-shell.svelte` or new child components.

### EPUB Progress Tracking
- Use EPUB CFI (Canonical Fragment Identifier) for precise position tracking.
- foliate-js provides CFI via `view.getCFI()` and `view.lastLocation.cfi`.

### PDF Progress Tracking
- Store current page number and total pages.
- Calculate percentage from `currentPage / totalPages`.

### Keyboard Shortcuts
- Implement via `svelte:window` event listener in reader components.
- Create a `useKeyboardShortcuts` utility or action for reusability.
- Show keyboard shortcuts help modal (accessible via `?` key).

### Mobile Considerations
- Ensure TOC drawer is touch-friendly (full-height slide-in).
- Implement touch gestures using pointer events.
- Test on Android via `bun tauri android dev`.

## 📦 New Dependencies (if needed)
- `@tauri-apps/plugin-sql` - For SQLite persistence (optional, Phase 2).
- No new frontend dependencies expected; leverage existing shadcn components.

## 🎯 Acceptance Criteria
1. User can close and reopen a book, returning to their last position.
2. User can navigate the book using Table of Contents.
3. User can adjust font size and reading preferences.
4. User can add, view, and navigate to bookmarks.
5. Keyboard shortcuts work for all common actions.
6. Library shows reading progress on book cards.

## 📝 Testing Checklist
- [ ] Test progress persistence across app restarts.
- [ ] Test TOC navigation for various EPUB structures.
- [ ] Test PDF outline extraction and navigation.
- [ ] Test reader settings apply correctly to content.
- [ ] Test bookmarks CRUD operations.
- [ ] Test keyboard shortcuts don't conflict with system shortcuts.
- [ ] Test on both desktop and Android (if applicable).