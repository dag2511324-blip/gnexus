/**
 * Top Bar - Agent selector and controls
 */

import { useState } from 'react';
import { ChevronDown, Settings, History, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MODELS = [
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', icon: '🧠' },
    { id: 'claude-3.5', name: 'Claude 3.5 Sonnet', icon: '🤖' },
    { id: 'gemini-pro', name: 'Gemini 1.5 Pro', icon: '✨' },
    { id: 'llama-3', name: 'Llama 3', icon: '🦙' },
];

export function TopBar() {
    const [selectedModel, setSelectedModel] = useState(MODELS[0]);
    const [showDropdown, setShowDropdown] = useState(false);

    return (
        <div className="h-16 border-b border-white/10 bg-[#0a0a0a] flex items-center justify-between px-6">
            {/* Agent Selector */}
            <div className="relative">
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition"
                >
                    <span className="text-xl">{selectedModel.icon}</span>
                    <span className="font-medium text-white">{selectedModel.name}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {/* Dropdown */}
                {showDropdown && (
                    <div className="absolute top-full mt-2 w-64 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50">
                        {MODELS.map((model) => (
                            <button
                                key={model.id}
                                onClick={() => {
                                    setSelectedModel(model);
                                    setShowDropdown(false);
                                }}
                                className={`
                                    w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition
                                    ${selectedModel.id === model.id ? 'bg-white/10' : ''}
                                `}
                            >
                                <span className="text-2xl">{model.icon}</span>
                                <div className="flex-1 text-left">
                                    <div className="font-medium text-white">{model.name}</div>
                                    <div className="text-xs text-gray-500">
                                        {model.id === 'gpt-4-turbo' && 'Best for complex reasoning'}
                                        {model.id === 'claude-3.5' && 'Best for long context'}
                                        {model.id === 'gemini-pro' && 'Best for multi-modal'}
                                        {model.id === 'llama-3' && 'Fast and efficient'}
                                    </div>
                                </div>
                                {selectedModel.id === model.id && (
                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-white"
                    title="History"
                >
                    <History className="w-5 h-5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-white"
                    title="Settings"
                >
                    <Settings className="w-5 h-5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-white"
                    title="More"
                >
                    <MoreVertical className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
}
