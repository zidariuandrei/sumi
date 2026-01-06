<script lang="ts">
  import { invoke } from '@tauri-apps/api/core';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import type { Book } from '$lib/stores/book.svelte';
  import { bookStore } from '$lib/stores/book.svelte';
  import IconFilePdf from '~icons/ph/file-pdf-light';
  import IconFileText from '~icons/ph/file-text-light';
  import IconTrash from '~icons/ph/trash-light';
  import { Button } from '$lib/components/ui/button';

  let { book }: { book: Book } = $props();

  let isPdf = $derived(book.path.toLowerCase().endsWith('.pdf'));
  let isEpub = $derived(book.path.toLowerCase().endsWith('.epub'));
  let coverImage = $state<string | null>(null);

  onMount(async () => {
    try {
        coverImage = await invoke('get_cover', { filePath: book.path });
    } catch (e) {
        console.error(`Failed to load cover for ${book.title}:`, e);
    }
  });

  function openBook() {
    bookStore.openBook(book.path);
    goto('/reader');
  }

  function removeBook(e: MouseEvent) {
    e.stopPropagation();
    bookStore.removeBook(book.path);
  }
</script>

<button 
  onclick={openBook}
  class="group relative flex flex-col gap-3 rounded-xl border bg-card p-3 text-left transition-all hover:border-primary/50 hover:shadow-lg"
>
  <div class="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-muted flex items-center justify-center">
    {#if coverImage}
        <img src={coverImage} alt={book.title} class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
    {:else if isPdf}
      <IconFilePdf class="h-16 w-16 text-muted-foreground/40" />
    {:else if isEpub}
      <IconFileText class="h-16 w-16 text-muted-foreground/40" />
    {:else}
      <div class="h-16 w-16 text-muted-foreground/40">?</div>
    {/if}
    
    <div class="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100 z-10">
        <Button 
            variant="destructive" 
            size="icon" 
            class="h-8 w-8 shadow-sm" 
            onclick={removeBook}
        >
            <IconTrash class="h-4 w-4" />
        </Button>
    </div>
  </div>

  <div class="flex flex-col gap-1 overflow-hidden">
    <h3 class="truncate text-sm font-medium leading-tight group-hover:text-primary">
      {book.title}
    </h3>
    {#if book.author}
      <p class="truncate text-xs text-muted-foreground">
        {book.author}
      </p>
    {/if}
  </div>
</button>
