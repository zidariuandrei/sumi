<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { readFile } from '@tauri-apps/plugin-fs';
    import { mode } from 'mode-watcher';
    import type { View } from 'foliate-js/view.js';
    import ReaderShell from './reader-shell.svelte';
    import { bookStore } from '$lib/stores/book.svelte';
    import { settingsStore } from '$lib/stores/settings.svelte';
    import { readingStatsStore } from '$lib/stores/stats.svelte';
    import type { TocItem, ReadingLocation } from '$lib/types/reader';

    let { path }: { path: string } = $props();

    let containerElement = $state<HTMLDivElement | null>(null);
    let loading = $state(true);
    let error = $state<string | null>(null);

    // Book state
    let currentLocation = $state(''); // CFI
    let progress = $state(0);
    let tocItems = $state<TocItem[]>([]);
    let title = $state('');

    // Page-like location info from foliate
    let currentPage = $state(0);
    let totalPages = $state(0);
    let currentSectionLabel = $state('');

    // View settings
    let flow = $state<'paginated' | 'scrolled'>('paginated');

    // References
    let view: View | null = null;
    let updateTimeout: ReturnType<typeof setTimeout>;

    // Derived settings
    let settings = $derived(settingsStore.activeSettings);

    // Generate CSS for the EPUB content based on theme and settings
    function getReaderCSS(isDark: boolean) {
        const bg = isDark ? '#0d0d0d' : '#ffffff';
        const fg = isDark ? '#fafafa' : '#1a1a1a';
        const linkColor = isDark ? '#6bb3ff' : '#0066cc';
        const selectionBg = isDark ? 'rgba(100, 150, 255, 0.3)' : 'rgba(0, 100, 255, 0.2)';

        const { fontSize, lineHeight, fontFamily, textAlign, marginHorizontal } = settings;
        
        // Map font family to CSS
        const fontStack = fontFamily === 'serif' 
            ? 'Georgia, "Times New Roman", serif'
            : fontFamily === 'monospace'
                ? 'Menlo, Monaco, "Courier New", monospace'
                : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

        return `
            @namespace epub "http://www.idpf.org/2007/ops";

            html {
                background-color: ${bg} !important;
                color: ${fg} !important;
            }

            body {
                background-color: ${bg} !important;
                color: ${fg} !important;
                font-family: ${fontStack} !important;
                font-size: ${fontSize}px !important;
                line-height: ${lineHeight} !important;
                text-align: ${textAlign} !important;
                padding: 0 ${marginHorizontal}px !important;
            }

            a:link, a:visited {
                color: ${linkColor} !important;
            }

            /* Selection styling */
            ::selection {
                background: ${selectionBg};
            }
            
            /* Hide footnotes in flow if desired, but keeping them for now */
        `;
    }

    // Derived state for ReaderShell
    let canGoPrev = $derived(currentPage > 1 || progress > 0);
    let canGoNext = $derived(currentPage < totalPages || progress < 1);
    
    // View modes
    const viewModes = [
        { id: 'paginated', label: 'Pages' },
        { id: 'scrolled', label: 'Scroll' }
    ];

    // Apply styles to view
    function updateViewStyles() {
        if (!view?.renderer) return;
        
        const isDark = mode.current === 'dark';
        view.renderer.setStyles?.(getReaderCSS(isDark));
        
        // Also update flow if changed (though currently flow is local state)
        // If flow was in settings, we'd update it here
    }

    // Watch for theme or settings changes
    $effect(() => {
        // Dependencies
        const _m = mode.current;
        const _s = settings;
        
        if (view) {
            updateViewStyles();
        }
    });

    async function loadEpub() {
        if (!containerElement) return;

        try {
            loading = true;
            error = null;
            settingsStore.setActiveBook(path);
            readingStatsStore.startSession(path);

            // Dynamically import foliate-js view module
            await import('foliate-js/view.js');

            const data = await readFile(path);
            const blob = new Blob([data], { type: 'application/epub+zip' });
            const file = new File([blob], path.split(/[/\\]/).pop() || 'book.epub', {
                type: 'application/epub+zip'
            });

            view = document.createElement('foliate-view') as unknown as View;
            view.style.cssText = 'width: 100%; height: 100%;';
            containerElement.innerHTML = '';
            containerElement.appendChild(view);

            await view.open(file);

            // Setup listeners
            view.addEventListener('relocate', handleRelocate as EventListener);
            view.addEventListener('load', handleLoad as EventListener);

            // Metadata
            if (view.book?.metadata?.title) {
                const t = view.book.metadata.title;
                title = typeof t === 'string' ? t : (t as any).value || '';
            }

            // TOC
            if (view.book?.toc) {
                tocItems = convertToc(view.book.toc);
            }

            // Initial Restore
            const saved = bookStore.getProgress(path);
            if (saved?.cfi) {
                await view.goTo(saved.cfi);
            } else {
                await view.goTo(0); // Start
            }
            
            updateViewStyles();
            loading = false;
        } catch (err: unknown) {
            console.error('Error loading EPUB:', err);
            error = (err instanceof Error ? err.message : String(err)) || 'Failed to load EPUB';
            loading = false;
        }
    }

    function convertToc(items: any[], level = 0): TocItem[] {
        return items.map((item, index) => ({
            id: `toc-${level}-${index}-${Math.random().toString(36).substr(2, 9)}`,
            label: item.label,
            href: item.href,
            level: level,
            children: item.subitems ? convertToc(item.subitems, level + 1) : undefined
        }));
    }

    function handleRelocate(event: Event) {
        const customEvent = event as CustomEvent;
        const detail = customEvent.detail;
        if (detail) {
            progress = detail.fraction ?? 0;
            currentLocation = detail.cfi || '';
            
            if (detail.location) {
                currentPage = (detail.location.current ?? 0) + 1;
                totalPages = detail.location.total ?? 0;
            }
            
            if (detail.tocItem?.label) {
                currentSectionLabel = detail.tocItem.label;
            }

            // Debounce storage update
            clearTimeout(updateTimeout);
            updateTimeout = setTimeout(() => {
                bookStore.updateProgress(path, {
                    cfi: detail.cfi,
                    fraction: detail.fraction,
                    page: currentPage,
                    totalPages: totalPages,
                    label: currentSectionLabel
                });
            }, 1000);
        }
    }

    function handleLoad(_event: Event) {
        updateViewStyles();
    }

    // Navigation Handlers
    function goTo(target: string | number) {
        if (!view) return;
        view.goTo(target);
    }

    function handleTocNavigate(item: TocItem) {
        goTo(item.href);
    }

    function handleBookmarkNavigate(location: string) {
        goTo(location);
    }
    
    function handleGoTo(target: { page?: number; percentage?: number }) {
        if (!view) return;
        
        if (target.page !== undefined) {
            // Foliate goTo accepts page index (0-based) if mapped, but safer to use CFI or fraction if pages aren't reliable?
            // Actually foliate handles numbers as 0-1 fraction usually if < 1? No.
            // Check foliate docs or behavior. 
            // Usually internal logic maps page index.
            // Let's try passing index (page - 1).
            view.goTo(target.page - 1); 
        } else if (target.percentage !== undefined) {
             view.goTo(target.percentage);
        }
    }

    function setViewMode(mode: string) {
        flow = mode as 'paginated' | 'scrolled';
        view?.renderer?.setAttribute('flow', flow);
    }

    onMount(() => {
        loadEpub();
    });

    onDestroy(() => {
        readingStatsStore.endSession();
        settingsStore.setActiveBook(null);
        if (view) {
            view.removeEventListener('relocate', handleRelocate as EventListener);
            view.removeEventListener('load', handleLoad as EventListener);
            view.close?.();
        }
    });
</script>

<ReaderShell
    bookPath={path}
    {title}
    {loading}
    {error}
    {canGoPrev}
    {canGoNext}
    onPrev={() => view?.goLeft()}
    onNext={() => view?.goRight()}
    {progress}
    {currentLocation}
    {currentPage}
    {totalPages}
    {currentSectionLabel}
    {tocItems}
    {viewModes}
    currentViewMode={flow}
    onViewModeChange={setViewMode}
    onTocNavigate={handleTocNavigate}
    onBookmarkNavigate={handleBookmarkNavigate}
    onGoTo={handleGoTo}
>
    <div
        class="h-full w-full"
        bind:this={containerElement}
    ></div>
</ReaderShell>

<style>
    :global(foliate-view) {
        display: block;
        width: 100%;
        height: 100%;
    }
</style>
