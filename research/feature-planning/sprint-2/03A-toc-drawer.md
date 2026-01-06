# 03A: Table of Contents Drawer

**File:** `src/lib/components/toc-drawer.svelte`  
**Dependencies:** `01A-types.md`, shadcn Sheet component  
**Estimated Time:** 1 hour

## Purpose

Slide-out drawer displaying hierarchical table of contents with current location highlighting and navigation.

## Props

```typescript
interface Props {
    open: boolean;
    onClose: () => void;
    items: TocItem[];                    // From 01A-types
    currentSectionLabel?: string;        // For highlighting current position
    onNavigate: (item: TocItem) => void; // Called when user selects item
}
```

## Features

- Hierarchical display with indentation based on `item.level`
- Expand/collapse for items with `children`
- Highlight current chapter/section
- Auto-expand path to current item when drawer opens
- Show page numbers when available (`item.page`)
- Click to navigate, then auto-close drawer
- Empty state when no TOC available

## UI Structure

```
┌─────────────────────────────────────┐
│ Table of Contents              [X]  │
├─────────────────────────────────────┤
│ ▼ Part One                          │
│   ├─ Chapter 1: Introduction   ←    │  (highlighted = current)
│   ├─ Chapter 2: Getting Started     │
│   └─ Chapter 3: Basics              │
│ ▶ Part Two                          │  (collapsed)
│ ▶ Part Three                        │
└─────────────────────────────────────┘
```

## Component Dependencies

- Use shadcn `Sheet` for the drawer base
- Icons: `~icons/ph/caret-right`, `~icons/ph/caret-down`, `~icons/ph/x`

## Behaviors

- Track expanded item IDs in `$state<Set<string>>`
- On open, expand ancestors of current item
- Match current by comparing `currentSectionLabel` to `item.label`
- Indent children with `padding-left: {level * 16}px`
- Mobile: 48px minimum touch targets

## Acceptance Criteria

- [ ] Uses shadcn Sheet as base
- [ ] Displays hierarchical TOC structure
- [ ] Supports expand/collapse for nested items
- [ ] Highlights current location
- [ ] Auto-expands to current item on open
- [ ] Calls `onNavigate` then `onClose` on item click
- [ ] Shows empty state when `items` is empty
- [ ] Accessible (ARIA tree roles, keyboard nav)