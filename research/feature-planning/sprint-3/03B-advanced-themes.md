# 03B: Advanced Themes

**Files:** `src/lib/stores/settings.svelte.ts`, `src/lib/components/settings-drawer.svelte`
**Dependencies:** `02B-settings-store.md` (Sprint 2)

## Purpose
Expand the reader's visual comfort options beyond simple Light/Dark.

## Implementation
- **Theme Presets**:
    - **Sepia**: Warm background, dark brown text.
    - **Solarized**: Low-contrast greenish/blue theme.
    - **Paper**: High-contrast textured background.
    - **OLED Black**: Pure black for battery saving.
- **Dynamic CSS Injection**: Update the `getReaderCSS` function in `epub-reader.svelte` to support complex color palettes.
- **Custom CSS**: Add a textarea in the settings drawer for power users to inject their own CSS overrides into the reader iframe.
