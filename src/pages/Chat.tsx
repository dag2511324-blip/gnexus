/**
 * G-CORE CHAT PAGE
 * 
 * The main conversational interface for the G-Core AI Advisor.
 * Features a cyberpunk/sigma aesthetic with glassmorphism effects,
 * animated gradients, and real-time AI chat capabilities.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send,
    Paperclip,
    Mic,
    MicOff,
    Menu,
    X,
    MessageSquare,
    Plus,
    Trash2,
    Copy,
    Check,
    Terminal,
    Sparkles,
    ChevronLeft,
    Volume2,
    Settings,
    MoreVertical,
    Search,
    Clock,
    Zap,
    Image as ImageIcon,
    Code2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNexusChat } from '@/hooks/useNexus';
import { AI_MODELS, type ModelKey } from '@/lib/ai';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { ImageGenerator } from '@/components/chat/ImageGenerator';
import { ConversationsPanel } from '@/components/chat/ConversationsPanel';
import { MessageActions } from '@/components/chat/MessageActions';
import { CodeCanvasEditor, type CodeBlock } from '@/components/chat/CodeCanvasEditor';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { toast } from '@/hooks/use-toast';
import type { GeneratedImage } from '@/types/image';
import * as conversationsAPI from '@/lib/api/conversations';

// =============================================================================
// TYPES
// =============================================================================

interface ChatSession {
    id: string;
    title: string;
    lastMessage: string;
    timestamp: Date;
    model: ModelKey;
}

// =============================================================================
// MOCK DATA
// =============================================================================

const INITIAL_SESSIONS: ChatSession[] = [
    {
        id: '1',
        title: 'Marketing Plan 2026',
        lastMessage: 'Here are the key strategies for Q1...',
        timestamp: new Date(Date.now() - 3600000),
        model: 'marketing',
    },
    {
        id: '2',
        title: 'Debug Login Flow',
        lastMessage: 'The authentication error is caused by...',
        timestamp: new Date(Date.now() - 7200000),
        model: 'coder',
    },
    {
        id: '3',
        title: 'Security Audit Report',
        lastMessage: 'I found 3 potential vulnerabilities...',
        timestamp: new Date(Date.now() - 86400000),
        model: 'analyst',
    },
    {
        id: '4',
        title: 'Product Launch Strategy',
        lastMessage: 'For maximum impact, consider...',
        timestamp: new Date(Date.now() - 172800000),
        model: 'planner',
    },
];

// =============================================================================
// COMPONENTS
// =============================================================================

/**
 * Typing Indicator - Three animated glowing dots
 */
const TypingIndicator = () => (
    <div className="flex items-center gap-1 px-4 py-3">
        {[0, 1, 2].map((i) => (
            <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-cyan-400"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                }}
                style={{
                    boxShadow: '0 0 10px rgba(34, 211, 238, 0.8)',
                }}
            />
        ))}
        <span className="ml-2 text-sm text-cyan-400/70 font-mono">G-CORE is thinking...</span>
    </div>
);

/**
 * Code Block with Copy functionality
 */
const CodeBlock = ({ code, language }: { code: string; language?: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group my-3 rounded-lg overflow-hidden border border-white/10">
            <div className="flex items-center justify-between px-4 py-2 bg-[#0a0a0a] border-b border-white/10">
                <span className="text-xs font-mono text-cyan-400/70">{language || 'code'}</span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="h-7 px-2 text-xs hover:bg-white/10"
                >
                    {copied ? (
                        <Check className="w-4 h-4 text-green-400" />
                    ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                    )}
                </Button>
            </div>
            <pre className="p-4 bg-[#050505] overflow-x-auto">
                <code className="text-sm font-mono text-gray-300">{code}</code>
            </pre>
        </div>
    );
};

/**
 * Message Bubble Component
 */
const MessageBubble = ({
    message,
    isUser,
    onRegenerate,
}: {
    message: { id?: string; content: string; timestamp: Date; imageUrl?: string; imagePrompt?: string; role?: string };
    isUser: boolean;
    onRegenerate?: () => void;
}) => {
    const [imageError, setImageError] = useState(false);
    // Simple markdown-like parsing for code blocks
    const parseContent = (content: string) => {
        const parts = content.split(/(```[\s\S]*?```)/g);
        return parts.map((part, i) => {
            if (part.startsWith('```')) {
                const match = part.match(/```(\w+)?\n?([\s\S]*?)```/);
                if (match) {
                    return <CodeBlock key={i} code={match[2].trim()} language={match[1]} />;
                }
            }
            // Handle inline code
            const inlineCode = part.split(/(`[^`]+`)/g);
            return (
                <span key={i}>
                    {inlineCode.map((segment, j) => {
                        if (segment.startsWith('`') && segment.endsWith('`')) {
                            return (
                                <code
                                    key={j}
                                    className="px-1.5 py-0.5 bg-white/10 rounded text-cyan-300 font-mono text-sm"
                                >
                                    {segment.slice(1, -1)}
                                </code>
                            );
                        }
                        return segment;
                    })}
                </span>
            );
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
        >
            <div
                className={`group max-w-[80%] md:max-w-[70%] ${isUser
                    ? 'bg-gray-800/80 rounded-2xl rounded-br-md'
                    : 'bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl rounded-bl-md'
                    } px-4 py-3`}
            >
                {!isUser && (
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                            <Sparkles className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-xs font-mono text-cyan-400">G-CORE</span>
                    </div>
                )}

                {/* Image Content */}
                {message.imageUrl && !imageError && (
                    <div className="mb-3">
                        <div className="relative group rounded-lg overflow-hidden border border-white/10">
                            <img
                                src={message.imageUrl}
                                alt={message.imagePrompt || 'Generated image'}
                                className="w-full h-auto"
                                loading="lazy"
                                onError={() => setImageError(true)}
                            />

                            {/* Image Caption */}
                            {message.imagePrompt && (
                                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                                    <p className="text-xs text-gray-300 line-clamp-2">{message.imagePrompt}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Text Content */}
                {message.content && (
                    <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
                        {parseContent(message.content)}
                    </div>
                )}

                {/* Message Actions */}
                <div className="flex items-center justify-between mt-2 gap-2">
                    <div className={`text-xs ${isUser ? 'text-gray-500' : 'text-gray-600'}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <MessageActions
                        messageId={message.id || ''}
                        role={message.role as 'user' | 'assistant' | 'system' || (isUser ? 'user' : 'assistant')}
                        content={message.content}
                        onRegenerate={!isUser && onRegenerate ? onRegenerate : undefined}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                </div>
            </div>
        </motion.div>
    );
};

/**
 * Sidebar Session Item
 */
const SessionItem = ({
    session,
    isActive,
    onClick,
}: {
    session: ChatSession;
    isActive: boolean;
    onClick: () => void;
}) => {
    const modelInfo = AI_MODELS[session.model];

    return (
        <motion.button
            whileHover={{ x: 4 }}
            onClick={onClick}
            className={`w-full text-left p-3 rounded-lg transition-all relative group ${isActive
                ? 'bg-white/10'
                : 'hover:bg-white/5'
                }`}
        >
            {isActive && (
                <motion.div
                    layoutId="activeSession"
                    className="absolute left-0 top-0 bottom-0 w-0.5 bg-cyan-400 rounded-full"
                    style={{ boxShadow: '0 0 10px rgba(34, 211, 238, 0.8)' }}
                />
            )}
            <div className="flex items-start gap-3">
                <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${modelInfo?.color}20` }}
                >
                    <MessageSquare
                        className="w-4 h-4"
                        style={{ color: modelInfo?.color }}
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-200 truncate">
                        {session.title}
                    </div>
                    <div className="text-xs text-gray-500 truncate mt-0.5">
                        {session.lastMessage}
                    </div>
                    <div className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(session.timestamp)}
                    </div>
                </div>
            </div>
        </motion.button>
    );
};

// =============================================================================
// UTILS
// =============================================================================

function formatTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ChatPage() {
    // Check if in agent mode
    const searchParams = new URLSearchParams(window.location.search);
    const isAgentMode = searchParams.get('mode') === 'agent';

    // State
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [sessions, setSessions] = useState<ChatSession[]>(INITIAL_SESSIONS);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [input, setInput] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [imageGeneratorOpen, setImageGeneratorOpen] = useState(false);
    const [codeCanvasOpen, setCodeCanvasOpen] = useState(false);
    const [extractedCodeBlocks, setExtractedCodeBlocks] = useState<CodeBlock[]>([]);


    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Hooks
    const {
        messages,
        sendMessage,
        clearMessages,
        loading,
        streaming,
        activeModel,
        setActiveModel,
        // Backend integration
        currentConversationId,
        conversations,
        loadingHistory,
        savingMessage,
        // Conversation management
        fetchConversationHistory,
        createNewConversation,
        loadConversation,
        deleteCurrentConversation,
        starConversation,
        archiveConversation,
        renameConversation,
    } = useNexusChat('planner');

    // Handle mouse move for gradient effect
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle send message
    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const messageContent = input.trim();
        setInput('');

        await sendMessage(messageContent);
    };

    // Handle voice recording
    const voice = useVoiceRecording({
        onTranscript: (text) => {
            // Append to input or send immediately
            setInput(prev => prev ? `${prev} ${text}` : text);
            inputRef.current?.focus();
        },
        onError: (error) => {
            console.error('Voice recording error:', error);
            toast({
                title: "Voice input failed",
                description: error,
                variant: "destructive",
            });
        },
    });

    // Update isRecording state when voice recording changes
    useEffect(() => {
        setIsRecording(voice.isRecording);
    }, [voice.isRecording]);

    // Load conversation history on mount
    useEffect(() => {
        fetchConversationHistory();
    }, [fetchConversationHistory]);

    // Get current conversation title
    const currentConversation = conversations.find(c => c.id === currentConversationId);
    const conversationTitle = currentConversation?.title || 'New Conversation';

    // Create new chat session
    const createNewSession = () => {
        clearMessages();
        setActiveSessionId(null);
        // Don't create conversation yet - will auto-create on first message
        inputRef.current?.focus();
    };

    // Handle conversation selection
    const handleSelectConversation = async (id: string) => {
        await loadConversation(id);
        setMobileMenuOpen(false);
    };

    // Handle conversation export
    const handleExportConversation = async (id: string) => {
        try {
            const conversation = await conversationsAPI.getConversation(id);
            const markdown = conversationsAPI.exportConversationAsMarkdown(conversation);
            conversationsAPI.downloadAsFile(
                markdown,
                `${conversation.title}.md`,
                'text/markdown'
            );
        } catch (error) {
            console.error('Failed to export conversation:', error);
        }
    };

    // Handle regenerate message
    const handleRegenerateMessage = useCallback(async (messageIndex: number) => {
        // Find the user message that triggered this AI response
        const aiMessage = messages[messageIndex];
        if (!aiMessage || aiMessage.role !== 'assistant') return;

        // Find the previous user message
        const userMessage = messages[messageIndex - 1];
        if (!userMessage || userMessage.role !== 'user') return;

        // Remove the AI message and regenerate
        const newMessages = messages.slice(0, messageIndex);
        // Temporarily update messages to show loading
        // Then send the user's message again to regenerate response
        await sendMessage(userMessage.content);
    }, [messages, sendMessage]);

    // Extract code blocks from messages
    const extractCodeFromMessages = useCallback(() => {
        const codeBlocks: CodeBlock[] = [];

        // Look through all assistant messages for code blocks
        messages.forEach((message) => {
            if (message.role === 'assistant') {
                // Match code blocks in format: ```language\ncode\n```
                const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
                let match;

                while ((match = codeBlockRegex.exec(message.content)) !== null) {
                    const language = match[1] || 'plaintext';
                    const code = match[2].trim();

                    codeBlocks.push({
                        language: language.toLowerCase(),
                        code,
                        filename: `code.${language.toLowerCase()}`,
                    });
                }
            }
        });

        setExtractedCodeBlocks(codeBlocks);

        // Auto-open code canvas if we have code blocks and it's not already open
        if (codeBlocks.length > 0 && !codeCanvasOpen) {
            setCodeCanvasOpen(true);
        }
    }, [messages, codeCanvasOpen]);

    // Extract code whenever messages change
    useEffect(() => {
        extractCodeFromMessages();
    }, [extractCodeFromMessages]);

    // Handle generated image
    const handleImageGenerated = useCallback((image: GeneratedImage) => {
        // Close the generator
        setImageGeneratorOpen(false);

        // Add the image as a message (note: this is a simplified approach)
        // In production, you'd integrate this properly with your messaging system
        console.log('Image generated:', image);

        // For now, you could send a message with the image URL
        // This would require extending the useNexusChat hook to support image messages
        // Or manually injecting it into messages array
    }, []);

    return (
        <>
            <SEO
                title="G-CORE Chat | G-NEXUS AI Platform"
                description="Interact with G-CORE, the advanced AI advisor powered by cutting-edge language models."
            />

            {isAgentMode ? (
                // Agent Mode - Coming Soon
                <>
                    <Navbar />
                    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center relative overflow-hidden">
                        {/* Animated background elements */}
                        <div className="absolute inset-0 overflow-hidden">
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    rotate: [0, 90, 0],
                                }}
                                transition={{
                                    duration: 20,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                                className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"
                            />
                            <motion.div
                                animate={{
                                    scale: [1.2, 1, 1.2],
                                    rotate: [90, 0, 90],
                                }}
                                transition={{
                                    duration: 15,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                                className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl"
                            />
                        </div>

                        {/* Coming Soon Text */}
                        <div className="relative z-10 text-center px-4">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <motion.h1
                                    className="text-7xl md:text-9xl font-bold mb-6 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 bg-clip-text text-transparent"
                                    animate={{
                                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                                    }}
                                    transition={{
                                        duration: 5,
                                        repeat: Infinity,
                                        ease: "linear"
                                    }}
                                    style={{
                                        backgroundSize: '200% 200%',
                                    }}
                                >
                                    Coming Soon
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="text-xl md:text-2xl text-gray-400 font-light"
                                >
                                    AI Agent is under development
                                </motion.p>
                            </motion.div>

                            {/* Pulsing dots */}
                            <motion.div
                                className="flex justify-center gap-2 mt-8"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                {[0, 1, 2].map((i) => (
                                    <motion.div
                                        key={i}
                                        className="w-3 h-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-full"
                                        animate={{
                                            scale: [1, 1.5, 1],
                                            opacity: [0.5, 1, 0.5],
                                        }}
                                        transition={{
                                            duration: 1.5,
                                            repeat: Infinity,
                                            delay: i * 0.2,
                                        }}
                                    />
                                ))}
                            </motion.div>
                        </div>
                    </div>
                </>
            ) : (
                // Normal Chat Mode
                <div className="min-h-screen bg-[#050505] flex flex-col">
                    <Navbar />

                    {/* Animated Background Gradient */}
                    <div
                        className="fixed inset-0 pointer-events-none z-0"
                        style={{
                            background: `
              radial-gradient(
                600px circle at ${mousePosition.x}px ${mousePosition.y}px,
                rgba(6, 182, 212, 0.15),
                transparent 40%
              ),
              radial-gradient(
                800px circle at ${mousePosition.x}px ${mousePosition.y}px,
                rgba(59, 130, 246, 0.1),
                transparent 50%
              )
            `,
                        }}
                    />

                    {/* Main Content */}
                    <main className="flex-1 flex relative z-10 pt-20">
                        {/* Sidebar - Conversations Panel */}
                        <AnimatePresence mode="wait">
                            {(sidebarOpen || mobileMenuOpen) && (
                                <motion.aside
                                    initial={{ x: -280, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -280, opacity: 0 }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                    className={`
                  ${mobileMenuOpen ? 'fixed left-0 top-20 z-50 pt-0' : 'relative hidden lg:block'}
                  h-[calc(100vh-5rem)]
                `}
                                >
                                    <ConversationsPanel
                                        conversations={conversations}
                                        currentConversationId={currentConversationId}
                                        loading={loadingHistory}
                                        onSelectConversation={handleSelectConversation}
                                        onNewConversation={createNewSession}
                                        onStarConversation={starConversation}
                                        onArchiveConversation={archiveConversation}
                                        onDeleteConversation={deleteCurrentConversation}
                                        onRenameConversation={renameConversation}
                                        onExportConversation={handleExportConversation}
                                        isCollapsed={!sidebarOpen && !mobileMenuOpen}
                                        onToggleCollapse={() => mobileMenuOpen ? setMobileMenuOpen(false) : setSidebarOpen(!sidebarOpen)}
                                    />
                                </motion.aside>
                            )}
                        </AnimatePresence>

                        {/* Mobile Overlay */}
                        {mobileMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setMobileMenuOpen(false)}
                                className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                            />
                        )}

                        {/* Chat Area */}
                        <div className="flex-1 flex flex-col h-[calc(100vh-5rem)]">
                            {/* Chat Header */}
                            <header className="h-16 border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-xl flex items-center px-4 gap-4 shrink-0">
                                {/* Mobile Menu Toggle */}
                                <button
                                    onClick={() => setMobileMenuOpen(true)}
                                    className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <Menu className="w-5 h-5 text-gray-400" />
                                </button>

                                {/* Desktop Sidebar Toggle */}
                                <button
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    className="hidden lg:flex p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <ChevronLeft
                                        className={`w-5 h-5 text-gray-400 transition-transform ${sidebarOpen ? '' : 'rotate-180'
                                            }`}
                                    />
                                </button>

                                {/* Title */}
                                <div className="flex-1 flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5 text-cyan-400" />
                                        <h1 className="font-mono font-bold text-gray-200 truncate">
                                            {conversationTitle}
                                        </h1>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <motion.div
                                            animate={{
                                                scale: [1, 1.2, 1],
                                                opacity: [0.5, 1, 0.5],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                            }}
                                            className="w-2 h-2 rounded-full bg-green-500"
                                            style={{ boxShadow: '0 0 8px rgba(34, 197, 94, 0.8)' }}
                                        />
                                        <span className="text-xs font-mono text-green-400">ONLINE</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    {/* Model Selector */}
                                    <div className="relative hidden md:block">
                                        <select
                                            value={activeModel}
                                            onChange={(e) => setActiveModel(e.target.value as ModelKey)}
                                            className="appearance-none bg-white/5 border border-white/10 rounded-lg pl-3 pr-8 py-1.5 text-sm text-gray-200 hover:bg-white/10 focus:outline-none focus:border-cyan-500/50 cursor-pointer transition-colors"
                                            title="Select AI Model"
                                        >
                                            {Object.entries(AI_MODELS).map(([key, model]) => (
                                                <option key={key} value={key} className="bg-[#1a1a1a] text-gray-200">
                                                    {model.name} {model.id.includes(':free') ? '(Free)' : ''}
                                                </option>
                                            ))}
                                        </select>
                                        <Sparkles className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400 pointer-events-none" />
                                    </div>

                                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-200">
                                        <Volume2 className="w-5 h-5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-200">
                                        <MoreVertical className="w-5 h-5" />
                                    </Button>
                                </div>
                            </header>

                            {/* Chat Content Area */}
                            <div className="flex flex-1 overflow-hidden">
                                {/* Chat Messages Area - 25% when canvas open, 100% when closed */}
                                <div className={`flex flex-col transition-all duration-300 ${codeCanvasOpen ? 'w-1/4' : 'w-full'
                                    }`}>
                                    <ScrollArea className="flex-1">
                                        <div className="p-4 space-y-6">
                                            {/* Welcome Message */}
                                            {messages.length === 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="text-center py-12"
                                                >
                                                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
                                                        <Zap className="w-10 h-10 text-cyan-400" />
                                                    </div>
                                                    <h2 className="text-2xl font-bold text-gray-200 mb-2">
                                                        Welcome to G-CORE
                                                    </h2>
                                                    <motion.p
                                                        className="text-gray-300 max-w-2xl mx-auto mb-8 text-xl md:text-2xl font-medium"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ duration: 0.5, delay: 0.3 }}
                                                    >
                                                        {["I'm G AI by Dagmawi Amare, CEO of Gnexus. Ready to assist with your tasks!"].map((text, i) => (
                                                            <motion.span
                                                                key={i}
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                transition={{
                                                                    duration: 0.05,
                                                                    delay: 0.5 + (i * 0.03)
                                                                }}
                                                            >
                                                                {text.split('').map((char, charIndex) => (
                                                                    <motion.span
                                                                        key={charIndex}
                                                                        initial={{ opacity: 0 }}
                                                                        animate={{ opacity: 1 }}
                                                                        transition={{
                                                                            duration: 0.05,
                                                                            delay: 0.5 + (charIndex * 0.03)
                                                                        }}
                                                                    >
                                                                        {char}
                                                                    </motion.span>
                                                                ))}
                                                            </motion.span>
                                                        ))}
                                                    </motion.p>

                                                    {/* Quick Actions */}
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                                                        {[
                                                            { label: 'Generate Code', model: 'coder' as ModelKey },
                                                            { label: 'Marketing Copy', model: 'marketing' as ModelKey },
                                                            { label: 'Strategic Plan', model: 'planner' as ModelKey },
                                                            { label: 'Security Audit', model: 'analyst' as ModelKey },
                                                        ].map((action) => (
                                                            <button
                                                                key={action.model}
                                                                onClick={() => setActiveModel(action.model)}
                                                                className={`p-3 rounded-lg border transition-all text-left ${activeModel === action.model
                                                                    ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400'
                                                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'
                                                                    }`}
                                                            >
                                                                <div className="font-medium text-sm">{action.label}</div>
                                                                <div className="text-xs opacity-60 mt-0.5">
                                                                    {AI_MODELS[action.model].name}
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}

                                            {/* Messages */}
                                            <AnimatePresence mode="popLayout">
                                                {messages.map((message, index) => (
                                                    <MessageBubble
                                                        key={message.id}
                                                        message={message}
                                                        isUser={message.role === 'user'}
                                                        onRegenerate={message.role === 'assistant' ? () => handleRegenerateMessage(index) : undefined}
                                                    />
                                                ))}
                                            </AnimatePresence>

                                            {/* Typing Indicator */}
                                            {(loading || streaming) && <TypingIndicator />}

                                            <div ref={messagesEndRef} />
                                        </div>
                                    </ScrollArea>

                                    {/* Input Zone */}
                                    <div className="p-4 border-t border-white/5 bg-[#0a0a0a]/50 backdrop-blur-xl shrink-0">
                                        <div className="max-w-4xl mx-auto">
                                            {/* Code Available Indicator - Show when code exists but canvas is closed */}
                                            {!codeCanvasOpen && extractedCodeBlocks.length > 0 && (
                                                <div className="mb-2 flex items-center justify-between">
                                                    <motion.button
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        onClick={() => setCodeCanvasOpen(true)}
                                                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/50 rounded-lg transition-all"
                                                    >
                                                        <Code2 className="w-3 h-3 text-cyan-400" />
                                                        <span className="text-xs font-mono text-gray-300">
                                                            Open Code ({extractedCodeBlocks.length} file{extractedCodeBlocks.length > 1 ? 's' : ''})
                                                        </span>
                                                    </motion.button>
                                                </div>
                                            )}

                                            {/* Editing Indicator - Show when code canvas is open */}
                                            {codeCanvasOpen && extractedCodeBlocks.length > 0 && (
                                                <div className="mb-2 flex items-center gap-2 text-xs text-cyan-400">
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="flex items-center gap-2 px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-lg"
                                                    >
                                                        <Terminal className="w-3 h-3" />
                                                        <span className="font-mono">
                                                            Editing: {extractedCodeBlocks[0].filename || 'code'}
                                                        </span>
                                                    </motion.div>
                                                </div>
                                            )}

                                            <div className="relative flex items-center gap-2">
                                                {/* Attach Button */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="shrink-0 text-gray-400 hover:text-gray-200 hover:bg-white/10"
                                                >
                                                    <Paperclip className="w-5 h-5" />
                                                </Button>

                                                {/* Input Field */}
                                                <div className="flex-1 relative">
                                                    <input
                                                        ref={inputRef}
                                                        type="text"
                                                        value={input}
                                                        onChange={(e) => setInput(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                                                        placeholder={codeCanvasOpen ? "Ask about this code..." : "Message G-CORE..."}
                                                        disabled={loading}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors disabled:opacity-50"
                                                    />

                                                    {/* Model Indicator */}
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                                        <span
                                                            className="text-xs font-mono px-2 py-0.5 rounded-full"
                                                            style={{
                                                                backgroundColor: `${AI_MODELS[activeModel].color}20`,
                                                                color: AI_MODELS[activeModel].color,
                                                            }}
                                                        >
                                                            {AI_MODELS[activeModel].name.split('-')[0]}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Voice Button */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={voice.toggleRecording}
                                                    disabled={!voice.isSupported || voice.isProcessing}
                                                    className={`shrink-0 ${isRecording
                                                        ? 'text-red-500 hover:text-red-400 bg-red-500/10 animate-pulse'
                                                        : 'text-gray-400 hover:text-gray-200 hover:bg-white/10'
                                                        }`}
                                                    title={isRecording ? "Stop recording" : "Start voice input"}
                                                >
                                                    {isRecording ? (
                                                        <MicOff className="w-5 h-5" />
                                                    ) : (
                                                        <Mic className="w-5 h-5" />
                                                    )}
                                                </Button>

                                                {/* Image Generation Button */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setImageGeneratorOpen(true)}
                                                    className="shrink-0 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                                                    title="Generate Image"
                                                >
                                                    <ImageIcon className="w-5 h-5" />
                                                </Button>

                                                {/* Send Button */}
                                                <Button
                                                    onClick={handleSend}
                                                    disabled={!input.trim() || loading}
                                                    className="shrink-0 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Send className="w-5 h-5" />
                                                </Button>
                                            </div>

                                            {/* Disclaimer */}
                                            <p className="text-xs text-center text-gray-600 mt-3">
                                                G-CORE can make mistakes. Verify important information.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Code Canvas Editor - Side panel (75% width) */}
                                {codeCanvasOpen && (
                                    <CodeCanvasEditor
                                        codeBlocks={extractedCodeBlocks}
                                        isVisible={codeCanvasOpen}
                                        onClose={() => setCodeCanvasOpen(false)}
                                    />
                                )}
                            </div>
                        </div>
                    </main>

                    {/* Image Generator Modal */}
                    <ImageGenerator
                        isOpen={imageGeneratorOpen}
                        onClose={() => setImageGeneratorOpen(false)}
                        onImageGenerated={handleImageGenerated}
                    />
                </div>
            )}
        </>
    );
}
