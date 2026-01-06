<script lang="ts">
    import * as Sheet from "$lib/components/ui/sheet";
    import { Button } from "$lib/components/ui/button";
    import type { TocItem } from "$lib/types/reader";
    import IconCaretRight from "~icons/ph/caret-right";
    import IconCaretDown from "~icons/ph/caret-down";
    import IconX from "~icons/ph/x";
    import { cn } from "$lib/utils";

    interface Props {
        open: boolean;
        onClose: () => void;
        items: TocItem[];
        currentSectionLabel?: string;
        onNavigate: (item: TocItem) => void;
    }

    let { 
        open = $bindable(false), 
        onClose, 
        items = [], 
        currentSectionLabel, 
        onNavigate 
    }: Props = $props();

    let expandedIds = $state(new Set<string>());

    // Effect to expand path to current item when drawer opens or current label changes
    $effect(() => {
        if (open && currentSectionLabel) {
            const idsToExpand = new Set<string>();
            
            function findAndCollectPath(currentItems: TocItem[], targetLabel: string, path: string[]): boolean {
                for (const item of currentItems) {
                    if (item.label === targetLabel) {
                        path.forEach(id => idsToExpand.add(id));
                        return true;
                    }
                    if (item.children && item.children.length > 0) {
                        path.push(item.id);
                        if (findAndCollectPath(item.children, targetLabel, path)) {
                            return true;
                        }
                        path.pop();
                    }
                }
                return false;
            }

            findAndCollectPath(items, currentSectionLabel, []);
            
            // Only update if we have new expansions to avoid resets
            if (idsToExpand.size > 0) {
                 // Merge with existing expanded
                 idsToExpand.forEach(id => expandedIds.add(id));
            }
        }
    });

    function toggleExpand(id: string, e: Event) {
        e.stopPropagation();
        const newSet = new Set(expandedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        expandedIds = newSet;
    }

    function handleNavigate(item: TocItem) {
        onNavigate(item);
        onClose();
    }
</script>

<Sheet.Root bind:open={open} onOpenChange={(v) => !v && onClose()}>
    <Sheet.Content side="left" class="w-[300px] sm:w-[350px] p-0 flex flex-col h-full bg-background border-r">
        <Sheet.Header class="p-4 border-b flex-shrink-0 flex flex-row items-center justify-between">
            <Sheet.Title>Table of Contents</Sheet.Title>
            <Button variant="ghost" size="icon" onclick={onClose} class="h-8 w-8">
                <IconX class="h-4 w-4" />
                <span class="sr-only">Close</span>
            </Button>
        </Sheet.Header>

        <div class="flex-1 overflow-y-auto py-2">
            {#if items.length === 0}
                <div class="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center">
                    <p>No table of contents available.</p>
                </div>
            {:else}
                <div role="tree" class="flex flex-col">
                    {#each items as item (item.id)}
                        {@render TocNode({ 
                            item, 
                            expandedIds, 
                            currentSectionLabel, 
                            toggleExpand, 
                            handleNavigate 
                        })}
                    {/each}
                </div>
            {/if}
        </div>
    </Sheet.Content>
</Sheet.Root>

{#snippet TocNode({ item, expandedIds, currentSectionLabel, toggleExpand, handleNavigate }: { 
    item: TocItem, 
    expandedIds: Set<string>, 
    currentSectionLabel?: string,
    toggleExpand: (id: string, e: Event) => void,
    handleNavigate: (item: TocItem) => void
})}
    {@const hasChildren = item.children && item.children.length > 0}
    {@const isExpanded = expandedIds.has(item.id)}
    {@const isActive = currentSectionLabel === item.label}
    {@const indentation = item.level * 16}

    <div role="treeitem" aria-selected={isActive} aria-expanded={hasChildren ? isExpanded : undefined} class="flex flex-col outline-none">
        <div 
            class={cn(
                "group flex items-center py-2 pr-4 hover:bg-muted/50 transition-colors cursor-pointer select-none min-h-[48px]",
                isActive && "bg-muted font-medium text-primary"
            )}
            style="padding-left: {indentation + 16}px"
            onclick={() => handleNavigate(item)}
            onkeydown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleNavigate(item);
                }
            }}
            role="button"
            tabindex="0"
        >
            {#if hasChildren}
                <button 
                    onclick={(e) => toggleExpand(item.id, e)}
                    class="p-1 mr-1 hover:bg-background/80 rounded-sm focus-visible:ring-1 focus-visible:ring-ring"
                    aria-label={isExpanded ? "Collapse" : "Expand"}
                >
                    {#if isExpanded}
                        <IconCaretDown class="h-4 w-4 text-muted-foreground" />
                    {:else}
                        <IconCaretRight class="h-4 w-4 text-muted-foreground" />
                    {/if}
                </button>
            {:else}
                 <span class="w-6 mr-1"></span>
            {/if}

            <span class="flex-1 text-sm line-clamp-2 leading-tight">
                {item.label}
            </span>

            {#if item.page}
                <span class="text-xs text-muted-foreground ml-2 tabular-nums">
                    {item.page}
                </span>
            {/if}
        </div>

        {#if hasChildren && isExpanded && item.children}
            {#each item.children as child (child.id)}
                {@render TocNode({ item: child, expandedIds, currentSectionLabel, toggleExpand, handleNavigate })}
            {/each}
        {/if}
    </div>
{/snippet}
