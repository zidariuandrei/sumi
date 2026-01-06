# 08A: WebDAV Sync & Ecosystem

**Files:** `src/lib/stores/sync.svelte.ts`, `src/lib/utils/webdav.ts`
**Dependencies:** `webdav-client` (optional)

## Purpose
Sync reading state across devices without a central server.

## Implementation
- **Provider**: Support any WebDAV provider (Nextcloud, Dropbox via bridge, etc.).
- **Data Sync**:
    - Sync `recentBooks` (reading progress).
    - Sync `annotations` (highlights/notes).
    - Sync `settings` (global preferences).
- **Conflict Resolution**: "Last Write Wins" based on timestamps.
- **Background Sync**: Trigger sync on app start, book close, and periodically.

## Privacy
- All data is encrypted or stored in the user's own cloud.
- No third-party servers involved in the sync process.
