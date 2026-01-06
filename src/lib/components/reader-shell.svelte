<script lang="ts">
    import type { Snippet } from 'svelte';
    import IconCaretLeft from '~icons/ph/caret-left';
    import IconCaretRight from '~icons/ph/caret-right';
    import IconMinus from '~icons/ph/minus';
    import IconPlus from '~icons/ph/plus';

    interface Props {
        // Loading state
        loading?: boolean;
        error?: string | null;

        // Navigation
        canGoPrev?: boolean;
        canGoNext?: boolean;
        onPrev?: () => void;
        onNext?: () => void;

        // Progress (0-1 fraction)
        progress?: number;
        locationLabel?: string;

        // View modes (array of available modes)
        viewModes?: Array<{ id: string; label: string }>;
        currentViewMode?: string;
        onViewModeChange?: (mode: string) => void;

        // Zoom (optional - if not provided, zoom controls won't show)
        zoom?: number | null;
        onZoomIn?: (() => void) | null;
        onZoomOut?: (() => void) | null;

        // Content slot
        children: Snippet;
    }

    let {
        loading = false,
        error = null,
        canGoPrev = false,
        canGoNext = false,
        onPrev = () => {},
        onNext = () => {},
        progress = 0,
        locationLabel = '',
        viewModes = [],
        currentViewMode = '',
        onViewModeChange = () => {},
        zoom = null,
        onZoomIn = null,
        onZoomOut = null,
        children
    }: Props = $props();

    // Keyboard navigation
    function handleKeydown(event: KeyboardEvent) {
        // Don't handle if user is typing in an input
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
            return;
        }

        switch (event.key) {
            case 'ArrowLeft':
                if (canGoPrev) {
                    onPrev();
                    event.preventDefault();
                }
                break;
            case 'ArrowRight':
                if (canGoNext) {
                    onNext();
                    event.preventDefault();
                }
                break;
        }
    }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="flex flex-col h-full w-full bg-muted/30">
    <!-- Toolbar -->
    <div class="flex items-center justify-between px-3 py-2 border-b bg-background z-10 shrink-0 gap-2">
        <!-- Left: Navigation -->
        <div class="flex items-center gap-1">
            <button
                class="p-1.5 rounded hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                onclick={onPrev}
                disabled={!canGoPrev || loading}
                title="Previous (←)"
            >
                <IconCaretLeft class="w-5 h-5" />
            </button>
            <button
                class="p-1.5 rounded hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                onclick={onNext}
                disabled={!canGoNext || loading}
                title="Next (→)"
            >
                <IconCaretRight class="w-5 h-5" />
            </button>
        </div>

        <!-- Center: Location label -->
        <div class="flex-1 min-w-0 text-center">
            <span class="text-sm text-muted-foreground truncate block">
                {#if loading}
                    Loading...
                {:else if locationLabel}
                    {locationLabel}
                {:else}
                    {Math.round(progress * 100)}%
                {/if}
            </span>
        </div>

        <!-- Right: View modes & Zoom -->
        <div class="flex items-center gap-1">
            <!-- View mode buttons -->
            {#if viewModes.length > 0}
                <div class="hidden sm:flex items-center gap-0.5 mr-1">
                    {#each viewModes as mode}
                        <button
                            class="px-2 py-1 text-xs rounded transition-colors
                                   {currentViewMode === mode.id
                                       ? 'bg-secondary text-foreground'
                                       : 'text-muted-foreground hover:bg-secondary/50'}"
                            onclick={() => onViewModeChange(mode.id)}
                        >
                            {mode.label}
                        </button>
                    {/each}
                </div>
            {/if}

            <!-- Zoom controls -->
            {#if zoom !== null && onZoomIn && onZoomOut}
                <div class="hidden sm:flex items-center gap-0.5 border-l pl-2 ml-1">
                    <button
                        class="p-1 rounded hover:bg-secondary transition-colors"
                        onclick={onZoomOut}
                        title="Zoom out"
                    >
                        <IconMinus class="w-4 h-4" />
                    </button>
                    <span class="text-xs text-muted-foreground w-12 text-center tabular-nums">
                        {Math.round(zoom * 100)}%
                    </span>
                    <button
                        class="p-1 rounded hover:bg-secondary transition-colors"
                        onclick={onZoomIn}
                        title="Zoom in"
                    >
                        <IconPlus class="w-4 h-4" />
                    </button>
                </div>
            {/if}
        </div>
    </div>

    <!-- Progress bar -->
    <div class="w-full h-1 bg-muted shrink-0">
        <div
            class="h-full bg-primary transition-all duration-300 ease-out"
            style="width: {progress * 100}%"
        ></div>
    </div>

    <!-- Content area -->
    <div class="flex-1 relative min-h-0 overflow-hidden">
        {#if loading}
            <div class="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                <div class="flex flex-col items-center gap-2">
                    <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p class="text-sm text-muted-foreground">Loading...</p>
                </div>
            </div>
        {/if}

        {#if error}
            <div class="absolute inset-0 flex items-center justify-center bg-background z-10">
                <div class="text-center p-6 max-w-md">
                    <p class="text-destructive font-medium mb-2">Failed to load</p>
                    <p class="text-sm text-muted-foreground">{error}</p>
                </div>
            </div>
        {:else}
            {@render children()}
        {/if}
    </div>

    <!-- Mobile bottom navigation -->
    <div class="flex items-center gap-2 p-2 border-t bg-background shrink-0 sm:hidden">
        <button
            class="flex-1 py-2.5 text-sm font-medium bg-secondary rounded-lg
                   hover:bg-secondary/80 disabled:opacity-40 transition-colors
                   flex items-center justify-center gap-1"
            onclick={onPrev}
            disabled={!canGoPrev || loading}
        >
            <IconCaretLeft class="w-4 h-4" />
            Previous
        </button>
        <button
            class="flex-1 py-2.5 text-sm font-medium bg-secondary rounded-lg
                   hover:bg-secondary/80 disabled:opacity-40 transition-colors
                   flex items-center justify-center gap-1"
            onclick={onNext}
            disabled={!canGoNext || loading}
        >
            Next
            <IconCaretRight class="w-4 h-4" />
        </button>
    </div>
</div>
