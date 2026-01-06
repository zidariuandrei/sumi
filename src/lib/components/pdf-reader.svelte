<script lang="ts">
    import * as pdfjsLib from 'pdfjs-dist';
    import type { RenderTask, PDFDocumentProxy, PageViewport } from 'pdfjs-dist';
    import { onMount, onDestroy } from 'svelte';
    import { readFile } from '@tauri-apps/plugin-fs';
    import ReaderShell from './reader-shell.svelte';

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

    let pdfDoc = $state<PDFDocumentProxy | null>(null);
    let resizeObserver: ResizeObserver | null = null;
    let resizeTimeout: ReturnType<typeof setTimeout> | null = null;

    // Track current render task to cancel if needed
    let currentRenderTask: RenderTask | null = null;
    let isRendering = $state(false);

    // Derived state for ReaderShell
    let canGoPrev = $derived(currentPage > 1);
    let canGoNext = $derived(currentPage < numPages);
    let progress = $derived(numPages > 0 ? currentPage / numPages : 0);
    let locationLabel = $derived(numPages > 0 ? `Page ${currentPage} of ${numPages}` : '');

    const viewModes = [
        { id: 'width', label: 'Width' },
        { id: 'page', label: 'Page' }
    ];

    async function loadPdf() {
        try {
            loading = true;
            error = null;
            console.log('Reading file:', path);
            const data = await readFile(path);
            console.log('File read success, size:', data.length);

            // PDF.js requires Uint8Array, readFile returns it.
            const loadingTask = pdfjsLib.getDocument({
                data,
                cMapUrl: 'https://unpkg.com/pdfjs-dist@4.0.379/cmaps/',
                cMapPacked: true,
            });

            pdfDoc = await loadingTask.promise;
            console.log('PDF Loaded, pages:', pdfDoc.numPages);
            numPages = pdfDoc.numPages;

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

    function calculateScale() {
        if (!containerElement || !baseViewport) return;

        const containerWidth = containerElement.clientWidth - 32;
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

        // Cancel any ongoing render
        await cancelCurrentRender();

        // Prevent concurrent renders
        if (isRendering) return;
        isRendering = true;

        try {
            const page = await pdfDoc.getPage(pageNumber);

            // Update base viewport for current page (pages can have different sizes)
            baseViewport = page.getViewport({ scale: 1 });

            // Recalculate scale based on fit mode
            calculateScale();

            const viewport = page.getViewport({ scale });

            // Prepare canvas
            const canvas = canvasElement;
            const context = canvas.getContext('2d');

            if (!context) {
                throw new Error('Could not get canvas context');
            }

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            // Render PDF page into canvas context
            const renderContext = {
                canvasContext: context,
                viewport: viewport,
                canvas: null
            };

            const renderTask = page.render(renderContext);
            currentRenderTask = renderTask;
            await renderTask.promise;
            currentRenderTask = null;

            // Render text layer
            textLayerElement.innerHTML = '';
            textLayerElement.style.height = `${viewport.height}px`;
            textLayerElement.style.width = `${viewport.width}px`;
            textLayerElement.style.left = `${canvas.offsetLeft}px`;
            textLayerElement.style.top = `${canvas.offsetTop}px`;

            const textContent = await page.getTextContent();
            // @ts-ignore - TextLayer signature varies across pdfjs versions
            const textLayer = new pdfjsLib.TextLayer({
                textContentSource: textContent,
                container: textLayerElement,
                viewport: viewport
            });
            await textLayer.render();
        } catch (err: unknown) {
            // Ignore cancelled render errors
            if (err && typeof err === 'object' && 'name' in err && (err as any).name === 'RenderingCancelledException') {
                return;
            }
            console.error('Error rendering page:', err);
        } finally {
            isRendering = false;
        }
    }

    function handleResize() {
        if (resizeTimeout) {
            clearTimeout(resizeTimeout);
        }
        resizeTimeout = setTimeout(() => {
            if (pdfDoc) {
                calculateScale();
                renderPage(currentPage);
            }
        }, 100);
    }

    onMount(() => {
        loadPdf();

        if (containerElement) {
            resizeObserver = new ResizeObserver(handleResize);
            resizeObserver.observe(containerElement);
        }
    });

    onDestroy(() => {
        // Cancel any pending render
        cancelCurrentRender();

        if (resizeObserver) {
            resizeObserver.disconnect();
        }
        if (resizeTimeout) {
            clearTimeout(resizeTimeout);
        }
    });

    $effect(() => {
        if (currentPage && pdfDoc && !loading) {
            renderPage(currentPage);
        }
    });

    function nextPage() {
        if (currentPage < numPages) currentPage++;
    }

    function prevPage() {
        if (currentPage > 1) currentPage--;
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
    {loading}
    {error}
    {canGoPrev}
    {canGoNext}
    onPrev={prevPage}
    onNext={nextPage}
    {progress}
    {locationLabel}
    {viewModes}
    currentViewMode={fitMode}
    onViewModeChange={setFitMode}
    zoom={scale}
    onZoomIn={zoomIn}
    onZoomOut={zoomOut}
>
    <div
        class="h-full w-full overflow-auto p-4 flex justify-center"
        bind:this={containerElement}
    >
        <div class="relative shadow-xl bg-white shrink-0">
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
