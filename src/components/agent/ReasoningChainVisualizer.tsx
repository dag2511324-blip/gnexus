/**
 * Reasoning Chain Visualizer
 * Chain-of-thought visualization with branching and merging
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, GitBranch, GitMerge, TrendingUp, AlertCircle } from 'lucide-react';

export interface ReasoningStep {
    id: string;
    content: string;
    confidence: number;
    timestamp: Date;
    branches?: ReasoningChain[];
}

export interface ReasoningChain {
    id: string;
    name: string;
    steps: ReasoningStep[];
    color: string;
    merged?: boolean;
}

interface ReasoningChainVisualizerProps {
    chains: ReasoningChain[];
}

export function ReasoningChainVisualizer({ chains }: ReasoningChainVisualizerProps) {
    const [selectedChain, setSelectedChain] = useState<string | null>(null);

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 90) return '#06FFA5'; // Green
        if (confidence >= 70) return '#FFD700'; // Yellow
        if (confidence >= 50) return '#FF6B35'; // Orange
        return '#EF4444'; // Red
    };

    return (
        <div className="w-full h-full bg-[#0a0a0a] rounded-xl border border-white/10 p-6">
            {/* Header */}
            <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-orange-400" />
                    Reasoning Chains
                </h3>
                <p className="text-sm text-gray-400">
                    Visualizing multi-path thinking process
                </p>
            </div>

            {/* Chains */}
            <div className="space-y-6">
                {chains.map((chain, chainIndex) => (
                    <motion.div
                        key={chain.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: chainIndex * 0.1 }}
                        className="relative"
                    >
                        {/* Chain Header */}
                        <div
                            className="flex items-center gap-3 mb-3 cursor-pointer"
                            onClick={() => setSelectedChain(selectedChain === chain.id ? null : chain.id)}
                        >
                            <div
                                className="w-1 h-12 rounded-full"
                                style={{ backgroundColor: chain.color }}
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-white">{chain.name}</span>
                                    {chain.merged && (
                                        <GitMerge className="w-4 h-4 text-green-400" />
                                    )}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {chain.steps.length} steps • Avg confidence: {
                                        Math.round(chain.steps.reduce((sum, s) => sum + s.confidence, 0) / chain.steps.length)
                                    }%
                                </div>
                            </div>
                            <TrendingUp className="w-5 h-5 text-gray-600" />
                        </div>

                        {/* Chain Steps */}
                        {(selectedChain === chain.id || selectedChain === null) && (
                            <div className="ml-6 space-y-3">
                                {chain.steps.map((step, stepIndex) => (
                                    <motion.div
                                        key={step.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: stepIndex * 0.05 }}
                                        className="relative pl-8"
                                    >
                                        {/* Vertical line */}
                                        {stepIndex < chain.steps.length - 1 && (
                                            <div
                                                className="absolute left-2 top-8 w-0.5 h-full"
                                                style={{ backgroundColor: `${chain.color}40` }}
                                            />
                                        )}

                                        {/* Step dot */}
                                        <div
                                            className="absolute left-0 top-3 w-4 h-4 rounded-full border-2"
                                            style={{
                                                borderColor: chain.color,
                                                backgroundColor: '#0a0a0a'
                                            }}
                                        />

                                        {/* Step content */}
                                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                            <div className="flex items-start justify-between mb-2">
                                                <span className="text-sm text-gray-300">
                                                    {step.content}
                                                </span>
                                                <div
                                                    className="px-2 py-1 rounded text-xs font-mono font-bold ml-2"
                                                    style={{
                                                        backgroundColor: `${getConfidenceColor(step.confidence)}20`,
                                                        color: getConfidenceColor(step.confidence)
                                                    }}
                                                >
                                                    {step.confidence}%
                                                </div>
                                            </div>

                                            {/* Branches */}
                                            {step.branches && step.branches.length > 0 && (
                                                <div className="mt-3 pl-4 border-l-2 border-white/10">
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                                        <GitBranch className="w-3 h-3" />
                                                        {step.branches.length} branches
                                                    </div>
                                                    {step.branches.map(branch => (
                                                        <div
                                                            key={branch.id}
                                                            className="text-xs text-gray-400 mb-1"
                                                        >
                                                            → {branch.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Summary */}
            {chains.length > 1 && (
                <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold text-orange-400">
                                {chains.length}
                            </div>
                            <div className="text-xs text-gray-500">Parallel Chains</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-green-400">
                                {chains.reduce((sum, c) => sum + c.steps.length, 0)}
                            </div>
                            <div className="text-xs text-gray-500">Total Steps</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-blue-400">
                                {Math.round(
                                    chains.reduce((sum, c) =>
                                        sum + c.steps.reduce((s, step) => s + step.confidence, 0) / c.steps.length
                                        , 0) / chains.length
                                )}%
                            </div>
                            <div className="text-xs text-gray-500">Avg Confidence</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Example usage with sample data
export const SAMPLE_CHAINS: ReasoningChain[] = [
    {
        id: 'chain-1',
        name: 'Technical Scaling',
        color: '#00D9FF',
        steps: [
            {
                id: 's1',
                content: 'Database optimization needed',
                confidence: 92,
                timestamp: new Date(),
            },
            {
                id: 's2',
                content: 'Implement read replicas',
                confidence: 88,
                timestamp: new Date(),
            },
            {
                id: 's3',
                content: 'Add caching layer (Redis)',
                confidence: 95,
                timestamp: new Date(),
            },
        ],
    },
    {
        id: 'chain-2',
        name: 'Team Scaling',
        color: '#9D4EDD',
        steps: [
            {
                id: 's4',
                content: 'Hire 3 senior engineers',
                confidence: 75,
                timestamp: new Date(),
            },
            {
                id: 's5',
                content: 'Restructure into 2 teams',
                confidence: 82,
                timestamp: new Date(),
            },
        ],
    },
    {
        id: 'chain-3',
        name: 'Cost Analysis',
        color: '#FFD700',
        merged: true,
        steps: [
            {
                id: 's6',
                content: 'Infrastructure: $5k/month',
                confidence: 90,
                timestamp: new Date(),
            },
            {
                id: 's7',
                content: 'Team: $50k/month',
                confidence: 85,
                timestamp: new Date(),
            },
            {
                id: 's8',
                content: 'ROI: 6 month break-even',
                confidence: 78,
                timestamp: new Date(),
            },
        ],
    },
];
