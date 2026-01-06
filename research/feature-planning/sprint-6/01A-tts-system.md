# 06A: Text-to-Speech (TTS)

**Files:** `src/lib/stores/tts.svelte.ts`, `src/lib/components/reader-shell.svelte`
**Dependencies:** Web Speech API

## Purpose
Allow users to listen to their books while multi-tasking.

## Implementation
- **Voice Selection**: List available system voices.
- **Queue Management**: Extract text from the current chapter/page and queue it sentence by sentence.
- **Sync**: Highlight the currently spoken sentence in the reader UI.
- **Media Session**: Integrate with browser/OS media controls (Play/Pause/Next) so it can be controlled from the lock screen or keyboard.
- **Playback Speed**: Range from 0.5x to 2.5x.
