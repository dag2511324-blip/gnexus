/**
 * Enhanced Chat Panel
 * Real-time chat interface for conversations with the AI
 */

import { useState, useRef, useEffect } from 'react';
import { Send, Copy, Trash2, Download, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    hasCode?: boolean;
}

interface ChatPanelProps {
    onCodeExtract?: (code: string) => void;
}

export function ChatPanel({ onCodeExtract }: ChatPanelProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Hello! I\'m Agent Neo. How can I assist you today?',
            timestamp: new Date(),
        }
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');

        // Simulate AI response (replace with actual API call)
        setTimeout(() => {
            const aiMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'I understand. Let me process that request...',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiMessage]);
        }, 500);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const extractCode = (content: string) => {
        const codeBlocks = content.match(/```[\s\S]*?```/g);
        if (codeBlocks && onCodeExtract) {
            const code = codeBlocks[0].replace(/```\w*\n?/g, '').replace(/```$/g, '');
            onCodeExtract(code);
            toast.success('Code extracted to preview panel');
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#0a0a0a] border-l border-white/10">
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-mono font-bold text-gray-300 uppercase tracking-wider">
                        💬 Agent Chat
                    </h3>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-gray-500 hover:text-gray-300"
                        onClick={() => setMessages([])}
                        title="Clear Chat"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {messages.map((message) => (
                    <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`
                                max-w-[80%] p-3 rounded-2lg text-sm
                                ${message.role === 'user'
                                    ? 'bg-orange-500/20 text-orange-100 rounded-br-none'
                                    : 'bg-white/5 text-gray-300 rounded-bl-none'
                                }
                            `}
                        >
                            <div className="prose prose-invert prose-sm max-w-none">
                                {message.content}
                            </div>
                            <div className="flex items-center justify-between mt-2 gap-2">
                                <span className="text-[10px] text-gray-600">
                                    {message.timestamp.toLocaleTimeString()}
                                </span>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5 text-gray-600 hover:text-gray-400"
                                        onClick={() => {
                                            navigator.clipboard.writeText(message.content);
                                            toast.success('Copied to clipboard');
                                        }}
                                    >
                                        <Copy className="w-3 h-3" />
                                    </Button>
                                    {message.content.includes('```') && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-5 w-5 text-gray-600 hover:text-gray-400"
                                            onClick={() => extractCode(message.content)}
                                        >
                                            <Code className="w-3 h-3" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
                <div className="flex gap-2">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask Agent Neo anything..."
                        className="
                            flex-1 px-3 py-2 bg-white/5 border border-white/10 
                            rounded-lg text-sm text-gray-300 placeholder:text-gray-600
                            resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/50
                            max-h-32
                        "
                        rows={2}
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="self-end h-9 w-9 p-0 bg-orange-500 hover:bg-orange-600"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
                <div className="text-[10px] text-gray-600 mt-2">
                    Press Enter to send, Shift+Enter for new line
                </div>
            </div>
        </div>
    );
}
