import type { KeyboardShortcut, ShortcutsRegistry } from '$lib/types/reader';

const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

export const SHORTCUTS: ShortcutsRegistry = {
  PREV_PAGE_ARROW: {
    key: 'ArrowLeft',
    action: 'prevPage',
    category: 'navigation',
    description: 'Previous page'
  },
  NEXT_PAGE_ARROW: {
    key: 'ArrowRight',
    action: 'nextPage',
    category: 'navigation',
    description: 'Next page'
  },
  NEXT_PAGE_SPACE: {
    key: ' ',
    action: 'nextPage',
    category: 'navigation',
    description: 'Next page'
  },
  PREV_PAGE_SPACE: {
    key: ' ',
    modifiers: ['Shift'],
    action: 'prevPage',
    category: 'navigation',
    description: 'Previous page'
  },
  START_BOOK: {
    key: 'Home',
    action: 'startOfBook',
    category: 'navigation',
    description: 'Go to start of book'
  },
  END_BOOK: {
    key: 'End',
    action: 'endOfBook',
    category: 'navigation',
    description: 'Go to end of book'
  },
  TOGGLE_TOC: {
    key: 't',
    action: 'toggleToc',
    category: 'ui',
    description: 'Toggle Table of Contents'
  },
  ADD_BOOKMARK: {
    key: 'b',
    action: 'addBookmark',
    category: 'ui',
    description: 'Add bookmark'
  },
  TOGGLE_BOOKMARKS: {
    key: 'b',
    modifiers: ['Shift'],
    action: 'toggleBookmarks',
    category: 'ui',
    description: 'Toggle bookmarks panel'
  },
  TOGGLE_SETTINGS: {
    key: 's',
    action: 'toggleSettings',
    category: 'ui',
    description: 'Toggle settings'
  },
  GOTO_PAGE: {
    key: 'g',
    action: 'gotoPage',
    category: 'ui',
    description: 'Go to page'
  },
  CLOSE_PANEL: {
    key: 'Escape',
    action: 'closePanel',
    category: 'ui',
    description: 'Close panel'
  },
  SHOW_HELP: {
    key: '?',
    action: 'showHelp',
    category: 'ui',
    description: 'Show shortcuts help'
  },
  FONT_SIZE_INC: {
    key: '+',
    action: 'increaseFontSize',
    category: 'reading',
    description: 'Increase font size'
  },
  FONT_SIZE_DEC: {
    key: '-',
    action: 'decreaseFontSize',
    category: 'reading',
    description: 'Decrease font size'
  },
  FONT_SIZE_RESET: {
    key: '0',
    action: 'resetFontSize',
    category: 'reading',
    description: 'Reset font size'
  }
};

export function matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
  // Check key (case-insensitive for letters)
  const eventKey = event.key.toLowerCase();
  const shortcutKey = shortcut.key.toLowerCase();
  
  // Special case: strict match needed for some keys?
  // If shortcut.key is '?' and event.key is '?', they match.
  // But if event.key is 'b' and shortcut is 'b', they match.
  if (eventKey !== shortcutKey) {
    return false;
  }

  // Check modifiers
  const modifiers = shortcut.modifiers || [];
  
  const hasShift = modifiers.includes('Shift');
  const hasCtrl = modifiers.includes('Ctrl');
  const hasAlt = modifiers.includes('Alt');
  const hasMeta = modifiers.includes('Meta');

  // Check Shift
  // Special case: If the key is a symbol that might require Shift (e.g. '?', '+'),
  // and the shortcut key matches exactly, we shouldn't fail if event.shiftKey is true
  // but the modifier list doesn't include Shift.
  // However, we MUST check Shift for letters (b vs B) and Space (Space vs Shift+Space).
  
  const isLetter = /^[a-z]$/i.test(event.key);
  const isWhitespace = /^\s$/.test(event.key);
  
  if (isLetter || isWhitespace) {
    if (event.shiftKey !== hasShift) return false;
  } else {
    // For other keys (symbols, arrows, etc), only check if Shift is EXPLICITLY required.
    // If Shift is NOT required, we don't care if it's pressed, AS LONG AS the key matched.
    // Actually, for Arrow keys, Shift+Arrow might select text, so we might want to be strict.
    // The requirement only lists Space/Shift+Space and letters.
    // Let's stick to: if Shift is required, it must be there.
    // If Shift is NOT required, it must NOT be there, UNLESS it's a shifted symbol like ? or +.
    
    if (hasShift && !event.shiftKey) return false;
    
    // If !hasShift, usually we want !event.shiftKey.
    // But for ? and +, event.shiftKey is true.
    // How to distinguish?
    // If event.key implies shift...
    // Let's just say: if !hasShift, and event.shiftKey is true,
    // allow it ONLY if the key itself is different when unshifted?
    // Too complex.
    // Simple heuristic: If it's ? or +, allow shift.
    const isShiftedSymbol = ['?', '+', ':', '"', '<', '>', '{', '}', '|', '~', '_'].includes(event.key);
    if (!hasShift && event.shiftKey && !isShiftedSymbol) return false;
  }

  if (event.altKey !== hasAlt) return false;
  if (event.ctrlKey !== hasCtrl) return false;
  if (event.metaKey !== hasMeta) return false;

  return true;
}

export function findMatchingAction(event: KeyboardEvent): string | null {
  for (const key in SHORTCUTS) {
    const shortcut = SHORTCUTS[key];
    if (matchesShortcut(event, shortcut)) {
      return shortcut.action;
    }
  }
  return null;
}

export function isInputElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  
  if (target.isContentEditable) return true;
  
  const tagName = target.tagName;
  if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') {
    return true;
  }
  
  return false;
}

export function createKeyboardHandler(handlers: Record<string, () => void>): (e: KeyboardEvent) => void {
  return (event: KeyboardEvent) => {
    if (isInputElement(event.target)) return;
    
    const action = findMatchingAction(event);
    if (action && handlers[action]) {
      event.preventDefault();
      handlers[action]();
    }
  };
}

export function getShortcutsByCategory(): Record<string, KeyboardShortcut[]> {
  const categories: Record<string, KeyboardShortcut[]> = {};
  
  Object.values(SHORTCUTS).forEach(shortcut => {
    if (!categories[shortcut.category]) {
      categories[shortcut.category] = [];
    }
    categories[shortcut.category].push(shortcut);
  });
  
  return categories;
}

export function formatShortcutDisplay(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];
  
  if (shortcut.modifiers) {
    shortcut.modifiers.forEach(mod => {
      if (mod === 'Meta') {
        parts.push(isMac ? '⌘' : 'Win');
      } else if (mod === 'Ctrl') {
        parts.push(isMac ? '^' : 'Ctrl'); // Or just Ctrl
      } else if (mod === 'Alt') {
        parts.push(isMac ? '⌥' : 'Alt');
      } else if (mod === 'Shift') {
        parts.push(isMac ? '⇧' : 'Shift');
      } else {
        parts.push(mod);
      }
    });
  }
  
  let key = shortcut.key;
  if (key === ' ') key = 'Space';
  if (key === 'ArrowLeft') key = '←';
  if (key === 'ArrowRight') key = '→';
  if (key === 'ArrowUp') key = '↑';
  if (key === 'ArrowDown') key = '↓';
  
  parts.push(key.toUpperCase());
  
  return parts.join(isMac ? '' : ' + '); // Mac usually jams them together or uses spaces, Win uses +
}
