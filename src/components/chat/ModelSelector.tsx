/**
 * Model Selector Component
 */

import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AVAILABLE_MODELS, type ModelInfo } from '@/lib/chat-api';

interface ModelSelectorProps {
    selectedModel: string;
    onModelChange: (modelId: string) => void;
}

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);

    const selected = AVAILABLE_MODELS.find(m => m.id === selectedModel) || AVAILABLE_MODELS[0];

    return (
        <div className="relative">
            <Button
                variant="outline"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full sm:w-64 justify-between bg-white/5 border-white/10 hover:bg-white/10"
            >
                <div className="flex items-center gap-2 text-left">
                    <span className="font-medium text-white">{selected.name}</span>
                    <span className="text-xs text-gray-500">{selected.provider}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
            </Button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full mt-2 w-full sm:w-96 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto">
                        {AVAILABLE_MODELS.map((model) => (
                            <button
                                key={model.id}
                                onClick={() => {
                                    onModelChange(model.id);
                                    setIsOpen(false);
                                }}
                                className="w-full px-4 py-3 hover:bg-white/5 transition-colors flex items-start gap-3"
                            >
                                <div className="flex-1 text-left">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-white">{model.name}</span>
                                        {model.id === selectedModel && (
                                            <Check className="w-4 h-4 text-green-500" />
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {model.provider} • {model.contextWindow} context
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        {model.description}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
