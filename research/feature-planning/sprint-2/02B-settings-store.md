# 02B: Reader Settings Store

**File:** `src/lib/stores/settings.svelte.ts`  
**Dependencies:** `01A-types.md`, `01B-storage-utility.md`  
**Estimated Time:** 45 min

## Purpose

Svelte 5 store for reader display settings (font, size, spacing, margins). Supports global defaults and per-book overrides.

## Store Structure

```typescript
class SettingsStore {
    globalSettings = $state<ReaderSettings>(DEFAULT_READER_SETTINGS);
    bookSettings = $state<Record<string, Partial<ReaderSettings>>>({});
    activeBookPath = $state<string | null>(null);
    
    // Computed: merges global + book-specific
    get activeSettings(): ReaderSettings;
    
    // Methods
    updateGlobal(updates: Partial<ReaderSettings>): void;
    updateForBook(bookPath: string, updates: Partial<ReaderSettings>): void;
    getSettingsForBook(bookPath: string): ReaderSettings;
    clearBookSettings(bookPath: string): void;
    hasBookSettings(bookPath: string): boolean;
    setActiveBook(bookPath: string | null): void;
    
    // Font size helpers (for keyboard shortcuts)
    increaseFontSize(): void;
    decreaseFontSize(): void;
    resetFontSize(): void;
    
    // Reset
    resetGlobal(): void;
    resetAll(): void;
}
```

## Constraints

Export these constants for UI sliders/validation:

```typescript
FONT_SIZE_MIN = 12
FONT_SIZE_MAX = 32
FONT_SIZE_STEP = 2
LINE_HEIGHT_MIN = 1.0
LINE_HEIGHT_MAX = 2.5
MARGIN_MIN = 0
MARGIN_MAX = 100
```

## Storage Keys

- Global: `sumi:readerSettings`
- Per-book: `sumi:bookSpecificSettings`

## Behaviors

- Load from storage on construction (SSR safe)
- Validate all values within min/max bounds
- `activeSettings` merges global with book overrides (book wins)
- Font size helpers operate on active book if set, otherwise global

## Acceptance Criteria

- [ ] Uses Svelte 5 `$state()` for reactive properties
- [ ] Persists to localStorage via storage utility
- [ ] `getSettingsForBook()` correctly merges settings
- [ ] Font size helpers respect min/max bounds
- [ ] All constraint constants exported