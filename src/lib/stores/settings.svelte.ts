import { type ReaderSettings, DEFAULT_READER_SETTINGS } from '$lib/types/reader';
import { storage, STORAGE_KEYS } from '$lib/utils/storage';

export const FONT_SIZE_MIN = 12;
export const FONT_SIZE_MAX = 32;
export const FONT_SIZE_STEP = 2;
export const LINE_HEIGHT_MIN = 1.0;
export const LINE_HEIGHT_MAX = 2.5;
export const MARGIN_MIN = 0;
export const MARGIN_MAX = 100;

class SettingsStore {
    globalSettings = $state<ReaderSettings>(DEFAULT_READER_SETTINGS);
    bookSettings = $state<Record<string, Partial<ReaderSettings>>>({});
    activeBookPath = $state<string | null>(null);

    constructor() {
        const storedGlobal = storage.get<ReaderSettings>(STORAGE_KEYS.READER_SETTINGS, DEFAULT_READER_SETTINGS);
        this.globalSettings = { ...DEFAULT_READER_SETTINGS, ...storedGlobal };
        this.bookSettings = storage.get<Record<string, Partial<ReaderSettings>>>(STORAGE_KEYS.BOOK_SPECIFIC_SETTINGS, {});
    }

    get activeSettings(): ReaderSettings {
        if (this.activeBookPath && this.bookSettings[this.activeBookPath]) {
            return { ...this.globalSettings, ...this.bookSettings[this.activeBookPath] };
        }
        return this.globalSettings;
    }

    updateGlobal(updates: Partial<ReaderSettings>) {
        this.globalSettings = this.validateSettings({ ...this.globalSettings, ...updates });
        storage.set(STORAGE_KEYS.READER_SETTINGS, this.globalSettings);
    }

    updateForBook(bookPath: string, updates: Partial<ReaderSettings>) {
        const currentBookSettings = this.bookSettings[bookPath] || {};
        const validatedUpdates = this.validatePartial(updates);
        
        // Update state
        this.bookSettings = {
            ...this.bookSettings,
            [bookPath]: { ...currentBookSettings, ...validatedUpdates }
        };
        
        storage.set(STORAGE_KEYS.BOOK_SPECIFIC_SETTINGS, this.bookSettings);
    }

    getSettingsForBook(bookPath: string): ReaderSettings {
        if (this.bookSettings[bookPath]) {
            return { ...this.globalSettings, ...this.bookSettings[bookPath] };
        }
        return this.globalSettings;
    }

    clearBookSettings(bookPath: string) {
        if (this.bookSettings[bookPath]) {
            const newSettings = { ...this.bookSettings };
            delete newSettings[bookPath];
            this.bookSettings = newSettings;
            storage.set(STORAGE_KEYS.BOOK_SPECIFIC_SETTINGS, this.bookSettings);
        }
    }

    hasBookSettings(bookPath: string): boolean {
        return !!this.bookSettings[bookPath];
    }

    setActiveBook(bookPath: string | null) {
        this.activeBookPath = bookPath;
    }

    increaseFontSize() {
        this.updateFontSize(FONT_SIZE_STEP);
    }

    decreaseFontSize() {
        this.updateFontSize(-FONT_SIZE_STEP);
    }

    resetFontSize() {
        if (this.activeBookPath) {
             this.updateForBook(this.activeBookPath, { fontSize: DEFAULT_READER_SETTINGS.fontSize });
        } else {
             this.updateGlobal({ fontSize: DEFAULT_READER_SETTINGS.fontSize });
        }
    }

    private updateFontSize(delta: number) {
        const current = this.activeSettings.fontSize;
        const newSize = this.clamp(current + delta, FONT_SIZE_MIN, FONT_SIZE_MAX);
        
        if (this.activeBookPath) {
            this.updateForBook(this.activeBookPath, { fontSize: newSize });
        } else {
            this.updateGlobal({ fontSize: newSize });
        }
    }
    
    resetGlobal() {
        this.globalSettings = { ...DEFAULT_READER_SETTINGS };
        storage.set(STORAGE_KEYS.READER_SETTINGS, this.globalSettings);
    }

    resetAll() {
        this.globalSettings = { ...DEFAULT_READER_SETTINGS };
        this.bookSettings = {};
        storage.set(STORAGE_KEYS.READER_SETTINGS, this.globalSettings);
        storage.set(STORAGE_KEYS.BOOK_SPECIFIC_SETTINGS, this.bookSettings);
    }

    private validateSettings(settings: ReaderSettings): ReaderSettings {
        return {
            ...settings,
            fontSize: this.clamp(settings.fontSize, FONT_SIZE_MIN, FONT_SIZE_MAX),
            lineHeight: this.clamp(settings.lineHeight, LINE_HEIGHT_MIN, LINE_HEIGHT_MAX),
            marginHorizontal: this.clamp(settings.marginHorizontal, MARGIN_MIN, MARGIN_MAX),
            marginVertical: this.clamp(settings.marginVertical, MARGIN_MIN, MARGIN_MAX),
            fontFamily: settings.fontFamily,
            textAlign: settings.textAlign
        };
    }

    private validatePartial(settings: Partial<ReaderSettings>): Partial<ReaderSettings> {
        const validated: Partial<ReaderSettings> = {};
        if (settings.fontSize !== undefined) validated.fontSize = this.clamp(settings.fontSize, FONT_SIZE_MIN, FONT_SIZE_MAX);
        if (settings.lineHeight !== undefined) validated.lineHeight = this.clamp(settings.lineHeight, LINE_HEIGHT_MIN, LINE_HEIGHT_MAX);
        if (settings.marginHorizontal !== undefined) validated.marginHorizontal = this.clamp(settings.marginHorizontal, MARGIN_MIN, MARGIN_MAX);
        if (settings.marginVertical !== undefined) validated.marginVertical = this.clamp(settings.marginVertical, MARGIN_MIN, MARGIN_MAX);
        if (settings.fontFamily !== undefined) validated.fontFamily = settings.fontFamily;
        if (settings.textAlign !== undefined) validated.textAlign = settings.textAlign;
        return validated;
    }

    private clamp(val: number, min: number, max: number): number {
        return Math.min(Math.max(val, min), max);
    }
}

export const settingsStore = new SettingsStore();
