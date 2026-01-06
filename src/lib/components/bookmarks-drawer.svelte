<script lang="ts">
    import * as Sheet from "$lib/components/ui/sheet";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { Button, buttonVariants } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Textarea } from "$lib/components/ui/textarea";
    import { bookmarksStore } from "$lib/stores/bookmarks.svelte";
    import type { Bookmark } from "$lib/types/reader";
    import IconX from "~icons/ph/x";
    import IconDotsThreeVertical from "~icons/ph/dots-three-vertical";
    import IconTrash from "~icons/ph/trash";
    import IconPencil from "~icons/ph/pencil";
    import IconBookmarkSimple from "~icons/ph/bookmark-simple";
    import { format } from "date-fns";
    import { cn } from "$lib/utils";

    let { 
        open = $bindable(false), 
        onClose, 
        bookPath, 
        onNavigate 
    }: { 
        open: boolean; 
        onClose: () => void; 
        bookPath: string; 
        onNavigate: (location: string) => void; 
    } = $props();

    let bookmarks = $derived(bookmarksStore.getBookmarksForBook(bookPath));
    
    // Edit state
    let editingId = $state<string | null>(null);
    let editLabel = $state("");
    let editNote = $state("");

    function startEditing(bookmark: Bookmark) {
        editingId = bookmark.id;
        editLabel = bookmark.label || "";
        editNote = bookmark.note || "";
    }

    function saveEdit() {
        if (editingId) {
            bookmarksStore.updateBookmark(editingId, {
                label: editLabel,
                note: editNote
            });
            editingId = null;
        }
    }

    function cancelEdit() {
        editingId = null;
    }

    function handleDelete(id: string) {
        bookmarksStore.removeBookmark(id);
    }

    function handleNavigate(bookmark: Bookmark) {
        if (editingId) return; // Don't navigate while editing
        onNavigate(bookmark.location);
        onClose();
    }
</script>

<Sheet.Root bind:open={open} onOpenChange={(v) => !v && onClose()}>
    <Sheet.Content class="w-[300px] sm:w-[400px] flex flex-col p-0">
        <Sheet.Header class="p-4 border-b flex-shrink-0 flex flex-row items-center justify-between space-y-0">
            <Sheet.Title class="flex items-center gap-2">
                <IconBookmarkSimple class="h-5 w-5" />
                Bookmarks
            </Sheet.Title>
            <Button variant="ghost" size="icon" onclick={onClose} class="h-8 w-8">
                <IconX class="h-4 w-4" />
                <span class="sr-only">Close</span>
            </Button>
        </Sheet.Header>

        <div class="flex-1 overflow-y-auto p-4 space-y-4">
            {#if bookmarks.length === 0}
                <div class="flex flex-col items-center justify-center h-64 text-center text-muted-foreground p-4">
                    <div class="bg-muted rounded-full p-4 mb-4">
                        <IconBookmarkSimple class="h-8 w-8 opacity-50" />
                    </div>
                    <p class="font-medium">No bookmarks yet</p>
                    <p class="text-sm mt-1">Press "b" while reading to add a bookmark.</p>
                </div>
            {:else}
                {#each bookmarks as bookmark (bookmark.id)}
                    {#if editingId === bookmark.id}
                        <div class="p-4 border rounded-lg bg-muted/30 space-y-3">
                            <div class="space-y-1">
                                <label for="edit-label" class="text-xs font-medium">Label</label>
                                <Input id="edit-label" bind:value={editLabel} placeholder="Bookmark label..." />
                            </div>
                            <div class="space-y-1">
                                <label for="edit-note" class="text-xs font-medium">Note</label>
                                <Textarea id="edit-note" bind:value={editNote} placeholder="Add a note..." class="min-h-[80px]" />
                            </div>
                            <div class="flex justify-end gap-2 pt-2">
                                <Button variant="ghost" size="sm" onclick={cancelEdit}>Cancel</Button>
                                <Button size="sm" onclick={saveEdit}>Save</Button>
                            </div>
                        </div>
                    {:else}
                        <div class="group relative flex flex-col border rounded-lg hover:border-primary/50 transition-colors bg-card">
                            <div 
                                class="p-3 cursor-pointer"
                                onclick={() => handleNavigate(bookmark)}
                                onkeydown={(e) => e.key === 'Enter' && handleNavigate(bookmark)}
                                role="button"
                                tabindex="0"
                            >
                                <div class="flex justify-between items-start gap-2 mb-1">
                                    <span class="font-medium text-sm line-clamp-1">
                                        {bookmark.label || (bookmark.displaySection ? bookmark.displaySection : `Bookmark`)}
                                    </span>
                                    <span class="text-xs text-muted-foreground whitespace-nowrap">
                                        {#if bookmark.displayPage}
                                            Page {bookmark.displayPage}
                                        {/if}
                                    </span>
                                </div>
                                
                                {#if bookmark.note}
                                    <p class="text-xs text-muted-foreground line-clamp-2 mt-1 mb-2 italic">
                                        "{bookmark.note}"
                                    </p>
                                {/if}

                                <div class="flex items-center justify-between mt-2">
                                    <span class="text-[10px] text-muted-foreground">
                                        {format(bookmark.createdAt, 'MMM d, yyyy')}
                                    </span>
                                </div>
                            </div>

                            <div class="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                                <DropdownMenu.Root>
                                    <DropdownMenu.Trigger class={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-6 w-6")}>
                                        <IconDotsThreeVertical class="h-3 w-3" />
                                        <span class="sr-only">Menu</span>
                                    </DropdownMenu.Trigger>
                                    <DropdownMenu.Content align="end">
                                        <DropdownMenu.Item onclick={() => startEditing(bookmark)}>
                                            <IconPencil class="mr-2 h-4 w-4" />
                                            Edit
                                        </DropdownMenu.Item>
                                        <DropdownMenu.Item onclick={() => handleDelete(bookmark.id)} class="text-destructive focus:text-destructive">
                                            <IconTrash class="mr-2 h-4 w-4" />
                                            Delete
                                        </DropdownMenu.Item>
                                    </DropdownMenu.Content>
                                </DropdownMenu.Root>
                            </div>
                        </div>
                    {/if}
                {/each}
            {/if}
        </div>
    </Sheet.Content>
</Sheet.Root>
