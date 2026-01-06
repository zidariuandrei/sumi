<script lang="ts">
  import { onMount } from 'svelte';
  import { invoke } from '@tauri-apps/api/core';
  import { goto } from '$app/navigation';
  import IconBooks from '~icons/ph/books-light';
  import IconPlus from '~icons/ph/plus-light';
  import IconPlay from '~icons/ph/play-fill';
  import IconMagnifyingGlass from '~icons/ph/magnifying-glass-light';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Badge } from '$lib/components/ui/badge';
  import * as Tabs from '$lib/components/ui/tabs';
  import * as Select from '$lib/components/ui/select';
  import { bookStore, type Book } from '$lib/stores/book.svelte';
  import BookCard from '$lib/components/book-card.svelte';

  let searchQuery = $state('');
  let sortBy = $state('recent');
  let filterBy = $state('all');
  let lastReadCover = $state<string | null>(null);

  const filteredBooks = $derived(
    bookStore.recentBooks
        .filter((b: Book) => {
            const matchesSearch = !searchQuery || 
                b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                b.author?.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesFilter = filterBy === 'all' || 
                (filterBy === 'reading' && (b.progress || 0) > 0 && (b.progress || 0) < 0.99) ||
                (filterBy === 'finished' && (b.progress || 0) >= 0.99) ||
                (filterBy === 'unread' && (b.progress || 0) === 0);
                
            return matchesSearch && matchesFilter;
        })
        .sort((a: Book, b: Book) => {
            if (sortBy === 'recent') return (b.lastReadAt || 0) - (a.lastReadAt || 0);
            if (sortBy === 'title') return a.title.localeCompare(b.title);
            if (sortBy === 'author') return (a.author || '').localeCompare(b.author || '');
            if (sortBy === 'added') return (b.addedAt || 0) - (a.addedAt || 0);
            return 0;
        })
  );

  const lastReadBook = $derived(bookStore.lastReadBook);

  $effect(() => {
    if (lastReadBook) {
        invoke('get_cover', { filePath: lastReadBook.path })
            .then(cover => lastReadCover = cover as string)
            .catch(() => lastReadCover = null);
    } else {
        lastReadCover = null;
    }
  });

  async function handleOpenFile() {
    await bookStore.openFile();
    if (bookStore.activeBookPath) {
      goto('/reader');
    }
  }

  function resumeLastBook() {
    if (lastReadBook) {
        bookStore.openBook(lastReadBook.path);
        goto('/reader');
    }
  }

  const sortOptions = [
    { value: 'recent', label: 'Recently Read' },
    { value: 'title', label: 'Title' },
    { value: 'author', label: 'Author' },
    { value: 'added', label: 'Date Added' }
  ];
</script>

<div class="container mx-auto max-w-6xl p-6 pb-20 space-y-8">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
    <h1 class="text-3xl font-light tracking-tight flex items-center gap-3">
        <IconBooks class="h-8 w-8 text-primary" />
        Library
    </h1>
    <Button onclick={handleOpenFile} class="gap-2 shadow-sm">
        <IconPlus class="h-4 w-4" />
        Open Book
    </Button>
  </div>

  <!-- Hero Section: Continue Reading -->
  {#if lastReadBook}
    <section class="animate-in fade-in slide-in-from-top-4 duration-500">
        <h2 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Continue Reading</h2>
        <div class="group relative overflow-hidden rounded-2xl border bg-card p-4 sm:p-6 shadow-sm transition-all hover:shadow-md">
            <div class="flex flex-col sm:flex-row gap-6">
                <!-- Cover -->
                <div class="relative w-full sm:w-32 aspect-[3/4] shrink-0 overflow-hidden rounded-lg bg-muted shadow-sm">
                    {#if lastReadCover}
                        <img src={lastReadCover} alt={lastReadBook.title} class="h-full w-full object-cover" />
                    {:else}
                        <div class="h-full w-full flex items-center justify-center text-muted-foreground/20">
                            <IconBooks class="h-12 w-12" />
                        </div>
                    {/if}
                    <div class="absolute bottom-0 left-0 right-0 h-1.5 bg-background/50 backdrop-blur-sm">
                        <div 
                            class="h-full bg-primary" 
                            style="width: {Math.round((lastReadBook.progress || 0) * 100)}%"
                        ></div>
                    </div>
                </div>

                <!-- Info -->
                <div class="flex flex-col justify-center flex-1 gap-2">
                    <div class="space-y-1">
                        <h3 class="text-xl font-bold leading-tight">{lastReadBook.title}</h3>
                        {#if lastReadBook.author}
                            <p class="text-muted-foreground">{lastReadBook.author}</p>
                        {/if}
                    </div>

                    <div class="flex items-center gap-3 mt-2">
                        <Badge variant="secondary" class="font-normal">
                            {Math.round((lastReadBook.progress || 0) * 100)}% completed
                        </Badge>
                        {#if lastReadBook.lastReadAt}
                            <span class="text-xs text-muted-foreground">
                                Last read {new Date(lastReadBook.lastReadAt).toLocaleDateString()}
                            </span>
                        {/if}
                    </div>

                    <div class="mt-4">
                        <Button onclick={resumeLastBook} class="gap-2">
                            <IconPlay class="h-4 w-4" />
                            Resume Reading
                        </Button>
                    </div>
                </div>
            </div>
            
            <!-- Background Decoration -->
            <div class="absolute -right-8 -bottom-8 opacity-[0.03] pointer-events-none">
                <IconBooks class="h-48 w-48 rotate-12" />
            </div>
        </div>
    </section>
  {/if}

  <!-- Toolbar -->
  <div class="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t">
    <div class="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
        <Tabs.Root value={filterBy} onValueChange={(v) => filterBy = v} class="w-full sm:w-auto">
            <Tabs.List>
                <Tabs.Trigger value="all">All</Tabs.Trigger>
                <Tabs.Trigger value="reading">Reading</Tabs.Trigger>
                <Tabs.Trigger value="unread">Unread</Tabs.Trigger>
                <Tabs.Trigger value="finished">Finished</Tabs.Trigger>
            </Tabs.List>
        </Tabs.Root>

        <div class="relative w-full sm:w-64">
            <IconMagnifyingGlass class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Search library..." 
                bind:value={searchQuery}
                class="pl-9 bg-muted/50 border-none focus-visible:ring-1"
            />
        </div>
    </div>

    <div class="flex items-center gap-2 w-full md:w-auto justify-end">
        <span class="text-xs text-muted-foreground whitespace-nowrap">Sort by:</span>
        <Select.Root type="single" value={sortBy} onValueChange={(v) => sortBy = v}>
            <Select.Trigger class="w-[160px] h-9 text-xs">
                {sortOptions.find(o => o.value === sortBy)?.label}
            </Select.Trigger>
            <Select.Content>
                {#each sortOptions as option}
                    <Select.Item value={option.value}>{option.label}</Select.Item>
                {/each}
            </Select.Content>
        </Select.Root>
    </div>
  </div>

  <!-- Library Grid -->
  {#if filteredBooks.length > 0}
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 sm:gap-8">
        {#each filteredBooks as book (book.path)}
            <BookCard {book} />
        {/each}
    </div>
  {:else}
    <div class="flex flex-col items-center justify-center py-24 text-muted-foreground border-2 border-dashed rounded-2xl gap-4">
        <div class="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            <IconBooks class="h-8 w-8 opacity-40" />
        </div>
        <div class="text-center space-y-1">
            <p class="font-medium">No books found</p>
            <p class="text-sm opacity-60">
                {#if searchQuery || filterBy !== 'all'}
                    Try adjusting your search or filters.
                {:else}
                    Your library is empty. Open a book to get started.
                {/if}
            </p>
        </div>
        {#if !searchQuery && filterBy === 'all'}
            <Button onclick={handleOpenFile} variant="secondary" size="sm" class="mt-2">
                Browse Files
            </Button>
        {/if}
    </div>
  {/if}
</div>