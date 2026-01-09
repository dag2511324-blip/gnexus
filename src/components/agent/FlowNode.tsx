/**
 * FlowNode Component
 * Visual card representing a single logic node in Agent Neo's thinking process
 */

import { motion } from 'framer-motion';
import { Copy, Loader2, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState } from 'react';

export type NodeType = 'research' | 'analysis' | 'generation' | 'review';
export type NodeStatus = 'idle' | 'processing' | 'completed' | 'failed';

export interface FlowNodeData {
    id: string;
    type: NodeType;
    title: string;
    emoji: string;
    content: string;
    status: NodeStatus;
    timestamp?: Date;
    metadata?: {
        input?: string;
        output?: string;
        decision?: string;
    };
}

interface FlowNodeProps {
    node: FlowNodeData;
    index: number;
}

const NODE_CONFIG = {
    research: {
        color: '#06b6d4', // Cyan
        bgColor: 'bg-cyan-500/10',
        borderColor: 'border-cyan-500/20',
        textColor: 'text-cyan-400',
    },
    analysis: {
        color: '#8b5cf6', // Purple
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/20',
        textColor: 'text-purple-400',
    },
    generation: {
        color: '#f97316', // Orange
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/20',
        textColor: 'text-orange-400',
    },
    review: {
        color: '#10b981', // Green
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/20',
        textColor: 'text-green-400',
    },
};

export function FlowNode({ node, index }: FlowNodeProps) {
    const [copied, setCopied] = useState(false);
    const config = NODE_CONFIG[node.type];

    const handleCopy = () => {
        navigator.clipboard.writeText(node.content);
        setCopied(true);
        toast.success('Content copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    const renderStatus = () => {
        switch (node.status) {
            case 'processing':
                return (
                    <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" style={{ color: config.color }} />
                        <span className="text-xs font-mono uppercase tracking-widest" style={{ color: config.color }}>
                            Processing...
                        </span>
                    </div>
                );
            case 'completed':
                return (
                    <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">
                            Completed
                        </span>
                    </div>
                );
            case 'failed':
                return (
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <span className="text-xs font-mono text-red-400 uppercase tracking-widest">
                            Failed
                        </span>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.3, duration: 0.5, ease: 'easeOut' }}
            className="w-full max-w-4xl mx-auto"
        >
            {/* Blockquote-style container for node */}
            <div className="relative">
                {/* Left accent border */}
                <div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-full"
                    style={{ backgroundColor: config.color }}
                />

                {/* Card content */}
                <div
                    className={`
                        ml-6 p-8 rounded-2xl backdrop-blur-xl border-2 transition-all duration-300
                        bg-[#0a0a0a]/90 ${config.borderColor}
                    `}
                    style={{
                        boxShadow: node.status === 'processing'
                            ? `0 0 40px ${config.color}30`
                            : `0 0 20px ${config.color}10`,
                    }}
                >
                    {/* Node Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                            {/* Emoji Icon */}
                            <div
                                className={`w-12 h-12 rounded-xl ${config.bgColor} flex items-center justify-center text-2xl`}
                            >
                                {node.emoji}
                            </div>

                            {/* Title */}
                            <div>
                                <h3 className={`text-sm font-mono uppercase tracking-widest font-bold ${config.textColor}`}>
                                    {node.title}
                                </h3>
                                {node.type === 'analysis' && node.metadata?.input && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Connection: Based on {node.metadata.input}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Status & Actions */}
                        <div className="flex items-center gap-3">
                            {renderStatus()}
                            {node.status === 'completed' && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleCopy}
                                    className="h-10 w-10 bg-white/5 rounded-xl hover:bg-white/10"
                                >
                                    {copied ? (
                                        <Check className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <Copy className="w-4 h-4 text-gray-400" />
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Node Content */}
                    <div className="space-y-4">
                        {node.status === 'processing' && !node.content ? (
                            // Loading skeleton
                            <div className="space-y-3">
                                <div className="h-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded animate-pulse" />
                                <div className="h-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded animate-pulse w-3/4" />
                                <div className="h-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded animate-pulse w-1/2" />
                            </div>
                        ) : (
                            <>
                                {/* Input metadata */}
                                {node.metadata?.input && (
                                    <div className="text-sm text-gray-400 italic border-l-2 border-gray-700 pl-4">
                                        <span className="text-gray-500 font-mono text-xs">Input:</span> {node.metadata.input}
                                    </div>
                                )}

                                {/* Main content */}
                                <div className="prose prose-invert max-w-none">
                                    <div className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                                        {node.content}
                                    </div>
                                </div>

                                {/* Decision/Output metadata */}
                                {node.metadata?.decision && (
                                    <div className={`text-sm ${config.textColor} font-medium border-l-2 pl-4 mt-4`}
                                        style={{ borderColor: config.color }}
                                    >
                                        <span className="font-mono text-xs uppercase tracking-wider">Decision:</span> {node.metadata.decision}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    {node.timestamp && node.status === 'completed' && (
                        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                            <div className="text-xs font-mono text-gray-600 uppercase tracking-widest">
                                Node {index + 1}
                            </div>
                            <div className="text-xs font-mono text-gray-600">
                                {node.timestamp.toLocaleTimeString()}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
