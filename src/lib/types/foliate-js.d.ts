declare module 'foliate-js/view.js' {
    export class ResponseError extends Error {}
    export class NotFoundError extends Error {}
    export class UnsupportedTypeError extends Error {}

    export function makeBook(file: File | string | Blob): Promise<Book>;

    export interface Book {
        metadata?: BookMetadata;
        sections?: Section[];
        toc?: TOCItem[];
        pageList?: TOCItem[];
        dir?: 'ltr' | 'rtl';
        rendition?: {
            layout?: 'reflowable' | 'pre-paginated';
        };
        landmarks?: Array<{ type: string[]; href: string }>;
        getCover?(): Promise<Blob | null>;
        transformTarget?: EventTarget;
        media?: {
            activeClass?: string;
            playbackActiveClass?: string;
        };
        splitTOCHref?(href: string): Promise<[string, any]>;
        getTOCFragment?(doc: Document, id: any): Node | null;
        getMediaOverlay?(): EventTarget;
    }

    export interface BookMetadata {
        title?: string | Record<string, string>;
        author?: string | Contributor | Array<string | Contributor>;
        language?: string;
        identifier?: string;
        publisher?: string;
        published?: string;
        description?: string;
    }

    export interface Contributor {
        name?: string | Record<string, string>;
    }

    export interface Section {
        id?: string;
        linear?: string;
        size?: number;
        cfi?: string;
        load(): Promise<string>;
        unload?(): void;
        createDocument?(): Promise<Document>;
        mediaOverlay?: any;
    }

    export interface TOCItem {
        label: string;
        href: string;
        subitems?: TOCItem[];
    }

    export interface RelocateDetail {
        fraction?: number;
        index?: number;
        range?: Range;
        tocItem?: TOCItem;
        pageItem?: TOCItem;
        cfi?: string;
    }

    export interface LoadDetail {
        doc: Document;
        index: number;
    }

    export class View extends HTMLElement {
        book: Book;
        renderer: Renderer;
        language: any;
        isFixedLayout: boolean;
        lastLocation: any;
        history: any;
        tts: any;
        mediaOverlay: any;

        open(book: File | string | Blob | Book): Promise<void>;
        close(): void;
        goTo(target: string | number | object): Promise<void>;
        goToFraction(fraction: number): Promise<void>;
        goToTextStart(): Promise<void>;
        goLeft(): void;
        goRight(): void;
        prev(): Promise<void>;
        next(): Promise<void>;
        getSectionFractions(): number[];
        getProgressOf(index: number): { tocItem?: TOCItem; pageItem?: TOCItem };
        search(query: string, options?: SearchOptions): AsyncGenerator<SearchResult>;
        clearSearch(): void;
        addAnnotation(annotation: any, remove?: boolean): Promise<any>;
        deleteAnnotation(annotation: any): void;
        showAnnotation(annotation: any): Promise<void>;
        getCFI(index: number, range: Range): string;
        initTTS(options?: any): Promise<any>;
        startMediaOverlay(): void;
    }

    export interface Renderer extends HTMLElement {
        open(book: Book): void;
        destroy(): void;
        goTo(resolved: any): Promise<void>;
        prev(): Promise<void>;
        next(): Promise<void>;
        setStyles?(css: string): void;
        setAttribute(name: string, value: string): void;
        getContents(): Array<{ doc: Document; index: number }>;
        heads?: HTMLElement[];
        feet?: HTMLElement[];
    }

    export interface SearchOptions {
        matchCase?: boolean;
        matchDiacritics?: boolean;
        matchWholeWords?: boolean;
        scope?: any;
    }

    export interface SearchResult {
        cfi: string;
        excerpt: string;
        label?: string;
        subitems?: SearchResult[];
    }
}

declare module 'foliate-js/epub.js' {
    export class EPUB {
        constructor(loader: any);
        init(): Promise<import('foliate-js/view.js').Book>;
    }
}

declare module 'foliate-js/epubcfi.js' {
    export function parse(cfi: string): any;
    export function stringify(parsed: any): string;
    export function compare(a: string, b: string): number;
    export function collapse(cfi: string, toStart?: boolean): string;
    export function toRange(doc: Document, cfi: string, filter?: (node: Node) => number): Range | null;
    export function fromRange(range: Range, filter?: (node: Node) => number): string;
}

declare module 'foliate-js/overlayer.js' {
    export class Overlayer {
        element: SVGElement;
        add(key: string, range: Range, draw: (range: Range) => SVGElement, options?: any): void;
        remove(key: string): void;
        redraw(): void;
        hitTest(event: Event): Array<{ key: string; range: Range }>;
    }
}

declare module 'foliate-js/progress.js' {
    export class TOCProgress {
        init(options: {
            toc: any[];
            ids: string[];
            splitHref: (href: string) => Promise<[string, any]>;
            getFragment: (doc: Document, id: any) => Node | null;
        }): Promise<void>;
        getProgress(index: number, range: Range, doc: Document): any;
    }

    export class SectionProgress {
        constructor(sections: any[], chars: number, width: number);
        getProgress(index: number, fraction: number): { fraction: number };
    }
}

declare module 'foliate-js/search.js' {
    export function searchMatcher(
        textWalker: any,
        opts?: { defaultLocale?: string }
    ): {
        match(query: string, options?: any): Generator<any>;
    };
}

declare module 'foliate-js/paginator.js' {
    // This module registers the foliate-paginator custom element
}

declare module 'foliate-js/fixed-layout.js' {
    // This module registers the foliate-fxl custom element
}

declare module 'foliate-js/tts.js' {
    export class TTS {
        constructor(options?: any);
        start(doc: Document, range?: Range): void;
        pause(): void;
        resume(): void;
        stop(): void;
    }
}
