<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { readFile } from '@tauri-apps/plugin-fs';
    import { mode } from 'mode-watcher';
    import type { View } from 'foliate-js/view.js';
    import ReaderShell from './reader-shell.svelte';

    let { path }: { path: string } = $props();

    let containerElement = $state<HTMLDivElement | null>(null);
    let loading = $state(true);
    let error = $state<string | null>(null);

    // Book state
    let currentLocation = $state('');
    let progress = $state(0);
    let totalSections = $state(0);
    let currentSection = $state(0);

    // Page-like location info from foliate
    let currentPage = $state(0);
    let totalPages = $state(0);

    // View settings
    let flow = $state<'paginated' | 'scrolled'>('paginated');

    // References
    let view: View | null = null;

    // Generate CSS for the EPUB content based on theme
    function getReaderCSS(isDark: boolean) {
        const bg = isDark ? '#0d0d0d' : '#ffffff';
        const fg = isDark ? '#fafafa' : '#1a1a1a';
        const mutedFg = isDark ? '#999999' : '#666666';
        const linkColor = isDark ? '#6bb3ff' : '#0066cc';
        const selectionBg = isDark ? 'rgba(100, 150, 255, 0.3)' : 'rgba(0, 100, 255, 0.2)';

        return `
            @namespace epub "http://www.idpf.org/2007/ops";

            html {
                background-color: ${bg} !important;
                color: ${fg} !important;
            }

            body {
                background-color: ${bg} !important;
                color: ${fg} !important;
            }

            * {
                color: inherit !important;
                background-color: inherit;
            }

            a:link, a:visited {
                color: ${linkColor} !important;
            }

            a:hover {
                opacity: 0.8;
            }

            img {
                max-width: 100%;
                height: auto;
            }

            /* Ensure images are visible in dark mode */
            ${isDark ? `
            img {
                background-color: transparent !important;
            }
            ` : ''}

            /* Text styling */
            p, li, blockquote, dd {
                line-height: 1.6;
                text-align: start;
                -webkit-hyphens: auto;
                hyphens: auto;
                hanging-punctuation: allow-end last;
                widows: 2;
                orphans: 2;
            }

            h1, h2, h3, h4, h5, h6 {
                color: ${fg} !important;
                line-height: 1.3;
            }

            blockquote {
                border-left: 3px solid ${mutedFg};
                padding-left: 1em;
                margin-left: 0;
                opacity: 0.9;
            }

            pre, code {
                background-color: ${isDark ? '#1a1a1a' : '#f5f5f5'} !important;
                border-radius: 4px;
                padding: 0.2em 0.4em;
                font-family: monospace;
            }

            pre {
                padding: 1em;
                overflow-x: auto;
                white-space: pre-wrap !important;
            }

            hr {
                border: none;
                border-top: 1px solid ${isDark ? '#333' : '#ddd'};
                margin: 2em 0;
            }

            table {
                border-collapse: collapse;
            }

            th, td {
                border: 1px solid ${isDark ? '#333' : '#ddd'};
                padding: 0.5em;
            }

            /* Selection styling */
            ::selection {
                background: ${selectionBg};
            }

            /* Hide footnotes in flow */
            aside[epub|type~="endnote"],
            aside[epub|type~="footnote"],
            aside[epub|type~="note"],
            aside[epub|type~="rearnote"] {
                display: none;
            }

            /* Respect align attributes */
            [align="left"] { text-align: left; }
            [align="right"] { text-align: right; }
            [align="center"] { text-align: center; }
            [align="justify"] { text-align: justify; }
        `;
    }

    // Derived state for ReaderShell
    let canGoPrev = $derived(currentPage > 1 || progress > 0);
    let canGoNext = $derived(currentPage < totalPages || progress < 1);

    // Build location label - show page numbers if available, otherwise fall back to section/percentage
    let locationLabel = $derived.by(() => {
        if (totalPages > 0 && currentPage > 0) {
            // Show page numbers with optional chapter name
            if (currentLocation) {
                return `${currentLocation} · Page ${currentPage} of ${totalPages}`;
            }
            return `Page ${currentPage} of ${totalPages}`;
        }

        if (currentLocation) {
            return currentLocation;
        }

        if (totalSections > 0) {
            return `Section ${currentSection + 1} of ${totalSections}`;
        }

        return '';
    });

    const viewModes = [
        { id: 'paginated', label: 'Pages' },
        { id: 'scrolled', label: 'Scroll' }
    ];

    // Apply theme to the view
    function applyTheme(isDark: boolean) {
        if (view?.renderer?.setStyles) {
            view.renderer.setStyles(getReaderCSS(isDark));
        }
    }

    // Watch for theme changes
    $effect(() => {
        if (view && $mode) {
            applyTheme($mode === 'dark');
        }
    });

    async function loadEpub() {
        if (!containerElement) return;

        try {
            loading = true;
            error = null;

            // Dynamically import foliate-js view module
            await import('foliate-js/view.js');

            // Read the file using Tauri's fs plugin
            console.log('Reading EPUB file:', path);
            const data = await readFile(path);
            console.log('File read success, size:', data.length);

            // Create a File/Blob from the data
            const blob = new Blob([data], { type: 'application/epub+zip' });
            const file = new File([blob], path.split(/[/\\]/).pop() || 'book.epub', {
                type: 'application/epub+zip'
            });

            // Create the foliate-view element
            view = document.createElement('foliate-view') as unknown as View;
            view.style.cssText = 'width: 100%; height: 100%;';

            // Clear container and append view
            containerElement.innerHTML = '';
            containerElement.appendChild(view);

            // Open the book
            await view.open(file);

            // Set up event listeners
            view.addEventListener('relocate', handleRelocate as EventListener);
            view.addEventListener('load', handleLoad as EventListener);

            // Extract metadata
            const book = view.book;
            totalSections = book?.sections?.length || 0;

            // Apply initial theme and flow mode
            const isDark = $mode === 'dark';
            view.renderer?.setStyles?.(getReaderCSS(isDark));
            view.renderer?.setAttribute('flow', flow);

            // Go to first page
            view.renderer?.next?.();

            loading = false;
        } catch (err: unknown) {
            console.error('Error loading EPUB:', err);
            error = (err instanceof Error ? err.message : String(err)) || 'Failed to load EPUB';
            loading = false;
        }
    }

    function handleRelocate(event: Event) {
        const customEvent = event as CustomEvent;
        const detail = customEvent.detail;
        if (detail) {
            // Get overall progress fraction
            progress = detail.fraction ?? 0;

            // Get section info
            currentSection = detail.section?.current ?? 0;
            totalSections = detail.section?.total ?? totalSections;

            // Get synthetic page numbers from foliate's location calculation
            // These are based on content size, providing consistent "page" references
            if (detail.location) {
                currentPage = (detail.location.current ?? 0) + 1; // 1-indexed for display
                totalPages = detail.location.total ?? 0;
            }

            // Get TOC item label (chapter name)
            if (detail.tocItem?.label) {
                currentLocation = detail.tocItem.label;
            } else {
                currentLocation = '';
            }
        }
    }

    function handleLoad(_event: Event) {
        // Re-apply theme when a new section loads
        const isDark = $mode === 'dark';
        applyTheme(isDark);
    }

    function goLeft() {
        view?.goLeft();
    }

    function goRight() {
        view?.goRight();
    }

    function setViewMode(mode: string) {
        flow = mode as 'paginated' | 'scrolled';
        view?.renderer?.setAttribute('flow', flow);
    }

    onMount(() => {
        loadEpub();
    });

    onDestroy(() => {
        if (view) {
            view.removeEventListener('relocate', handleRelocate as EventListener);
            view.removeEventListener('load', handleLoad as EventListener);
            view.close?.();
        }
    });
</script>

<ReaderShell
    {loading}
    {error}
    {canGoPrev}
    {canGoNext}
    onPrev={goLeft}
    onNext={goRight}
    {progress}
    {locationLabel}
    {viewModes}
    currentViewMode={flow}
    onViewModeChange={setViewMode}
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

    :global(foliate-view::part(head)),
    :global(foliate-view::part(foot)) {
        font-size: 0.75rem;
        opacity: 0.6;
    }
</style>
