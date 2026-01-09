/**
 * Command Palette - Spotlight-style command interface
 * Quick access to all Agent Neo features
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Terminal, Brain, FileText, Layout, Zap, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';

export interface Command {
    id: string;
    title: string;
    description: string;
    icon: any;
    action: () => void;
    category: string;
    keywords: string[];
}

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    commands: Command[];
}

export function CommandPalette({ isOpen, onClose, commands }: CommandPaletteProps) {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredCommands = commands.filter(cmd => {
        const searchText = `${cmd.title} ${cmd.description} ${cmd.keywords.join(' ')}`.toLowerCase();
        return searchText.includes(query.toLowerCase());
    });

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            setQuery('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            switch (e.key) {
                case 'Escape':
                    onClose();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex(i => Math.max(i - 1, 0));
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (filteredCommands[selectedIndex]) {
                        filteredCommands[selectedIndex].action();
                        onClose();
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, selectedIndex, filteredCommands, onClose]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-32 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    className="w-full max-w-2xl bg-[#1a1a1a] rounded-xl border border-white/20 shadow-2xl overflow-hidden"
                >
                    {/* Search Input */}
                    <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
                        <Search className="w-5 h-5 text-gray-500" />
                        <Input
                            ref={inputRef}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search commands..."
                            className="flex-1 bg-transparent border-none text-lg text-white placeholder:text-gray-600 focus:ring-0"
                        />
                        <kbd className="px-2 py-1 text-xs bg-white/10 rounded text-gray-400">
                            ESC
                        </kbd>
                    </div>

                    {/* Commands List */}
                    <div className="max-h-96 overflow-y-auto">
                        {filteredCommands.length === 0 ? (
                            <div className="px-4 py-12 text-center text-gray-500">
                                No commands found
                            </div>
                        ) : (
                            filteredCommands.map((cmd, index) => {
                                const Icon = cmd.icon;
                                const isSelected = index === selectedIndex;

                                return (
                                    <button
                                        key={cmd.id}
                                        onClick={() => {
                                            cmd.action();
                                            onClose();
                                        }}
                                        className={`
                                            w-full flex items-center gap-3 px-4 py-3 text-left
                                            transition-colors
                                            ${isSelected
                                                ? 'bg-orange-500/20 border-l-2 border-orange-500'
                                                : 'hover:bg-white/5'
                                            }
                                        `}
                                    >
                                        <div className={`
                                            w-10 h-10 rounded-lg flex items-center justify-center
                                            ${isSelected ? 'bg-orange-500/20' : 'bg-white/5'}
                                        `}>
                                            <Icon className={`w-5 h-5 ${isSelected ? 'text-orange-400' : 'text-gray-400'}`} />
                                        </div>
                                        <div className="flex-1">
                                            <div className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                                {cmd.title}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {cmd.description}
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            {cmd.category}
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2 border-t border-white/10 flex items-center justify-between text-xs text-gray-600">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-white/10 rounded">↑</kbd>
                                <kbd className="px-1.5 py-0.5 bg-white/10 rounded">↓</kbd>
                                <span>Navigate</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-white/10 rounded">Enter</kbd>
                                <span>Select</span>
                            </div>
                        </div>
                        <div>
                            {filteredCommands.length} commands
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

// Default commands for Agent Neo
export const DEFAULT_COMMANDS: Command[] = [
    {
        id: 'toggle-file-explorer',
        title: 'Toggle File Explorer',
        description: 'Show or hide the file explorer panel',
        icon: FileText,
        action: () => { },
        category: 'View',
        keywords: ['files', 'sidebar', 'explorer'],
    },
    {
        id: 'toggle-code-preview',
        title: 'Toggle Code Preview',
        description: 'Show or hide the code preview panel',
        icon: Terminal,
        category: 'View',
        action: () => { },
        keywords: ['code', 'editor', 'monaco'],
    },
    {
        id: 'switch-thought-graph',
        title: 'Switch to Thought Graph',
        description: 'View AI reasoning as an interactive graph',
        icon: Brain,
        category: 'Workspace',
        action: () => { },
        keywords: ['thinking', 'visualization', 'nodes'],
    },
    {
        id: 'switch-planning-tree',
        title: 'Switch to Planning Tree',
        description: 'Manage tasks in hierarchical structure',
        icon: Layout,
        category: 'Workspace',
        action: () => { },
        keywords: ['tasks', 'planning', 'hierarchy'],
    },
    {
        id: 'new-request',
        title: 'New AI Request',
        description: 'Start a new multi-agent pipeline',
        icon: Zap,
        category: 'Action',
        action: () => { },
        keywords: ['ai', 'generate', 'create'],
    },
];
