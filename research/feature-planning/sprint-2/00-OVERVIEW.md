# Sprint 2: Overview & Dependency Map

## Implementation Order

### Level 0 - Foundation (No Dependencies)
| File | Creates | Est. Time |
|------|---------|-----------|
| `01A-types.md` | `src/lib/types/reader.ts` | 30 min |
| `01B-storage-utility.md` | `src/lib/utils/storage.ts` | 30 min |
| `01C-keyboard-utility.md` | `src/lib/utils/keyboard.ts` | 30 min |

### Level 1 - Stores (Depends on Level 0)
| File | Creates/Modifies | Est. Time |
|------|------------------|-----------|
| `02A-book-store-extension.md` | Modifies `src/lib/stores/book.svelte.ts` | 1 hr |
| `02B-settings-store.md` | `src/lib/stores/settings.svelte.ts` | 45 min |
| `02C-bookmarks-store.md` | `src/lib/stores/bookmarks.svelte.ts` | 45 min |
| `02D-reading-stats-store.md` | `src/lib/stores/stats.svelte.ts` | 30 min |

### Level 2 - UI Components (Depends on Level 0-1)
| File | Creates | Est. Time |
|------|---------|-----------|
| `03A-toc-drawer.md` | `src/lib/components/toc-drawer.svelte` | 1 hr |
| `03B-settings-drawer.md` | `src/lib/components/settings-drawer.svelte` | 1 hr |
| `03C-bookmarks-drawer.md` | `src/lib/components/bookmarks-drawer.svelte` | 1 hr |
| `03D-goto-dialog.md` | `src/lib/components/goto-dialog.svelte` | 30 min |
| `03E-shortcuts-modal.md` | `src/lib/components/shortcuts-modal.svelte` | 30 min |

### Level 3 - Reader Integration (Depends on Level 0-2)
| File | Modifies | Est. Time |
|------|----------|-----------|
| `04A-epub-reader-updates.md` | `src/lib/components/epub-reader.svelte` | 1.5 hr |
| `04B-pdf-reader-updates.md` | `src/lib/components/pdf-reader.svelte` | 1.5 hr |
| `04C-reader-shell-updates.md` | `src/lib/components/reader-shell.svelte` | 1 hr |

### Level 4 - Library Updates (Depends on Level 1)
| File | Modifies | Est. Time |
|------|----------|-----------|
| `05A-library-updates.md` | `src/routes/+page.svelte`, `src/lib/components/book-card.svelte` | 1.5 hr |

## Dependency Graph

```
01A-types ─────────┬──► 02A-book-store ──────┬──► 04A-epub-reader
01B-storage ───────┤                         │
                   ├──► 02B-settings-store ──┼──► 04B-pdf-reader
01C-keyboard ──────┤                         │
                   ├──► 02C-bookmarks-store ─┼──► 04C-reader-shell
                   │                         │
                   └──► 02D-stats-store ─────┴──► 05A-library-updates
                   
                   ├──► 03A-toc-drawer ──────┐
                   ├──► 03B-settings-drawer ─┤
                   ├──► 03C-bookmarks-drawer ┼──► 04C-reader-shell
                   ├──► 03D-goto-dialog ─────┤
                   └──► 03E-shortcuts-modal ─┘
```

## Feature-to-File Mapping

| Sprint 2 Feature | Implementation Files |
|------------------|---------------------|
| Reading Progress Persistence | 01A, 01B, 02A, 04A, 04B, 05A |
| Table of Contents Navigation | 01A, 03A, 04A, 04B, 04C |
| Reader Settings Panel | 01A, 01B, 02B, 03B, 04A, 04B |
| Bookmarks System | 01A, 01B, 02C, 03C, 04C |
| Enhanced Navigation | 01C, 03D, 03E, 04C |
| Improved Library View | 02A, 05A |
| Reading Statistics | 01A, 01B, 02D, 05A |

## Parallelization

Tasks at the same level can be implemented in parallel. Recommended approach:
1. Complete all Level 0 tasks first (can be parallel)
2. Complete all Level 1 tasks (can be parallel)
3. Complete Level 2 and Level 3 tasks (UI components can parallel with reader integration)
4. Finish with Level 4 library updates