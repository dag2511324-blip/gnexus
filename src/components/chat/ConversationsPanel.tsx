/**
 * Conversations Panel
 * 
 * Sidebar component displaying conversation history with search, filters, and actions.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Star,
    Archive,
    Trash2,
    MessageSquare,
    Filter,
    X,
    ChevronDown,
    Clock,
    MoreVertical,
    Edit2,
    Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Conversation } from '@/lib/api/conversations';

// =============================================================================
// TYPES
// =============================================================================

interface ConversationsPanelProps {
    conversations: Conversation[];
    currentConversationId: string | null;
    loading?: boolean;
    onSelectConversation: (id: string) => void;
    onNewConversation: () => void;
    onStarConversation: (id: string, isStarred: boolean) => void;
    onArchiveConversation: (id: string, isArchived: boolean) => void;
    onDeleteConversation: (id: string) => void;
    onRenameConversation: (id: string, title: string) => void;
    onExportConversation?: (id: string) => void;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ConversationsPanel({
    conversations,
    currentConversationId,
    loading = false,
    onSelectConversation,
    onNewConversation,
    onStarConversation,
    onArchiveConversation,
    onDeleteConversation,
    onRenameConversation,
    onExportConversation,
    isCollapsed = false,
    onToggleCollapse,
}: ConversationsPanelProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'starred' | 'archived'>('all');
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    // Filter conversations based on search and filter
    const filteredConversations = conversations.filter(conv => {
        // Apply filter
        if (filter === 'starred' && !conv.isStarred) return false;
        if (filter === 'archived' && !conv.isArchived) return false;
        if (filter === 'all' && conv.isArchived) return false;

        // Apply search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return conv.title.toLowerCase().includes(query);
        }

        return true;
    });

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        if (activeMenuId) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [activeMenuId]);

    if (isCollapsed) {
        return (
            <div className="w-16 h-full bg-[#0a0a0a]/50 backdrop-blur-xl border-r border-white/5 flex flex-col items-center py-4 gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleCollapse}
                    className="text-gray-400 hover:text-gray-200 hover:bg-white/10"
                >
                    <MessageSquare className="w-5 h-5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onNewConversation}
                    className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                    title="New Chat"
                >
                    <MessageSquare className="w-5 h-5" />
                </Button>
            </div>
        );
    }

    return (
        <div className="w-80 h-full bg-[#0a0a0a]/50 backdrop-blur-xl border-r border-white/5 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-white/5 space-y-3 shrink-0">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        Conversations
                    </h2>
                    {onToggleCollapse && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onToggleCollapse}
                            className="text-gray-400 hover:text-gray-200 hover:bg-white/10 h-8 w-8"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </div>

                {/* New Chat Button */}
                <Button
                    onClick={onNewConversation}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white"
                >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    New Chat
                </Button>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50"
                    />
                </div>

                {/* Filter Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === 'all'
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('starred')}
                        className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === 'starred'
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                    >
                        <Star className="w-3 h-3 inline mr-1" />
                        Starred
                    </button>
                    <button
                        onClick={() => setFilter('archived')}
                        className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === 'archived'
                            ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                    >
                        <Archive className="w-3 h-3 inline mr-1" />
                        Archived
                    </button>
                </div>
            </div>

            {/* Conversations List */}
            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="text-center py-8 px-4">
                            <MessageSquare className="w-12 h-12 mx-auto text-gray-600 mb-2" />
                            <p className="text-sm text-gray-500">
                                {searchQuery ? 'No conversations found' : 'No conversations yet'}
                            </p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {filteredConversations.map((conv) => (
                                <ConversationItem
                                    key={conv.id}
                                    conversation={conv}
                                    isActive={conv.id === currentConversationId}
                                    onClick={() => onSelectConversation(conv.id)}
                                    onStar={(isStarred) => onStarConversation(conv.id, isStarred)}
                                    onArchive={(isArchived) => onArchiveConversation(conv.id, isArchived)}
                                    onDelete={() => onDeleteConversation(conv.id)}
                                    onRename={(title) => onRenameConversation(conv.id, title)}
                                    onExport={() => onExportConversation?.(conv.id)}
                                    isMenuOpen={activeMenuId === conv.id}
                                    onMenuToggle={() => setActiveMenuId(activeMenuId === conv.id ? null : conv.id)}
                                />
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}

// =============================================================================
// CONVERSATION ITEM
// =============================================================================

interface ConversationItemProps {
    conversation: Conversation;
    isActive: boolean;
    onClick: () => void;
    onStar: (isStarred: boolean) => void;
    onArchive: (isArchived: boolean) => void;
    onDelete: () => void;
    onRename: (title: string) => void;
    onExport?: () => void;
    isMenuOpen: boolean;
    onMenuToggle: () => void;
}

function ConversationItem({
    conversation,
    isActive,
    onClick,
    onStar,
    onArchive,
    onDelete,
    onRename,
    onExport,
    isMenuOpen,
    onMenuToggle,
}: ConversationItemProps) {
    const [isRenaming, setIsRenaming] = useState(false);
    const [newTitle, setNewTitle] = useState(conversation.title);

    const handleRename = () => {
        if (newTitle.trim() && newTitle !== conversation.title) {
            onRename(newTitle.trim());
        }
        setIsRenaming(false);
    };

    const formatTimestamp = (date: string) => {
        const now = new Date();
        const then = new Date(date);
        const diffMs = now.getTime() - then.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return then.toLocaleDateString();
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`relative group rounded-lg transition-all cursor-pointer ${isActive
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30'
                : 'bg-white/5 hover:bg-white/10 border border-transparent'
                }`}
        >
            <div className="p-3" onClick={onClick}>
                <div className="flex items-start justify-between gap-2 mb-1">
                    {isRenaming ? (
                        <input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            onBlur={handleRename}
                            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 bg-white/10 border border-cyan-500/50 rounded px-2 py-1 text-sm text-gray-200 focus:outline-none"
                            autoFocus
                        />
                    ) : (
                        <h3 className="flex-1 font-medium text-sm text-gray-200 line-clamp-1">
                            {conversation.title}
                        </h3>
                    )}

                    <div className="flex items-center gap-1">
                        {conversation.isStarred && (
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        )}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onMenuToggle();
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 transition-opacity"
                        >
                            <MoreVertical className="w-3 h-3 text-gray-400" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimestamp(conversation.updatedAt)}</span>
                    {conversation.messageCount !== undefined && (
                        <>
                            <span>•</span>
                            <span>{conversation.messageCount} messages</span>
                        </>
                    )}
                </div>
            </div>

            {/* Context Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-2 top-12 z-50 w-48 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl overflow-hidden"
                    >
                        <div className="py-1">
                            <button
                                onClick={() => {
                                    setIsRenaming(true);
                                    onMenuToggle();
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-white/10 flex items-center gap-2"
                            >
                                <Edit2 className="w-4 h-4" />
                                Rename
                            </button>
                            <button
                                onClick={() => {
                                    onStar(!conversation.isStarred);
                                    onMenuToggle();
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-white/10 flex items-center gap-2"
                            >
                                <Star className={`w-4 h-4 ${conversation.isStarred ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                                {conversation.isStarred ? 'Unstar' : 'Star'}
                            </button>
                            {onExport && (
                                <button
                                    onClick={() => {
                                        onExport();
                                        onMenuToggle();
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-white/10 flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    Export
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    onArchive(!conversation.isArchived);
                                    onMenuToggle();
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-white/10 flex items-center gap-2"
                            >
                                <Archive className="w-4 h-4" />
                                {conversation.isArchived ? 'Unarchive' : 'Archive'}
                            </button>
                            <div className="border-t border-white/10 my-1" />
                            <button
                                onClick={() => {
                                    if (confirm('Are you sure you want to delete this conversation?')) {
                                        onDelete();
                                    }
                                    onMenuToggle();
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
