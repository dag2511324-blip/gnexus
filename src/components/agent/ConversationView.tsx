/**
 * Conversation View - Active chat interface
 */

import { useEffect, useRef } from 'react';
import { Send, Copy, ThumbsUp, ThumbsDown, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface ConversationViewProps {
    messages: Message[];
    input: string;
    setInput: (value: string) => void;
    onSubmit: () => void;
    isLoading: boolean;
    mode: 'auto' | 'fast';
    setMode: (mode: 'auto' | 'fast') => void;
}

export function ConversationView({
    messages,
    input,
    setInput,
    onSubmit,
    isLoading,
    mode,
    setMode,
}: ConversationViewProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex-1 flex flex-col h-full">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="max-w-3xl mx-auto space-y-6">
                    <AnimatePresence>
                        {messages.map((message, index) => (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'
                                    }`}
                            >
                                {/* AI Avatar */}
                                {message.role === 'assistant' && (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                                        <Sparkles className="w-4 h-4 text-white" />
                                    </div>
                                )}

                                {/* Message Content */}
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === 'user'
                                            ? 'bg-white/10 border border-white/20'
                                            : 'bg-[#2a2a2a] border border-white/10'
                                        }`}
                                >
                                    {message.role === 'assistant' ? (
                                        <div className="prose prose-invert prose-sm max-w-none">
                                            <ReactMarkdown
                                                components={{
                                                    code({ node, inline, className, children, ...props }) {
                                                        const match = /language-(\w+)/.exec(className || '');
                                                        return !inline && match ? (
                                                            <SyntaxHighlighter
                                                                style={oneDark}
                                                                language={match[1]}
                                                                PreTag="div"
                                                                {...props}
                                                            >
                                                                {String(children).replace(/\n$/, '')}
                                                            </SyntaxHighlighter>
                                                        ) : (
                                                            <code className={className} {...props}>
                                                                {children}
                                                            </code>
                                                        );
                                                    },
                                                }}
                                            >
                                                {message.content}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        <div className="text-white whitespace-pre-wrap">{message.content}</div>
                                    )}

                                    {/* Timestamp */}
                                    <div className="text-xs text-gray-500 mt-2">
                                        {message.timestamp.toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </div>

                                    {/* AI Message Actions */}
                                    {message.role === 'assistant' && (
                                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 px-2 text-gray-400 hover:text-white"
                                            >
                                                <Copy className="w-3 h-3 mr-1" />
                                                Copy
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 px-2 text-gray-400 hover:text-white"
                                            >
                                                <ThumbsUp className="w-3 h-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 px-2 text-gray-400 hover:text-white"
                                            >
                                                <ThumbsDown className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* User Avatar */}
                                {message.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0 border border-orange-500/30">
                                        <span className="text-orange-500 text-sm font-medium">U</span>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Loading Indicator */}
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex gap-4"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <div className="bg-[#2a2a2a] rounded-2xl px-4 py-3 border border-white/10">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-sm">Thinking...</span>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-white/10 bg-[#0a0a0a] px-4 py-4">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-[#2a2a2a] rounded-2xl p-3 border border-white/10 hover:border-white/20 transition-all">
                        <div className="flex items-end gap-2">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Continue the conversation..."
                                className="flex-1 bg-transparent text-white placeholder-gray-500 resize-none outline-none text-sm max-h-32"
                                rows={1}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        onSubmit();
                                    }
                                }}
                                onInput={(e) => {
                                    e.currentTarget.style.height = 'auto';
                                    e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                                }}
                            />

                            {/* Mode Toggle */}
                            <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                                <button
                                    onClick={() => setMode('auto')}
                                    className={`px-2 py-1 rounded text-xs transition ${mode === 'auto' ? 'bg-white/10 text-white' : 'text-gray-400'
                                        }`}
                                >
                                    Auto
                                </button>
                                <button
                                    onClick={() => setMode('fast')}
                                    className={`px-2 py-1 rounded text-xs transition ${mode === 'fast' ? 'bg-white/10 text-white' : 'text-gray-400'
                                        }`}
                                >
                                    Fast
                                </button>
                            </div>

                            <Button
                                onClick={onSubmit}
                                disabled={!input.trim() || isLoading}
                                size="icon"
                                className="bg-white text-black hover:bg-gray-200 disabled:opacity-50"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
