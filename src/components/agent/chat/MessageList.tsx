/**
 * Message List - Scrollable chat messages
 */

import { useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import type { Message } from '../ChatContainer';
import { Loader2 } from 'lucide-react';

interface MessageListProps {
    messages: Message[];
    isStreaming?: boolean;
}

export function MessageList({ messages, isStreaming }: MessageListProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="h-full overflow-y-auto">
            <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
                {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                ))}

                {isStreaming && (
                    <div className="flex items-center gap-2 text-gray-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Thinking...</span>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>
        </div>
    );
}
