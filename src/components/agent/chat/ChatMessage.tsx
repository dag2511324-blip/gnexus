/**
 * Chat Message - Individual message bubble
 * Supports markdown, code blocks, attachments
 */

import { useState } from 'react';
import { Copy, Check, RotateCcw, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Message } from '../ChatContainer';

interface ChatMessageProps {
    message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
    const [copied, setCopied] = useState(false);
    const isUser = message.role === 'user';

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Avatar */}
            <div className={`
                w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                ${isUser ? 'bg-orange-500/20' : 'bg-white/5'}
            `}>
                {isUser ? (
                    <User className="w-5 h-5 text-orange-500" />
                ) : (
                    <Bot className="w-5 h-5 text-white" />
                )}
            </div>

            {/* Message Content */}
            <div className={`flex-1 ${isUser ? 'text-right' : 'text-left'}`}>
                <div className={`
                    inline-block max-w-[85%] rounded-2xl px-4 py-3
                    ${isUser
                        ? 'bg-orange-500/20 border border-orange-500/30'
                        : 'bg-white/5 border border-white/10'
                    }
                `}>
                    {/* Attachments */}
                    {message.attachments?.map((attachment, idx) => (
                        <div key={idx} className="mb-2">
                            {attachment.type === 'image' && (
                                <img
                                    src={attachment.url}
                                    alt={attachment.name}
                                    className="rounded-lg max-w-xs"
                                />
                            )}
                        </div>
                    ))}

                    {/* Message Text with Markdown */}
                    {!isUser ? (
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
                        <div className="text-white whitespace-pre-wrap">
                            {message.content}
                        </div>
                    )}

                    {/* Tool Calls */}
                    {message.tools?.map((tool) => (
                        <div
                            key={tool.id}
                            className="mt-2 p-2 bg-white/5 rounded-lg border border-white/10"
                        >
                            <div className="flex items-center gap-2 text-xs">
                                <span className="text-gray-400">🔧 {tool.name}</span>
                                <span className={`
                                    ${tool.status === 'success' ? 'text-green-400' : ''}
                                    ${tool.status === 'error' ? 'text-red-400' : ''}
                                    ${tool.status === 'running' ? 'text-yellow-400' : ''}
                                `}>
                                    {tool.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Message Actions */}
                {!isUser && (
                    <div className="flex items-center gap-1 mt-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCopy}
                            className="h-7 px-2 text-gray-400 hover:text-white"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-3 h-3 mr-1" />
                                    <span className="text-xs">Copied!</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-3 h-3 mr-1" />
                                    <span className="text-xs">Copy</span>
                                </>
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-gray-400 hover:text-white"
                        >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            <span className="text-xs">Regenerate</span>
                        </Button>
                    </div>
                )}

                {/* Timestamp */}
                <div className="text-xs text-gray-500 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </div>
            </div>
        </div>
    );
}
