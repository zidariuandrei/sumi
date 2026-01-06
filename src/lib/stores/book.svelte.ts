import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';

export interface Book {
    path: string;
    title: string;
    author?: string;
    addedAt: number;
    lastReadAt?: number;
}

class BookStore {
    activeBookPath = $state<string | null>(null);
    recentBooks = $state<Book[]>([]);

    get activeBook() {
        return this.recentBooks.find(b => b.path === this.activeBookPath);
    }

    constructor() {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('recentBooks');
            if (stored) {
                try {
                    this.recentBooks = JSON.parse(stored);
                } catch (err) {
                    console.error('Failed to parse recentBooks:', err);
                    this.recentBooks = [];
                }
            }
        }
    }

    private saveToStorage() {
        if (typeof window !== 'undefined') {
            localStorage.setItem('recentBooks', JSON.stringify(this.recentBooks));
        }
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

    async openBook(path: string) {
        this.activeBookPath = path;
        
        const existingIndex = this.recentBooks.findIndex(b => b.path === path);
        
        if (existingIndex !== -1) {
            // Update lastReadAt for existing book and move to top
            const book = this.recentBooks[existingIndex];
            book.lastReadAt = Date.now();
            this.recentBooks.splice(existingIndex, 1);
            this.recentBooks.unshift(book);
            this.saveToStorage();
        } else {
            // Default fallback: filename without extension
            let filename = path.split(/[/\\]/).pop() || path;
            let title = filename.replace(/\.[^/.]+$/, "");
            let author: string | undefined = undefined;

            try {
                // Try to get real metadata from backend
                const metadata = await invoke<{title?: string, author?: string}>('get_metadata', { filePath: path });
                
                if (metadata.title && metadata.title.trim().length > 0) {
                    title = metadata.title;
                } else {
                    // Heuristic sanitization if no metadata title
                    // 1. Replace underscores with spaces
                    title = title.replace(/_/g, " ");
                    // 2. Normalize " -- " separators to " - "
                    title = title.replace(/\s+--\s+/g, " - ");
                    // 3. Remove Anna's Archive hashes (32 chars hex)
                    title = title.replace(/\b[a-f0-9]{32}\b/g, "");
                    // 4. Collapse multiple spaces
                    title = title.replace(/\s+/g, " ").trim();
                }
                
                if (metadata.author && metadata.author.trim().length > 0) {
                    author = metadata.author;
                }
            } catch (e) {
                console.warn("Failed to extract metadata, falling back to filename:", e);
                title = title.replace(/_/g, " ");
            }
            
            // Add new book
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
}

export const bookStore = new BookStore();
