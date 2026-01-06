<script lang="ts">
    import IconBookOpen from '~icons/ph/book-open-light';
    import { bookStore } from '$lib/stores/book.svelte';
    import PdfReader from '$lib/components/pdf-reader.svelte';
    import EpubReader from '$lib/components/epub-reader.svelte';

    let isPdf = $derived(bookStore.activeBookPath?.toLowerCase().endsWith('.pdf'));
    let isEpub = $derived(bookStore.activeBookPath?.toLowerCase().endsWith('.epub'));
</script>

<div class="h-full w-full">
    {#if bookStore.activeBookPath}
        {#if isPdf}
            <PdfReader path={bookStore.activeBookPath} />
        {:else if isEpub}
            <EpubReader path={bookStore.activeBookPath} />
        {:else}
            <!-- Fallback for unsupported formats -->
            <div class="flex h-full flex-col items-center justify-center space-y-4 text-muted-foreground">
                <div class="space-y-2 text-center">
                    <h2 class="text-xl font-medium text-foreground">
                        {bookStore.activeBook?.title || bookStore.activeBookPath.split(/[/\\]/).pop()}
                    </h2>
                    {#if bookStore.activeBook?.author}
                        <p class="text-sm">{bookStore.activeBook.author}</p>
                    {/if}
                    <p class="text-sm italic">Unsupported format</p>
                </div>
            </div>
        {/if}
    {:else}
        <div class="flex h-full flex-col items-center justify-center space-y-4 text-muted-foreground">
            <IconBookOpen class="h-16 w-16 opacity-20" />
            <p>No book open</p>
        </div>
    {/if}
</div>
