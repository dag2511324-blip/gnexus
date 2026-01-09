/**
 * Conversation Sidebar Component
 */

import { Plus, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Conversation } from '@/lib/conversation-store';

interface ConversationSidebarProps {
    conversations: Conversation[];
    activeId: string | null;
    onSelect: (id: string) => void;
    onNew: () => void;
    onDelete: (id: string) => void;
    onExport: (id: string) => void;
}

export function ConversationSidebar({
    conversations,
    activeId,
    onSelect,
    onNew,
    onDelete,
    onExport,
}: ConversationSidebarProps) {
    return (
        <div className="w-64 h-full bg-[#1a1a1a] border-r border-white/10 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-white/10">
                <Button
                    onClick={onNew}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Chat
                </Button>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto p-2">
                {conversations.length === 0 ? (
                    <div className="text-center text-gray-500 text-sm mt-8">
                        No conversations yet
                    </div>
                ) : (
                    conversations.map((conv) => (
                        <div
                            key={conv.id}
                            className={`group relative p-3 rounded-lg transition-colors cursor-pointer mb-2 ${conv.id === activeId
                                    ? 'bg-white/10 border border-white/20'
                                    : 'hover:bg-white/5 border border-transparent'
                                }`}
                            onClick={() => onSelect(conv.id)}
                        >
                            <div className="text-sm text-white font-medium truncate pr-16">
                                {conv.title}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                {new Date(conv.updatedAt).toLocaleDateString()}
                            </div>

                            {/* Actions */}
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onExport(conv.id);
                                    }}
                                    className="h-6 w-6 text-gray-400 hover:text-white"
                                >
                                    <Download className="w-3 h-3" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(conv.id);
                                    }}
                                    className="h-6 w-6 text-gray-400 hover:text-red-500"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
