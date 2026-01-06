<script lang="ts">
  import { goto } from '$app/navigation';
  import IconBooks from '~icons/ph/books-light';
  import IconPlus from '~icons/ph/plus-light';
  import { Button } from '$lib/components/ui/button';
  import { bookStore } from '$lib/stores/book.svelte';
  import BookCard from '$lib/components/book-card.svelte';

  async function handleOpenFile() {
    await bookStore.openFile();
    if (bookStore.activeBookPath) {
      goto('/reader');
    }
  }
</script>

<div class="container mx-auto max-w-6xl p-6 space-y-8">
  <div class="flex items-center justify-between">
    <h1 class="text-3xl font-light tracking-tight flex items-center gap-3">
        <IconBooks class="h-8 w-8" />
        Library
    </h1>
    <Button onclick={handleOpenFile} variant="outline" class="gap-2">
        <IconPlus class="h-4 w-4" />
        Open Book
    </Button>
  </div>

  {#if bookStore.activeBookPath}
    <div class="rounded-xl border bg-accent/50 p-4 text-sm flex items-center justify-between animate-in fade-in slide-in-from-top-2">
        <div class="flex items-center gap-2">
            <span class="font-medium text-muted-foreground">Reading now:</span>
            <span class="font-semibold">{bookStore.activeBook?.title || bookStore.activeBookPath.split(/[/\\]/).pop()}</span>
            {#if bookStore.activeBook?.author}
                <span class="text-muted-foreground hidden sm:inline">• {bookStore.activeBook.author}</span>
            {/if}
        </div>
        <Button variant="ghost" size="sm" onclick={() => bookStore.activeBookPath = null}>Close</Button>
    </div>
  {/if}

  {#if bookStore.recentBooks.length > 0}
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {#each bookStore.recentBooks as book (book.path)}
            <BookCard {book} />
        {/each}
    </div>
  {:else}
    <div class="flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed rounded-2xl gap-4">
        <IconBooks class="h-12 w-12 opacity-20" />
        <p>Your library is empty. Open a book to get started.</p>
        <Button onclick={handleOpenFile} variant="secondary" size="sm">
            Browse Files
        </Button>
    </div>
  {/if}
</div>
