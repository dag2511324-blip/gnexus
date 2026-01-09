/**
 * Keyboard Shortcuts Hook
 * Professional keyboard shortcuts for Agent Neo Elite
 */

import { useEffect } from 'react';

export interface ShortcutConfig {
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    action: () => void;
    description: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            shortcuts.forEach(shortcut => {
                const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
                const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
                const altMatch = shortcut.alt ? event.altKey : !event.altKey;
                const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

                if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
                    event.preventDefault();
                    shortcut.action();
                }
            });
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts]);
}

// Predefined shortcuts for Agent Neo
export const AGENT_SHORTCUTS: Record<string, Omit<ShortcutConfig, 'action'>> = {
    TOGGLE_FILE_EXPLORER: {
        key: 'b',
        ctrl: true,
        description: 'Toggle File Explorer',
    },
    TOGGLE_CODE_PREVIEW: {
        key: 'k',
        ctrl: true,
        description: 'Toggle Code Preview',
    },
    TOGGLE_CHAT: {
        key: '/',
        ctrl: true,
        description: 'Toggle Chat Panel',
    },
    COMMAND_PALETTE: {
        key: 'p',
        ctrl: true,
        shift: true,
        description: 'Open Command Palette',
    },
    NEW_STICKY_NOTE: {
        key: 'n',
        ctrl: true,
        shift: true,
        description: 'New Sticky Note',
    },
    EXPORT_CANVAS: {
        key: 's',
        ctrl: true,
        shift: true,
        description: 'Export Canvas',
    },
    FULLSCREEN: {
        key: 'f',
        ctrl: true,
        shift: true,
        description: 'Toggle Fullscreen',
    },
    UNDO: {
        key: 'z',
        ctrl: true,
        description: 'Undo',
    },
    REDO: {
        key: 'y',
        ctrl: true,
        description: 'Redo',
    },
    SEARCH: {
        key: 'f',
        ctrl: true,
        description: 'Search',
    },
};
