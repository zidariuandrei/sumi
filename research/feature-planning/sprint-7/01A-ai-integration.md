# 07A: AI Integration (OpenRouter)

**Files:** `src/lib/stores/ai.svelte.ts`, `src/lib/components/ai-sidebar.svelte`
**Dependencies:** OpenRouter API Key

## Purpose
Use LLMs to enhance the reading and research experience.

## Features
- **Contextual Chat**: Ask questions about the current book. The system sends the current chapter/selected text as context.
- **Smart Summaries**: Automatically summarize long chapters or highlighted sections.
- **Key Term Extraction**: Identify and explain complex jargon or historical figures.
- **Tone Analysis**: (Optional) Summarize the "mood" of a section.

## Configuration
- User enters their own OpenRouter API key.
- Choice of model (e.g., Claude 3 Haiku for speed, GPT-4o for depth).
- Usage tracking to manage API costs.
