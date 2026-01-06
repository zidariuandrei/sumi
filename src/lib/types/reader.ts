export interface ReadingLocation {
  cfi?: string;
  page?: number;
  totalPages?: number;
  fraction: number;
  label?: string;
}

export interface TocItem {
  id: string;
  label: string;
  href: string;
  level: number;
  page?: number;
  children?: TocItem[];
}

export interface ReaderSettings {
  fontFamily: 'serif' | 'sans-serif' | 'monospace';
  fontSize: number;
  lineHeight: number;
  marginHorizontal: number;
  marginVertical: number;
  textAlign: 'left' | 'justify';
}

export const DEFAULT_READER_SETTINGS: ReaderSettings = {
  fontFamily: 'sans-serif',
  fontSize: 16,
  lineHeight: 1.5,
  marginHorizontal: 40,
  marginVertical: 40,
  textAlign: 'justify'
};

export interface Bookmark {
  id: string;
  bookPath: string;
  location: string;
  label?: string;
  note?: string;
  createdAt: number;
  displayPage?: number;
  displaySection?: string;
}

export interface ReadingSession {
  id: string;
  bookPath: string;
  startTime: number;
  endTime?: number;
  duration: number;
}

export interface BookStatistics {
  bookPath: string;
  totalTime: number;
  sessionCount: number;
  firstOpened?: number;
  lastRead?: number;
}

export type DrawerType = 'toc' | 'settings' | 'bookmarks' | null;
export type SortOption = 'title' | 'author' | 'lastRead' | 'dateAdded';
export type SortDirection = 'asc' | 'desc';

export interface KeyboardShortcut {
  key: string;
  action: string;
  category: 'navigation' | 'ui' | 'reading';
  description: string;
  modifiers?: ('Shift' | 'Ctrl' | 'Alt' | 'Meta')[];
}

export type ShortcutsRegistry = Record<string, KeyboardShortcut>;
