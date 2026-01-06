# 01C: Keyboard Shortcuts Utility

**File:** `src/lib/utils/keyboard.ts`
**Dependencies:** `01A-types.md`
**Estimated Time:** 1 hour

## Purpose

Centralized keyboard shortcut handling for the reader. Provides a registry of shortcuts, event matching, and helpers for displaying shortcuts in a help modal.

## Shortcuts to Implement

| Key | Action | Category |
|-----|--------|----------|
| `←` / `→` | Previous/Next page | navigation |
| `Space` / `Shift+Space` | Next/Previous page | navigation |
| `Home` / `End` | Start/End of book | navigation |
| `t` | Toggle TOC | ui |
| `b` | Add bookmark | ui |
| `Shift+B` | Toggle bookmarks panel | ui |
| `s` | Toggle settings | ui |
| `g` | Go to page dialog | ui |
| `Escape` | Close panel | ui |
| `?` | Show shortcuts help | ui |
| `+` / `-` / `0` | Font size controls | reading |

## Exports

```typescript
// Shortcut registry constant
export const SHORTCUTS: ShortcutsRegistry;

// Check if event matches a shortcut
export function matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean;

// Find which action an event triggers
export function findMatchingAction(event: KeyboardEvent): string | null;

// Check if target is an input (skip shortcuts when typing)
export function isInputElement(target: EventTarget | null): boolean;

// Create a keydown handler from action->function map
export function createKeyboardHandler(handlers: Record<string, () => void>): (e: KeyboardEvent) => void;

// Group shortcuts by category for help modal
export function getShortcutsByCategory(): Record<string, KeyboardShortcut[]>;

// Format shortcut for display (handles Mac vs Windows)
export function formatShortcutDisplay(shortcut: KeyboardShortcut): string;
```

## Key Behaviors

- Detect Mac (`metaKey`) vs Windows/Linux (`ctrlKey`) for modifier display
- Skip shortcuts when focus is in input/textarea/contenteditable
- Call `preventDefault()` only for matched shortcuts
- Support case-insensitive letter matching

## Acceptance Criteria

- [ ] All shortcuts defined in `SHORTCUTS` registry
- [ ] `createKeyboardHandler` works with partial action maps
- [ ] Shortcuts disabled when typing in inputs
- [ ] Mac displays `⌘`, Windows displays `Ctrl`
- [ ] `getShortcutsByCategory()` groups correctly for help modal