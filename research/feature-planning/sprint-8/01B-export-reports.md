# 08B: Export, Backup & Reports

**Files:** `src/lib/components/stats-view.svelte`, `src/lib/utils/export.ts`
**Dependencies:** `date-fns`, `chart.js` (optional)

## Purpose
Visualize reading habits and ensure data portability.

## Reading Reports
- **Visualizations**: Charts for "Pages Read per Day", "Time spent in genres", etc.
- **Milestones**: "Finished 5 books this month", "30-day streak".

## Export & Backup
- **Manual Backup**: Export entire Sumi database (JSON) to a single file.
- **Annotation Export**:
    - Format: Markdown (compatible with Obsidian/Logseq).
    - Format: PDF (Styled summary of notes).
    - Format: JSON (for developers).

## Final Polish
- Ensure all Svelte 5 runes are optimized.
- Final performance pass on large PDF rendering.
