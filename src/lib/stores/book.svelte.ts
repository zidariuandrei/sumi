import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';
import { storage, STORAGE_KEYS } from '$lib/utils/storage';
import type { ReadingLocation } from '$lib/types/reader';

export interface Book {
    path: string;
    title: string;
    author?: string;
    addedAt: number;
    lastReadAt?: number;
    // New fields
    currentLocation?: ReadingLocation;
    progress?: number;
    totalPages?: number;
    totalReadingTime?: number; // Seconds
}

class BookStore {
    activeBookPath = $state<string | null>(null);
    recentBooks = $state<Book[]>([]);

    // Getters
    get activeBook() {
        return this.recentBooks.find(b => b.path === this.activeBookPath);
    }

    get lastReadBook(): Book | undefined {
        const sorted = this.recentlyReadBooks;
        return sorted.length > 0 ? sorted[0] : undefined;
    }

    get recentlyReadBooks(): Book[] {
        return [...this.recentBooks].sort((a, b) => (b.lastReadAt || 0) - (a.lastReadAt || 0));
    }

    get inProgressBooks(): Book[] {
        return this.recentBooks.filter(b => (b.progress || 0) > 0 && (b.progress || 0) < 1);
    }

    constructor() {
        this.recentBooks = storage.get<Book[]>(STORAGE_KEYS.RECENT_BOOKS, []);
    }

    private saveToStorage() {
        storage.set(STORAGE_KEYS.RECENT_BOOKS, this.recentBooks);
    }

    private sanitizeTitle(title: string): string {
        let cleaned = title.replace(/_/g, " ");
        cleaned = cleaned.replace(/\s+--\s+/g, " - ");
        cleaned = cleaned.replace(/\b[a-f0-9]{32}\b/g, "");
        return cleaned.replace(/\s+/g, " ").trim();
    }

    async openFile() {
        try {
            const selected = await open({
                multiple: false,
                filters: [{
                    name: 'Ebooks',
                    extensions: ['epub', 'pdf']
                }]
            });

            if (selected && typeof selected === 'string') {
                await this.openBook(selected);
            }
        } catch (err) {
            console.error('Failed to open file:', err);
        }
    }

    private sanitizeTitle(title: string): string {
        // 1. Replace underscores with spaces
        let cleaned = title.replace(/_/g, " ");
        // 2. Normalize " -- " separators to " - "
        cleaned = cleaned.replace(/\s+--\s+/g, " - ");
        // 3. Remove Anna's Archive hashes (32 chars hex)
        cleaned = cleaned.replace(/\b[a-f0-9]{32}\b/g, "");
        // 4. Collapse multiple spaces
        return cleaned.replace(/\s+/g, " ").trim();
    }

    async openBook(path: string) {
        this.activeBookPath = path;
        
        const existingIndex = this.recentBooks.findIndex(b => b.path === path);
        
        if (existingIndex !== -1) {
            const book = this.recentBooks[existingIndex];
            book.lastReadAt = Date.now();
            // Move to top
            this.recentBooks.splice(existingIndex, 1);
            this.recentBooks.unshift(book);
            this.saveToStorage();
        } else {
            let filename = path.split(/[/\u005C]/).pop() || path;
            let title = filename.replace(/\.[^/.]+$/, "");
            let author: string | undefined = undefined;

            try {
                const metadata = await invoke<{title?: string, author?: string}>('get_metadata', { filePath: path });
                
                if (metadata.title && metadata.title.trim().length > 0) {
                    title = metadata.title;
                } else {
                    title = this.sanitizeTitle(title);
                }
                
                if (metadata.author && metadata.author.trim().length > 0) {
                    author = metadata.author;
                }
            } catch (e) {
                console.warn("Failed to extract metadata, falling back to filename:", e);
                title = title.replace(/_/g, " ");
            }
            
            const newBook: Book = {
                path: path,
                title: title,
                author: author,
                addedAt: Date.now(),
                lastReadAt: Date.now()
            };
            this.recentBooks.unshift(newBook);
            this.saveToStorage();
        }
        
        console.log('Book opened:', path);
    }

    removeBook(path: string) {
        this.recentBooks = this.recentBooks.filter(b => b.path !== path);
        this.saveToStorage();
    }

    // New Methods

    updateProgress(path: string, location: ReadingLocation) {
        const book = this.recentBooks.find(b => b.path === path);
        if (book) {
            book.currentLocation = location;
            book.progress = location.fraction;
            book.totalPages = location.totalPages;
            book.lastReadAt = Date.now();
            
            // Re-sort/move to top since it was read
            const index = this.recentBooks.indexOf(book);
            if (index > 0) {
                this.recentBooks.splice(index, 1);
                this.recentBooks.unshift(book);
            }
            
            this.saveToStorage();
        }
    }

    getProgress(path: string): ReadingLocation | undefined {
        const book = this.recentBooks.find(b => b.path === path);
        return book?.currentLocation;
    }

    clearProgress(path: string) {
        const book = this.recentBooks.find(b => b.path === path);
        if (book) {
            book.currentLocation = undefined;
            book.progress = 0;
            this.saveToStorage();
        }
    }

    addReadingTime(path: string, seconds: number) {
         const book = this.recentBooks.find(b => b.path === path);
         if (book) {
             book.totalReadingTime = (book.totalReadingTime || 0) + seconds;
             this.saveToStorage();
         }
    }

    getFormattedReadingTime(path: string): string {
        const book = this.recentBooks.find(b => b.path === path);
        if (!book || !book.totalReadingTime) return '0m';
        
        const totalMinutes = Math.floor(book.totalReadingTime / 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }
}

export const bookStore = new BookStore();
