# Svelte 5 & SvelteKit Knowledge Base

## Core Concepts (Svelte 5)

### Runes
Svelte 5 introduces "runes" for reactivity, replacing the legacy `let` + `$:` syntax.

- **$state**: Declares reactive state.
  ```typescript
  let count = $state(0);
  ```
- **$derived**: Declares derived state (re-runs when dependencies change).
  ```typescript
  let double = $derived(count * 2);
  ```
- **$effect**: Side effects (replaces `onMount`, `afterUpdate`, etc. in many cases).
  ```typescript
  $effect(() => {
    console.log(count);
    return () => { /* cleanup */ };
  });
  ```
- **$props**: Declares component props.
  ```typescript
  let { title, children }: { title: string, children: any } = $props();
  ```

### Snippets
Reusable blocks of markup within a component (replaces `<slot>` and some usages of separate components).
```svelte
{#snippet myButton(text)}
  <button>{text}</button>
{/snippet}

{@render myButton('Click Me')}
```

### Event Handling
Events are now standard properties.
- **Old:** `on:click={handler}`
- **New:** `onclick={handler}`

## SvelteKit in Tauri Context

### Adapter Static
Since Tauri acts as a static host for the webview:
- **`ssr: false`** is mandatory in the root layout or config to prevent server-side rendering errors.
- **`adapter-static`** is used to generate the `build/` folder (HTML/CSS/JS) which Tauri bundles.

### Routing
- File-system based routing in `src/routes`.
- Use `+layout.svelte` for persistent UI (navbars, sidebars).
- Use `+page.svelte` for route content.
- Use `+page.ts` for client-side data loading (load functions run in the browser).

## Rules & Conventions
1. **Prefer Runes:** Always use Runes syntax for new components. Avoid legacy Reactivity where possible.
2. **Type Safety:** Explicitly type `$props()` interfaces.
3. **No Server Code:** Do not use `+page.server.ts` or `+layout.server.ts` as there is no Node.js server at runtime. Use `+page.ts` or Tauri Commands.
