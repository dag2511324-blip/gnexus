/**
 * Chat Container - Main chat interface wrapper
 * Minimax AI-style design
 */

import { useState } from 'react';
import { TopBar } from './chat/TopBar';
import { MessageList } from './chat/MessageList';
import { ChatInput } from './chat/ChatInput';

export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    streaming?: boolean;
    tools?: ToolCall[];
    attachments?: Attachment[];
}

export interface ToolCall {
    id: string;
    name: string;
    args: Record<string, any>;
    result?: any;
    status: 'running' | 'success' | 'error';
}

export interface Attachment {
    type: 'image' | 'file';
    name: string;
    url: string;
    size?: number;
}

export function ChatContainer() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Hello! I\'m your AI assistant. How can I help you today?',
            timestamp: new Date(),
        }
    ]);
    const [input, setInput] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);

    const handleSend = async (content: string, attachments?: Attachment[]) => {
        if (!content.trim() && !attachments?.length) return;

        // Add user message
        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date(),
            attachments,
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsStreaming(true);

        // Simulate AI response (replace with actual API call)
        setTimeout(() => {
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `I received your message: "${content}". This is a demo response. In production, this will connect to your AI backend.`,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiMessage]);
            setIsStreaming(false);
        }, 1000);
    };

    return (
        <div className="flex flex-col h-screen bg-[#0a0a0a]">
            {/* Top Bar */}
            <TopBar />

            {/* Messages Area */}
            <div className="flex-1 overflow-hidden">
                <MessageList
                    messages={messages}
                    isStreaming={isStreaming}
                />
            </div>

            {/* Input Area */}
            <ChatInput
                value={input}
                onChange={setInput}
                onSend={handleSend}
                disabled={isStreaming}
            />
        </div>
    );
}
