# 03B: Settings Drawer Component

**File:** `src/lib/components/settings-drawer.svelte`  
**Dependencies:** `02B-settings-store.md`, shadcn Sheet component  
**Estimated Time:** 1 hour

## Purpose

Slide-out panel for adjusting reader display settings (font, size, spacing, alignment). Uses shadcn Sheet component as base.

## Props

```typescript
interface Props {
    open: boolean;
    onClose: () => void;
}
```

## UI Structure

```
┌─────────────────────────────────────┐
│ Reader Settings               [X]   │
├─────────────────────────────────────┤
│                                     │
│ Font Family                         │
│ [Serif ▼]                           │
│                                     │
│ Font Size                           │
│ [-] ████████░░ 18px [+]             │
│                                     │
│ Line Height                         │
│ [-] █████░░░░░ 1.6  [+]             │
│                                     │
│ Margins                             │
│ Horizontal: ████████░░ 24px         │
│ Vertical:   ████░░░░░░ 16px         │
│                                     │
│ Text Alignment                      │
│ [Left] [Justify]                    │
│                                     │
├─────────────────────────────────────┤
│ [Reset to Defaults]                 │
└─────────────────────────────────────┘
```

## Integration

```svelte
<script lang="ts">
    import { settingsStore, FONT_SIZE_MIN, FONT_SIZE_MAX, FONT_FAMILIES } from '$lib/stores/settings.svelte';
    
    let settings = $derived(settingsStore.activeSettings);
</script>
```

- Bind controls to `settingsStore.updateGlobal()` or `settingsStore.updateForBook()` based on context
- Import constraint constants from settings store for slider min/max
- Changes apply immediately (no save button needed)
- Show current values next to sliders

## Controls

| Setting | Control Type | Notes |
|---------|--------------|-------|
| Font Family | Dropdown/Select | Options from `FONT_FAMILIES` |
| Font Size | Slider + buttons | Min 12, Max 32, Step 2 |
| Line Height | Slider | Min 1.0, Max 2.5, Step 0.1 |
| Margin H/V | Sliders | Min 0, Max 100, Step 8 |
| Text Align | Toggle buttons | Left / Justify |

## Mobile Considerations

- Full-height slide-in from right side
- Large touch targets (48px min)
- Sliders should be easy to drag on touch

## Acceptance Criteria

- [ ] Uses shadcn Sheet component
- [ ] All settings from `ReaderSettings` type adjustable
- [ ] Changes apply immediately to reader
- [ ] Shows current values for all settings
- [ ] Reset button reverts to defaults
- [ ] Mobile responsive with touch-friendly controls
- [ ] Closes on Escape key