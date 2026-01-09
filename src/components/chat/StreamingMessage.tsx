/**
 * Streaming Message Component
 * Displays AI message with streaming animation
 */

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StreamingMessageProps {
    content: string;
    isStreaming?: boolean;
}

export function StreamingMessage({ content, isStreaming }: StreamingMessageProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
                components={{
                    code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        const code = String(children).replace(/\n$/, '');

                        return !inline && match ? (
                            <div className="relative group">
                                <SyntaxHighlighter
                                    style={oneDark}
                                    language={match[1]}
                                    PreTag="div"
                                    className="rounded-lg"
                                    {...props}
                                >
                                    {code}
                                </SyntaxHighlighter>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigator.clipboard.writeText(code)}
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Copy className="w-3 h-3" />
                                </Button>
                            </div>
                        ) : (
                            <code className={className} {...props}>
                                {children}
                            </code>
                        );
                    },
                }}
            >
                {content}
            </ReactMarkdown>

            {isStreaming && (
                <span className="inline-block w-2 h-4 bg-orange-500 ml-1 animate-pulse" />
            )}

            {!isStreaming && content && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                        className="h-7 text-gray-400 hover:text-white"
                    >
                        {copied ? (
                            <><Check className="w-3 h-3 mr-1" /> Copied!</>
                        ) : (
                            <><Copy className="w-3 h-3 mr-1" /> Copy</>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
