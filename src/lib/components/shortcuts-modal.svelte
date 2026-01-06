<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog";
    import { Button } from "$lib/components/ui/button";
    import { getShortcutsByCategory, formatShortcutDisplay } from "$lib/utils/keyboard";
    import { cn } from "$lib/utils";
    import IconKeyboard from "~icons/ph/keyboard";

    let { open = $bindable(false) }: { open: boolean } = $props();

    const categories = getShortcutsByCategory();
    
    const categoryLabels: Record<string, string> = {
        navigation: "Navigation",
        ui: "Interface",
        reading: "Reading"
    };
</script>

<Dialog.Root bind:open>
    <Dialog.Content class="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col p-0">
        <Dialog.Header class="p-6 pb-2">
            <Dialog.Title class="flex items-center gap-2">
                <IconKeyboard class="h-5 w-5" />
                Keyboard Shortcuts
            </Dialog.Title>
        </Dialog.Header>

        <div class="flex-1 overflow-y-auto p-6 pt-2">
            <div class="space-y-6">
                {#each Object.entries(categories) as [category, shortcuts]}
                    <div class="space-y-3">
                        <h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            {categoryLabels[category] || category}
                        </h3>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                            {#each shortcuts as shortcut}
                                <div class="flex items-center justify-between text-sm group">
                                    <span class="text-foreground/80 group-hover:text-foreground transition-colors">
                                        {shortcut.description}
                                    </span>
                                    <kbd class="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                        {formatShortcutDisplay(shortcut)}
                                    </kbd>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/each}
            </div>
        </div>

        <div class="p-6 pt-2 border-t bg-muted/10 mt-auto">
            <p class="text-xs text-center text-muted-foreground">
                Press <kbd class="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">?</kbd> to open this menu at any time.
            </p>
        </div>
    </Dialog.Content>
</Dialog.Root>
