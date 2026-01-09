/**
 * Enhanced Minimax-Style Main Content with Working Functionality
 */

import { useState } from 'react';
import { Paperclip, Mic, Sparkles, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { ConversationView } from './ConversationView';

const TOOLS = [
    { id: 'schedules', label: 'Schedules', icon: '📅', color: '#f97316', prompt: 'Help me manage my schedule' },
    { id: 'websites', label: 'Websites', icon: '🌐', color: '#10b981', prompt: 'Build a website for me' },
    { id: 'research', label: 'Research', icon: '📊', color: '#8b5cf6', prompt: 'Research this topic for me' },
    { id: 'videos', label: 'Videos', icon: '🎬', color: '#ef4444', prompt: 'Create a video script' },
    { id: 'more', label: 'More', icon: '⋯', color: '#6b7280', prompt: 'Show me more options' },
];

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export function MainContent() {
    const [input, setInput] = useState('');
    const [mode, setMode] = useState<'auto' | 'fast'>('auto');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);

    const handleSubmit = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setHasStarted(true);
        setIsLoading(true);

        // Simulate AI response (replace with actual API call)
        setTimeout(() => {
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `I understand you want help with: "${userMessage.content}". Let me assist you with that.\n\nHere's what I can do:\n1. Analyze your request\n2. Create a detailed plan\n3. Execute the solution\n\nWould you like me to proceed?`,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiMessage]);
            setIsLoading(false);
        }, 1500);
    };

    const handleToolClick = (tool: typeof TOOLS[0]) => {
        setInput(tool.prompt);
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    if (hasStarted) {
        return (
            <ConversationView
                messages={messages}
                input={input}
                setInput={setInput}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                mode={mode}
                setMode={setMode}
            />
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center p-8 relative"
        >
            {/* Centered Content */}
            <div className="w-full max-w-3xl">
                {/* Greeting with Animation */}
                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-3xl md:text-4xl font-semibold text-white text-center mb-12"
                >
                    {getGreeting()}, how can I help you today?
                </motion.h1>

                {/* Enhanced Input Box */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-[#2a2a2a] rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all shadow-2xl"
                >
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Enter your task and submit it to G-NEXUS Agent..."
                        className="w-full bg-transparent text-white placeholder-gray-500 resize-none outline-none text-base leading-relaxed"
                        rows={6}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                e.preventDefault();
                                handleSubmit();
                            }
                        }}
                    />

                    {/* Input Footer */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                        {/* Left: Attachment Buttons */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                                title="Attach file"
                            >
                                <Paperclip className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                                title="Voice input"
                            >
                                <Mic className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Right: Mode + Submit */}
                        <div className="flex items-center gap-2">
                            {/* Mode Selector */}
                            <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                                <button
                                    onClick={() => setMode('auto')}
                                    className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${mode === 'auto'
                                            ? 'bg-white/10 text-white shadow-lg'
                                            : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    Auto
                                </button>
                                <button
                                    onClick={() => setMode('fast')}
                                    className={`px-3 py-1.5 rounded text-sm font-medium transition-all flex items-center gap-1 ${mode === 'fast'
                                            ? 'bg-white/10 text-white shadow-lg'
                                            : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    <Sparkles className="w-3 h-3" />
                                    Fast
                                </button>
                            </div>

                            {/* Submit Button */}
                            <Button
                                onClick={handleSubmit}
                                disabled={!input.trim() || isLoading}
                                className="bg-white text-black hover:bg-gray-200 font-medium px-6 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Start
                                        <Send className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* Tool Badges with Animation */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-center gap-3 mt-6 flex-wrap"
                >
                    {TOOLS.map((tool, index) => (
                        <motion.button
                            key={tool.id}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleToolClick(tool)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all"
                        >
                            <span className="text-lg">{tool.icon}</span>
                            <span className="text-sm text-white font-medium">{tool.label}</span>
                        </motion.button>
                    ))}
                </motion.div>

                {/* Hint Text */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center mt-8 text-sm text-gray-500"
                >
                    Press Ctrl + Enter to submit • Choose a tool badge for quick start
                </motion.div>
            </div>

            {/* Enhanced Promo Card */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-8 left-8 right-8 max-w-md mx-auto"
            >
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-xl p-4 border border-white/10 flex items-center gap-4 hover:border-white/20 transition-all shadow-2xl">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex-shrink-0 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-white font-semibold text-sm">AI Agent Ready</h3>
                        <p className="text-gray-400 text-xs mt-1">
                            Watch it turn your ideas into working solutions instantly.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-white/20 text-white hover:bg-white/10 transition-all"
                    >
                        Explore
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    );
}
