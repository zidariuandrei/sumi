# Sprint 1: The Foundation (MVP Shell)

**Goal:** Establish the core application structure, enable file selection, and render a basic reading view.

## 📋 Features & Tasks

### 1. Application Shell & Navigation
- [x] Integrate iconify via unplugin icons library.
- [x] Sumi means ink in japanase, which leads to the main theme of the app, a sleek and minimalist black and white theme where animations are vivid and fast. Create a visual identity of the application, define a shadcn and tailwind config that fits, find a font, an icon library that suits the needs.
- [x] Create a responsive layout with a sidebar (shadcn `Sidebar` or `NavigationMenu`).
- [x] Implement views for: **Library**, **Reader**, and **Settings**.

### 2. File Selection (Tauri Integration)
- [x] Integrate `@tauri-apps/plugin-dialog`.
- [x] Add an "Open File" button in the Library view.
- [x] Implement logic to select `.epub` or `.pdf` files and store the file path in state.

### 3. Basic Ebook Reader View
- [x] Integrate a reading engine (pdfjs is kind of the industry standard).
- [x] Implement a basic container to render ebook content.
- [x] Add "Next Page" and "Previous Page" controls.

### 4. Library Management (Initial)
- [x] Create a grid/list view for "Recent Books".
- [x] Persist the path of the last opened book (using localStorage).
- [x] Extract and display book covers (EPUB support via Rust backend, PDF support via lopdf on rust backend).
- [x] sanitizing book name and author out of the file metadata.

### 5. Theme & Appearance
- [x] Setup Dark/Light mode switching using Tailwind 4.
- [x] Add a "Theme Toggle" in the Settings or Header.

## 🛠 Tech Notes for this Sprint
- Use **Svelte 5 Runes** (`$state`) for managing the current active view and the open book metadata.
- Use **Tauri Dialog Plugin** for native file pickers.
- Use **shadcn-svelte** components for the Sidebar, Buttons, and Dialogs.
- use the programming paradigm of imperative shell, functional core as much as possible
- keep in mind dark and white theming and the coesive design structure.
- use as few libraries as possible.
- write unit tests and documentat the process.
