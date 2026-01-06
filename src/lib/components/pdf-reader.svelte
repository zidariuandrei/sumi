<script lang="ts">
    import * as pdfjsLib from 'pdfjs-dist';
    import type { RenderTask, PDFDocumentProxy, PageViewport } from 'pdfjs-dist';
    import { onMount, onDestroy } from 'svelte';
    import { readFile } from '@tauri-apps/plugin-fs';
    import ReaderShell from './reader-shell.svelte';
    import { bookStore } from '$lib/stores/book.svelte';
    import { readingStatsStore } from '$lib/stores/stats.svelte';
    import type { TocItem } from '$lib/types/reader';

    // Set worker source to local file in static directory
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

    let { path }: { path: string } = $props();

    let canvasElement = $state<HTMLCanvasElement | null>(null);
    let textLayerElement = $state<HTMLDivElement | null>(null);
    let containerElement = $state<HTMLDivElement | null>(null);
    let loading = $state(true);
    let error = $state<string | null>(null);
    let numPages = $state(0);
    let currentPage = $state(1);
    let scale = $state(1);
    let fitMode = $state<'width' | 'page'>('width');
    let baseViewport = $state<PageViewport | null>(null);
    let tocItems = $state<TocItem[]>([]);
    let title = $state('');

    let pdfDoc = $state<PDFDocumentProxy | null>(null);
    let resizeObserver: ResizeObserver | null = null;
    let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
    let progressTimeout: ReturnType<typeof setTimeout> | null = null;

    // Track current render task to cancel if needed
    let currentRenderTask: RenderTask | null = null;
    let isRendering = $state(false);

    // Derived state for ReaderShell
    let canGoPrev = $derived(currentPage > 1);
    let canGoNext = $derived(currentPage < numPages);
    let progress = $derived(numPages > 0 ? currentPage / numPages : 0);
    let locationLabel = $derived(numPages > 0 ? `Page ${currentPage} of ${numPages}` : '');
    let currentLocation = $derived(currentPage.toString());

    const viewModes = [
        { id: 'width', label: 'Width' },
        { id: 'page', label: 'Page' }
    ];

    async function loadPdf() {
        try {
            loading = true;
            error = null;
            readingStatsStore.startSession(path);
            
            console.log('Reading file:', path);
            const data = await readFile(path);
            
            // PDF.js requires Uint8Array
            const loadingTask = pdfjsLib.getDocument({
                data,
                cMapUrl: 'https://unpkg.com/pdfjs-dist@4.0.379/cmaps/',
                cMapPacked: true,
            });

            pdfDoc = await loadingTask.promise;
            numPages = pdfDoc.numPages;

            // Metadata
            const metadata = await pdfDoc.getMetadata();
            if (metadata.info && (metadata.info as any).Title) {
                title = (metadata.info as any).Title;
            }

            // Outline / TOC
            const outline = await pdfDoc.getOutline();
            if (outline) {
                tocItems = await convertOutline(outline, pdfDoc);
            }

            // Restore position
            const saved = bookStore.getProgress(path);
            if (saved?.page) {
                currentPage = Math.min(Math.max(1, saved.page), numPages);
            }

            // Get the base viewport at scale 1 for the first page
            const firstPage = await pdfDoc.getPage(1);
            baseViewport = firstPage.getViewport({ scale: 1 });

            // Calculate initial scale based on fit mode
            calculateScale();
            await renderPage(currentPage);
            loading = false;
        } catch (err: unknown) {
            console.error('Error loading PDF:', err);
            error = (err instanceof Error ? err.message : String(err)) || 'Failed to load PDF';
            loading = false;
        }
    }

    async function convertOutline(outline: any[], doc: PDFDocumentProxy, level = 0): Promise<TocItem[]> {
        const items: TocItem[] = [];
        for (let i = 0; i < outline.length; i++) {
            const node = outline[i];
            let pageNum: number | undefined;

            try {
                if (node.dest) {
                    const dest = typeof node.dest === 'string' 
                        ? await doc.getDestination(node.dest) 
                        : node.dest;
                    
                    if (dest) {
                        const ref = dest[0];
                        const pageIndex = await doc.getPageIndex(ref);
                        pageNum = pageIndex + 1;
                    }
                }
            } catch (e) {
                console.warn('Failed to resolve TOC destination', e);
            }

            items.push({
                id: `toc-${level}-${i}-${Math.random().toString(36).substr(2, 9)}`,
                label: node.title,
                href: pageNum ? pageNum.toString() : '#',
                level,
                page: pageNum,
                children: node.items && node.items.length > 0 
                    ? await convertOutline(node.items, doc, level + 1) 
                    : undefined
            });
        }
        return items;
    }

    function calculateScale() {
        if (!containerElement || !baseViewport) return;

        const containerWidth = containerElement.clientWidth - 32; // padding
        const containerHeight = containerElement.clientHeight - 32;

        if (fitMode === 'width') {
            scale = containerWidth / baseViewport.width;
        } else if (fitMode === 'page') {
            const scaleWidth = containerWidth / baseViewport.width;
            const scaleHeight = containerHeight / baseViewport.height;
            scale = Math.min(scaleWidth, scaleHeight);
        }
    }

    async function cancelCurrentRender() {
        if (currentRenderTask) {
            try {
                await currentRenderTask.cancel();
            } catch {
                // Ignore cancel errors
            }
            currentRenderTask = null;
        }
    }

    async function renderPage(pageNumber: number) {
        if (!pdfDoc || !canvasElement || !textLayerElement) return;

        await cancelCurrentRender();

        if (isRendering) return;
        isRendering = true;

        try {
            const page = await pdfDoc.getPage(pageNumber);
            baseViewport = page.getViewport({ scale: 1 });
            calculateScale();
            const viewport = page.getViewport({ scale });

            const canvas = canvasElement;
            const context = canvas.getContext('2d');
            if (!context) throw new Error('Could not get canvas context');

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderTask = page.render({
                canvasContext: context,
                viewport: viewport,
                canvas: canvasElement as HTMLCanvasElement
            });

            currentRenderTask = renderTask;
            await renderTask.promise;
            currentRenderTask = null;

            // Text Layer
            textLayerElement.innerHTML = '';
            textLayerElement.style.height = `${viewport.height}px`;
            textLayerElement.style.width = `${viewport.width}px`;
            textLayerElement.style.left = `${canvas.offsetLeft}px`;
            textLayerElement.style.top = `${canvas.offsetTop}px`;
            // @ts-ignore
            textLayerElement.style.setProperty('--scale-factor', String(scale));

            const textContent = await page.getTextContent();
            // @ts-ignore
            const textLayer = new pdfjsLib.TextLayer({
                textContentSource: textContent,
                container: textLayerElement,
                viewport: viewport
            });
            await textLayer.render();
            
            // Update progress
            updateProgress();

        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'name' in err && (err as any).name === 'RenderingCancelledException') {
                return;
            }
            console.error('Error rendering page:', err);
        } finally {
            isRendering = false;
        }
    }

    function updateProgress() {
        if (progressTimeout) clearTimeout(progressTimeout);
        progressTimeout = setTimeout(() => {
            bookStore.updateProgress(path, {
                page: currentPage,
                totalPages: numPages,
                fraction: numPages > 0 ? currentPage / numPages : 0,
                label: `Page ${currentPage}`
            });
        }, 1000);
    }

    function handleResize() {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (pdfDoc) {
                calculateScale();
                renderPage(currentPage);
            }
        }, 100);
    }

    // Navigation
    function goToPage(pageNum: number) {
        if (pageNum >= 1 && pageNum <= numPages) {
            currentPage = pageNum;
            renderPage(currentPage);
        }
    }

    function handleGoTo(target: { page?: number; percentage?: number }) {
        if (target.page !== undefined) {
            goToPage(target.page);
        } else if (target.percentage !== undefined) {
            const page = Math.max(1, Math.round(target.percentage * numPages));
            goToPage(page);
        }
    }
    
    function handleTocNavigate(item: TocItem) {
        if (item.page) {
            goToPage(item.page);
        } else if (item.href) {
            // Try to parse href if it's a number
            const p = parseInt(item.href);
            if (!isNaN(p)) goToPage(p);
        }
    }

    function handleBookmarkNavigate(location: string) {
        const p = parseInt(location);
        if (!isNaN(p)) goToPage(p);
    }

    onMount(() => {
        loadPdf();
        if (containerElement) {
            resizeObserver = new ResizeObserver(handleResize);
            resizeObserver.observe(containerElement);
        }
    });

    onDestroy(() => {
        readingStatsStore.endSession();
        cancelCurrentRender();
        if (resizeObserver) resizeObserver.disconnect();
        if (resizeTimeout) clearTimeout(resizeTimeout);
        if (progressTimeout) clearTimeout(progressTimeout);
    });

    function nextPage() {
        if (currentPage < numPages) {
            currentPage++;
            renderPage(currentPage);
        }
    }

    function prevPage() {
        if (currentPage > 1) {
            currentPage--;
            renderPage(currentPage);
        }
    }

    function zoomIn() {
        scale += 0.25;
        renderPage(currentPage);
    }

    function zoomOut() {
        if (scale > 0.25) {
            scale -= 0.25;
            renderPage(currentPage);
        }
    }

    function setFitMode(mode: string) {
        fitMode = mode as 'width' | 'page';
        calculateScale();
        renderPage(currentPage);
    }
</script>

<ReaderShell
    bookPath={path}
    {title}
    {loading}
    {error}
    {canGoPrev}
    {canGoNext}
    onPrev={prevPage}
    onNext={nextPage}
    {progress}
    {locationLabel}
    {currentLocation}
    {currentPage}
    totalPages={numPages}
    {tocItems}
    {viewModes}
    currentViewMode={fitMode}
    onViewModeChange={setFitMode}
    zoom={scale}
    onZoomIn={zoomIn}
    onZoomOut={zoomOut}
    onGoTo={handleGoTo}
    onTocNavigate={handleTocNavigate}
    onBookmarkNavigate={handleBookmarkNavigate}
>
    <div
        class="h-full w-full overflow-auto p-4 flex justify-center bg-muted/30"
        bind:this={containerElement}
    >
        <div class="relative shadow-xl bg-white shrink-0 transition-transform duration-200">
            <canvas bind:this={canvasElement}></canvas>
            <div bind:this={textLayerElement} class="textLayer absolute top-0 left-0"></div>
        </div>
    </div>
</ReaderShell>

<style>
    :global(.textLayer) {
        position: absolute;
        text-align: initial;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        overflow: hidden;
        opacity: 0.2;
        line-height: 1;
        text-rendering: optimizeLegibility;
    }

    :global(.textLayer span) {
        color: transparent;
        position: absolute;
        white-space: pre;
        cursor: text;
        transform-origin: 0% 0%;
    }

    :global(.textLayer ::selection) {
        background: rgba(0, 0, 255, 0.2);
    }
</style>
