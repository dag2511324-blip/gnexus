/**
 * Chat Input - Multi-modal message input
 */

import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Paperclip, Mic, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Attachment } from '../ChatContainer';

interface ChatInputProps {
    value: string;
    onChange: (value: string) => void;
    onSend: (content: string, attachments?: Attachment[]) => void;
    disabled?: boolean;
}

export function ChatInput({ value, onChange, onSend, disabled }: ChatInputProps) {
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSend = () => {
        if (!value.trim() && attachments.length === 0) return;
        onSend(value, attachments);
        setAttachments([]);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const newAttachments: Attachment[] = files.map(file => ({
            type: file.type.startsWith('image/') ? 'image' : 'file',
            name: file.name,
            url: URL.createObjectURL(file),
            size: file.size,
        }));
        setAttachments(prev => [...prev, ...newAttachments]);
    };

    return (
        <div className="border-t border-white/10 bg-[#0a0a0a] px-4 py-4">
            <div className="max-w-3xl mx-auto">
                {/* Attachments Preview */}
                {attachments.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                        {attachments.map((attachment, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg"
                            >
                                {attachment.type === 'image' ? (
                                    <ImageIcon className="w-4 h-4 text-gray-400" />
                                ) : (
                                    <Paperclip className="w-4 h-4 text-gray-400" />
                                )}
                                <span className="text-sm text-gray-300">{attachment.name}</span>
                                <button
                                    onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                                    className="text-gray-500 hover:text-white"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Input Container */}
                <div className="flex items-end gap-2 bg-white/5 border border-white/10 rounded-2xl p-2">
                    {/* Attachment Buttons */}
                    <div className="flex items-center gap-1 pb-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            className="hidden"
                            onChange={handleFileUpload}
                            accept="image/*,.pdf,.doc,.docx,.txt"
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => fileInputRef.current?.click()}
                            className="h-8 w-8 text-gray-400 hover:text-white"
                            disabled={disabled}
                        >
                            <Paperclip className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-white"
                            disabled={disabled}
                        >
                            <Mic className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Textarea */}
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Message AI assistant..."
                        disabled={disabled}
                        rows={1}
                        className="
                            flex-1 bg-transparent border-none outline-none resize-none
                            text-white placeholder-gray-500 px-2 py-2
                            max-h-32 overflow-y-auto
                        "
                        style={{
                            minHeight: '40px',
                            height: 'auto',
                        }}
                        onInput={(e) => {
                            e.currentTarget.style.height = 'auto';
                            e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                        }}
                    />

                    {/* Send Button */}
                    <Button
                        onClick={handleSend}
                        disabled={disabled || (!value.trim() && attachments.length === 0)}
                        className="h-10 w-10 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50"
                        size="icon"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>

                {/* Hint Text */}
                <div className="mt-2 text-xs text-gray-500 text-center">
                    Press Enter to send, Shift+Enter for new line
                </div>
            </div>
        </div>
    );
}
