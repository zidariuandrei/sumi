
const PREFIX = 'sumi:';

export const STORAGE_KEYS = {
    RECENT_BOOKS: 'recentBooks',
    BOOK_PROGRESS: 'bookProgress', 
    READER_SETTINGS: 'readerSettings',
    BOOKMARKS: 'bookmarks',
    READING_STATS: 'readingStats',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

function get<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') {
        return defaultValue;
    }

    try {
        const item = window.localStorage.getItem(`${PREFIX}${key}`);
        if (item === null) {
            return defaultValue;
        }
        return JSON.parse(item) as T;
    } catch (error) {
        console.warn(`Error reading from storage for key "${key}":`, error);
        return defaultValue;
    }
}

function set<T>(key: string, value: T): boolean {
    if (typeof window === 'undefined') {
        return false;
    }

    try {
        window.localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
        return true;
    } catch (error) {
        console.warn(`Error writing to storage for key "${key}":`, error);
        return false;
    }
}

function remove(key: string): boolean {
    if (typeof window === 'undefined') {
        return false;
    }

    try {
        window.localStorage.removeItem(`${PREFIX}${key}`);
        return true;
    } catch (error) {
        console.warn(`Error removing from storage for key "${key}":`, error);
        return false;
    }
}

function has(key: string): boolean {
    if (typeof window === 'undefined') {
        return false;
    }

    try {
        return window.localStorage.getItem(`${PREFIX}${key}`) !== null;
    } catch (error) {
        console.warn(`Error checking storage for key "${key}":`, error);
        return false;
    }
}

export const storage = {
    get,
    set,
    remove,
    has,
};

export { get, set, remove, has };
