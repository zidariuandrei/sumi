# 07B: OPDS & Library Scanning

**Files:** `src/lib/stores/opds.svelte.ts`, `src-tauri/src/main.rs`
**Dependencies:** None

## Purpose
Automate book discovery and library management.

## OPDS Support
- Implement a parser for OPDS (Open Publication Distribution System) XML feeds.
- Allow adding custom URLs (e.g., Calibre Content Server, Standard Ebooks).
- Browse, search, and download books directly into the library.

## Library Scanning
- Use Tauri's FS plugin or a Rust watcher to monitor specific folders.
- Auto-import new `.epub` / `.pdf` files.
- Metadata cleanup: Use a regex-based "Cleaning" utility to fix messy filenames (e.g., removing [Anna's Archive] tags).
