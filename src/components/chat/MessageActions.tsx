/**
 * Message Actions Component
 * 
 * Reusable action buttons for chat messages (copy, regenerate, edit, delete)
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Copy,
    Check,
    RotateCw,
    Edit2,
    Trash2,
    MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

// =============================================================================
// TYPES
// =============================================================================

interface MessageActionsProps {
    messageId: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    onCopy?: () => void;
    onRegenerate?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    className?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function MessageActions({
    messageId,
    role,
    content,
    onCopy,
    onRegenerate,
    onEdit,
    onDelete,
    className = '',
}: MessageActionsProps) {
    const [copied, setCopied] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    // Handle copy to clipboard
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            onCopy?.();

            // Show success toast
            toast({
                title: "Copied!",
                description: "Message copied to clipboard",
            });

            // Reset copied state after 2 seconds
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy text:', error);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = content;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            {/* Copy Button - Always visible */}
            <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="h-7 w-7 text-gray-400 hover:text-gray-200 hover:bg-white/10"
                title="Copy message"
            >
                {copied ? (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                        <Check className="w-4 h-4 text-green-400" />
                    </motion.div>
                ) : (
                    <Copy className="w-4 h-4" />
                )}
            </Button>

            {/* Regenerate Button - Only for assistant messages */}
            {role === 'assistant' && onRegenerate && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onRegenerate}
                    className="h-7 w-7 text-gray-400 hover:text-gray-200 hover:bg-white/10"
                    title="Regenerate response"
                >
                    <RotateCw className="w-4 h-4" />
                </Button>
            )}

            {/* Edit Button - Only for user messages */}
            {role === 'user' && onEdit && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onEdit}
                    className="h-7 w-7 text-gray-400 hover:text-gray-200 hover:bg-white/10"
                    title="Edit message"
                >
                    <Edit2 className="w-4 h-4" />
                </Button>
            )}

            {/* Delete Button - Optional for all messages */}
            {onDelete && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onDelete}
                    className="h-7 w-7 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                    title="Delete message"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            )}
        </div>
    );
}

/**
 * Compact Message Actions - Shows only copy, others in menu
 */
export function CompactMessageActions({
    messageId,
    role,
    content,
    onCopy,
    onRegenerate,
    onEdit,
    onDelete,
    className = '',
}: MessageActionsProps) {
    const [copied, setCopied] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            onCopy?.();
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            {/* Copy - Always visible */}
            <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="h-7 w-7 text-gray-400 hover:text-gray-200 hover:bg-white/10"
            >
                {copied ? (
                    <Check className="w-4 h-4 text-green-400" />
                ) : (
                    <Copy className="w-4 h-4" />
                )}
            </Button>

            {/* More Menu */}
            {(onRegenerate || onEdit || onDelete) && (
                <div className="relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="h-7 w-7 text-gray-400 hover:text-gray-200 hover:bg-white/10"
                    >
                        <MoreHorizontal className="w-4 h-4" />
                    </Button>

                    {menuOpen && (
                        <>
                            {/* Backdrop */}
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setMenuOpen(false)}
                            />

                            {/* Menu */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute right-0 mt-1 w-40 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl py-1 z-20"
                            >
                                {role === 'assistant' && onRegenerate && (
                                    <button
                                        onClick={() => {
                                            onRegenerate();
                                            setMenuOpen(false);
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm text-gray-200 hover:bg-white/10 flex items-center gap-2"
                                    >
                                        <RotateCw className="w-4 h-4" />
                                        Regenerate
                                    </button>
                                )}

                                {role === 'user' && onEdit && (
                                    <button
                                        onClick={() => {
                                            onEdit();
                                            setMenuOpen(false);
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm text-gray-200 hover:bg-white/10 flex items-center gap-2"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Edit
                                    </button>
                                )}

                                {onDelete && (
                                    <>
                                        <div className="border-t border-white/10 my-1" />
                                        <button
                                            onClick={() => {
                                                onDelete();
                                                setMenuOpen(false);
                                            }}
                                            className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </button>
                                    </>
                                )}
                            </motion.div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
