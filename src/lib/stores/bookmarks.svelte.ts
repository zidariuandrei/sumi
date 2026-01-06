import type { Bookmark } from '$lib/types/reader';
import { storage, STORAGE_KEYS } from '$lib/utils/storage';

class BookmarksStore {
    private _bookmarks = $state<Record<string, Bookmark[]>>({});
    activeBookPath = $state<string | null>(null);

    constructor() {
        if (typeof window !== 'undefined') {
            this._bookmarks = storage.get<Record<string, Bookmark[]>>(STORAGE_KEYS.BOOKMARKS, {});
        }
    }

    private _save() {
        storage.set(STORAGE_KEYS.BOOKMARKS, this._bookmarks);
    }

    // CRUD
    addBookmark(bookPath: string, location: string, options?: { label?: string; note?: string; displayPage?: number; displaySection?: string }): Bookmark {
        const id = typeof crypto.randomUUID === 'function' 
            ? crypto.randomUUID() 
            : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            
        const bookmark: Bookmark = {
            id,
            bookPath,
            location,
            createdAt: Date.now(),
            label: options?.label,
            note: options?.note,
            displayPage: options?.displayPage,
            displaySection: options?.displaySection
        };

        if (!this._bookmarks[bookPath]) {
            this._bookmarks[bookPath] = [];
        }

        this._bookmarks[bookPath].push(bookmark);
        this._save();
        return bookmark;
    }

    removeBookmark(id: string): boolean {
        let found = false;
        for (const bookPath in this._bookmarks) {
            const initialLength = this._bookmarks[bookPath].length;
            this._bookmarks[bookPath] = this._bookmarks[bookPath].filter(b => b.id !== id);
            if (this._bookmarks[bookPath].length < initialLength) {
                found = true;
                // Clean up empty arrays
                if (this._bookmarks[bookPath].length === 0) {
                    delete this._bookmarks[bookPath];
                }
                break;
            }
        }

        if (found) {
            this._save();
        }
        return found;
    }

    updateBookmark(id: string, updates: { label?: string; note?: string }): Bookmark | null {
        for (const bookPath in this._bookmarks) {
            const index = this._bookmarks[bookPath].findIndex(b => b.id === id);
            if (index !== -1) {
                const bookmark = this._bookmarks[bookPath][index];
                if (updates.label !== undefined) bookmark.label = updates.label;
                if (updates.note !== undefined) bookmark.note = updates.note;
                
                this._save();
                return bookmark;
            }
        }
        return null;
    }

    // Queries
    getBookmarksForBook(bookPath: string): Bookmark[] {
        return this._bookmarks[bookPath] || [];
    }

    getBookmark(id: string): Bookmark | undefined {
        for (const bookPath in this._bookmarks) {
            const bookmark = this._bookmarks[bookPath].find(b => b.id === id);
            if (bookmark) return bookmark;
        }
        return undefined;
    }

    hasBookmarkAt(bookPath: string, location: string): boolean {
        const bookmarks = this._bookmarks[bookPath];
        if (!bookmarks) return false;
        return bookmarks.some(b => b.location === location);
    }

    getBookmarkAt(bookPath: string, location: string): Bookmark | undefined {
        const bookmarks = this._bookmarks[bookPath];
        if (!bookmarks) return undefined;
        return bookmarks.find(b => b.location === location);
    }

    // Convenience
    toggleBookmark(bookPath: string, location: string, options?: { label?: string; note?: string; displayPage?: number; displaySection?: string }): Bookmark | null {
        const existing = this.getBookmarkAt(bookPath, location);
        if (existing) {
            this.removeBookmark(existing.id);
            return null;
        } else {
            return this.addBookmark(bookPath, location, options);
        }
    }

    clearBookmarksForBook(bookPath: string): number {
        const bookmarks = this._bookmarks[bookPath];
        if (!bookmarks) return 0;
        
        const count = bookmarks.length;
        delete this._bookmarks[bookPath];
        this._save();
        return count;
    }

    setActiveBook(bookPath: string | null): void {
        this.activeBookPath = bookPath;
    }

    // Computed
    get activeBookBookmarks(): Bookmark[] {
        if (!this.activeBookPath) return [];
        return this.getBookmarksForBook(this.activeBookPath);
    }

    get totalCount(): number {
        return Object.values(this._bookmarks).reduce((acc, curr) => acc + curr.length, 0);
    }
}

export const bookmarksStore = new BookmarksStore();
