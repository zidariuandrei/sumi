<script lang="ts">
    import type { Snippet } from 'svelte';
    import { fly } from 'svelte/transition';
    import { page } from '$app/state';
    import * as Button from "$lib/components/ui/button";
    import IconCaretLeft from '~icons/ph/caret-left';
    import IconCaretRight from '~icons/ph/caret-right';
    import IconMinus from '~icons/ph/minus';
    import IconPlus from '~icons/ph/plus';
    import IconList from '~icons/ph/list';
    import IconGear from '~icons/ph/gear';
    import IconBookmarks from '~icons/ph/bookmarks';
    import IconBookmarkSimple from '~icons/ph/bookmark-simple';
    import IconArrowLeft from '~icons/ph/arrow-left';
    
    import { createKeyboardHandler } from '$lib/utils/keyboard';
    import { bookmarksStore } from '$lib/stores/bookmarks.svelte';
    import { settingsStore } from '$lib/stores/settings.svelte';
    import type { TocItem } from '$lib/types/reader';
    import { cn } from '$lib/utils';

    import TocDrawer from './toc-drawer.svelte';
    import SettingsDrawer from './settings-drawer.svelte';
    import BookmarksDrawer from './bookmarks-drawer.svelte';
    import GoToDialog from './goto-dialog.svelte';
    import ShortcutsModal from './shortcuts-modal.svelte';

    interface Props {
        // Core Data
        bookPath: string;
        title?: string;
        
        // Navigation / Progress
        progress?: number;
        locationLabel?: string;
        currentLocation?: string; // CFI or unique location string
        currentPage?: number;
        totalPages?: number;
        
        // TOC
        tocItems?: TocItem[];
        currentSectionLabel?: string;

        // States
        loading?: boolean;
        error?: string | null;
        canGoPrev?: boolean;
        canGoNext?: boolean;

        // View modes
        viewModes?: Array<{ id: string; label: string }>;
        currentViewMode?: string;
        
        // Zoom
        zoom?: number | null;

        // Callbacks
        onPrev?: () => void;
        onNext?: () => void;
        onViewModeChange?: (mode: string) => void;
        onZoomIn?: (() => void) | null;
        onZoomOut?: (() => void) | null;
        
        // Navigation Callbacks
        onTocNavigate?: (item: TocItem) => void;
        onBookmarkNavigate?: (location: string) => void;
        onGoTo?: (target: { page?: number; percentage?: number }) => void;
        onBack?: () => void;

        // Content
        children: Snippet;
    }

    let {
        bookPath,
        title = "Reader",
        progress = 0,
        locationLabel = '',
        currentLocation = '',
        currentPage = 0,
        totalPages = 0,
        tocItems = [],
        currentSectionLabel = '',
        loading = false,
        error = null,
        canGoPrev = false,
        canGoNext = false,
        viewModes = [],
        currentViewMode = '',
        zoom = null,
        onPrev = () => {},
        onNext = () => {},
        onViewModeChange = () => {},
        onZoomIn = null,
        onZoomOut = null,
        onTocNavigate = () => {},
        onBookmarkNavigate = () => {},
        onGoTo = () => {},
        onBack = () => history.back(),
        children
    }: Props = $props();

    // Drawer/Modal States
    let showToc = $state(false);
    let showSettings = $state(false);
    let showBookmarks = $state(false);
    let showGoTo = $state(false);
    let showShortcuts = $state(false);
    
    // UI Visibility (Immersive Mode)
    let showControls = $state(true);
    let controlsTimeout: any = null;

    function showControlsTemporarily() {
        showControls = true;
        clearTimeout(controlsTimeout);
        controlsTimeout = setTimeout(() => {
            if (!showToc && !showSettings && !showBookmarks && !showGoTo && !showShortcuts) {
                showControls = false;
            }
        }, 3000);
    }

    function toggleControls() {
        showControls = !showControls;
    }

    // Actions
    function handleAddBookmark() {
        if (!bookPath || !currentLocation) return;
        
        const bookmark = bookmarksStore.toggleBookmark(bookPath, currentLocation, {
            displayPage: currentPage,
            displaySection: currentSectionLabel
        });
        
        // Optional: Toast notification could go here
    }

    // Keyboard Handler
    const handleKeydown = createKeyboardHandler({
        prevPage: () => canGoPrev && onPrev(),
        nextPage: () => canGoNext && onNext(),
        startOfBook: () => {}, // TODO: Implement if needed, or rely on GoTo
        endOfBook: () => {},   // TODO
        toggleToc: () => showToc = !showToc,
        toggleSettings: () => showSettings = !showSettings,
        toggleBookmarks: () => showBookmarks = !showBookmarks,
        addBookmark: handleAddBookmark,
        gotoPage: () => showGoTo = true,
        showHelp: () => showShortcuts = true,
        closePanel: () => {
            showToc = false;
            showSettings = false;
            showBookmarks = false;
            showGoTo = false;
            showShortcuts = false;
        },
        increaseFontSize: () => settingsStore.increaseFontSize(),
        decreaseFontSize: () => settingsStore.decreaseFontSize(),
        resetFontSize: () => settingsStore.resetFontSize()
    });

    // Check if current location is bookmarked
    let isBookmarked = $derived(
        currentLocation ? bookmarksStore.hasBookmarkAt(bookPath, currentLocation) : false
    );

</script>

<svelte:window onkeydown={handleKeydown} />

<div class="relative flex flex-col h-full w-full bg-background overflow-hidden group">
    
    <!-- Top Bar (Header) -->
    {#if showControls}
        <header 
            transition:fly={{ y: -50, duration: 200 }}
            class="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b shadow-sm"
        >
            <div class="flex items-center gap-2 flex-1 min-w-0">
                <Button.Root variant="ghost" size="icon" onclick={onBack} title="Back to Library">
                    <IconArrowLeft class="w-5 h-5" />
                </Button.Root>
                <button 
                    onclick={toggleControls}
                    class="text-sm font-medium truncate text-foreground/90 hover:text-foreground text-left max-w-[200px] sm:max-w-md"
                >
                    {title}
                </button>
            </div>

            <div class="flex items-center gap-1">
                <Button.Root variant="ghost" size="icon" onclick={() => showToc = !showToc} title="Table of Contents (t)">
                    <IconList class="w-5 h-5" />
                </Button.Root>
                
                <Button.Root variant="ghost" size="icon" onclick={() => showSettings = !showSettings} title="Settings (s)">
                    <IconGear class="w-5 h-5" />
                </Button.Root>
                
                <Button.Root variant="ghost" size="icon" onclick={() => showBookmarks = !showBookmarks} title="Bookmarks (Shift+b)">
                    <IconBookmarks class="w-5 h-5" />
                </Button.Root>

                <Button.Root 
                    variant="ghost" 
                    size="icon" 
                    onclick={handleAddBookmark} 
                    title={isBookmarked ? "Remove Bookmark (b)" : "Add Bookmark (b)"}
                    class={isBookmarked ? "text-primary" : "text-muted-foreground"}
                >
                    <IconBookmarkSimple class={cn("w-5 h-5", isBookmarked && "fill-current")} />
                </Button.Root>
            </div>
        </header>
    {/if}

    <!-- Content Area -->
    <main 
        class="flex-1 relative min-h-0 overflow-hidden"
        onclick={() => toggleControls()} 
        onkeydown={(e) => e.key === 'Enter' && toggleControls()}
        role="button"
        tabindex="0"
    >
        {#if loading}
            <div class="absolute inset-0 flex items-center justify-center z-10">
                <div class="flex flex-col items-center gap-2">
                    <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p class="text-sm text-muted-foreground">Loading...</p>
                </div>
            </div>
        {/if}

        {#if error}
            <div class="absolute inset-0 flex items-center justify-center z-10 p-4">
                <div class="text-center max-w-md p-6 bg-destructive/10 rounded-lg text-destructive">
                    <p class="font-medium mb-2">Failed to load</p>
                    <p class="text-sm">{error}</p>
                </div>
            </div>
        {/if}

        {@render children()}
    </main>

    <!-- Bottom Bar (Footer) -->
    {#if showControls}
        <footer 
            transition:fly={{ y: 50, duration: 200 }}
            class="absolute bottom-0 left-0 right-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t shadow-[0_-1px_3px_rgba(0,0,0,0.1)]"
        >
            <div class="flex flex-col w-full">
                <!-- Progress Bar -->
                <div class="w-full h-1 bg-muted">
                    <div
                        class="h-full bg-primary transition-all duration-300"
                        style="width: {progress * 100}%"
                    ></div>
                </div>

                <div class="flex items-center justify-between px-3 py-2 gap-2">
                    <!-- Navigation Controls -->
                    <div class="flex items-center gap-1">
                        <Button.Root variant="ghost" size="icon" onclick={onPrev} disabled={!canGoPrev || loading}>
                            <IconCaretLeft class="w-5 h-5" />
                        </Button.Root>
                        <Button.Root variant="ghost" size="icon" onclick={onNext} disabled={!canGoNext || loading}>
                            <IconCaretRight class="w-5 h-5" />
                        </Button.Root>
                    </div>

                    <!-- Location Info -->
                    <div class="flex-1 text-center min-w-0">
                         <button 
                            onclick={() => showGoTo = true}
                            class="text-xs sm:text-sm text-muted-foreground hover:text-foreground truncate max-w-full px-2 py-1 rounded hover:bg-muted/50 transition-colors"
                        >
                            {#if locationLabel}
                                {locationLabel}
                            {:else}
                                {Math.round(progress * 100)}%
                            {/if}
                        </button>
                    </div>

                    <!-- View Options -->
                    <div class="flex items-center gap-1">
                        {#if viewModes.length > 0}
                            <div class="hidden sm:flex items-center bg-muted/50 rounded-md p-0.5">
                                {#each viewModes as mode}
                                    <button
                                        class={cn(
                                            "px-2 py-1 text-[10px] uppercase font-medium rounded-sm transition-colors",
                                            currentViewMode === mode.id 
                                                ? "bg-background text-foreground shadow-sm" 
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                        onclick={() => onViewModeChange(mode.id)}
                                    >
                                        {mode.label}
                                    </button>
                                {/each}
                            </div>
                        {/if}

                        {#if zoom !== null}
                            <div class="flex items-center gap-0.5 ml-2">
                                <Button.Root variant="ghost" size="icon" class="h-7 w-7" onclick={onZoomOut}>
                                    <IconMinus class="w-3 h-3" />
                                </Button.Root>
                                <span class="text-xs text-muted-foreground w-8 text-center tabular-nums">
                                    {Math.round(zoom * 100)}%
                                </span>
                                <Button.Root variant="ghost" size="icon" class="h-7 w-7" onclick={onZoomIn}>
                                    <IconPlus class="w-3 h-3" />
                                </Button.Root>
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
        </footer>
    {/if}

    <!-- Drawers and Modals -->
    <TocDrawer 
        bind:open={showToc} 
        items={tocItems} 
        {currentSectionLabel}
        onNavigate={onTocNavigate} 
        onClose={() => showToc = false}
    />

    <SettingsDrawer 
        bind:open={showSettings} 
        onClose={() => showSettings = false}
    />

    <BookmarksDrawer 
        bind:open={showBookmarks} 
        {bookPath}
        onNavigate={onBookmarkNavigate}
        onClose={() => showBookmarks = false}
    />

        <GoToDialog
            bind:open={showGoTo}
            {totalPages}
            {currentPage}
            onNavigate={onGoTo}
        />
        <ShortcutsModal bind:open={showShortcuts} />
    
</div>
