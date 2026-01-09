/**
 * ProcessingPipeline Component
 * Orchestrates the complete flow visualization for Agent Neo
 */

import { useState, useEffect } from 'react';
import { FlowNode, type FlowNodeData, type NodeType } from './FlowNode';
import { NodeChain } from './NodeChain';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface ProcessingPipelineProps {
    prompt: string;
    response: string;
    isProcessing: boolean;
    error?: string;
    agentName?: string;
}

export function ProcessingPipeline({
    prompt,
    response,
    isProcessing,
    error,
    agentName = 'Agent Neo',
}: ProcessingPipelineProps) {
    const [nodes, setNodes] = useState<FlowNodeData[]>([]);

    useEffect(() => {
        if (!response && !isProcessing) {
            setNodes([]);
            return;
        }

        // Parse the response into nodes
        const parsedNodes = parseResponseIntoNodes(response, isProcessing, error);
        setNodes(parsedNodes);
    }, [response, isProcessing, error]);

    return (
        <div className="w-full py-12 space-y-0">
            {/* Pipeline Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-4">
                    <Sparkles className="w-4 h-4 text-orange-400" />
                    <span className="text-xs font-mono text-orange-400 uppercase tracking-widest font-bold">
                        Flow Mode Active
                    </span>
                </div>
                <h2 className="text-2xl font-bold text-white font-mono">
                    {agentName} • Node-Based Thinking
                </h2>
                <p className="text-gray-500 text-sm mt-2 max-w-2xl mx-auto">
                    Watch the AI break down complex tasks into interconnected logic nodes
                </p>
            </motion.div>

            {/* Node Flow */}
            <AnimatePresence mode="sync">
                {nodes.map((node, index) => (
                    <div key={node.id}>
                        {/* Connection line (except before first node) */}
                        {index > 0 && (
                            <NodeChain
                                fromType={nodes[index - 1].type}
                                toType={node.type}
                                active={node.status === 'processing' || node.status === 'completed'}
                            />
                        )}

                        {/* Flow node */}
                        <FlowNode node={node} index={index} />
                    </div>
                ))}
            </AnimatePresence>

            {/* Error state */}
            {error && nodes.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-4xl mx-auto p-6 rounded-2xl bg-red-500/10 border border-red-500/20"
                >
                    <p className="text-red-400 text-center">{error}</p>
                </motion.div>
            )}
        </div>
    );
}

/**
 * Parse AI response into structured flow nodes
 * Supports both structured format and automatic parsing
 */
function parseResponseIntoNodes(
    response: string,
    isProcessing: boolean,
    error?: string
): FlowNodeData[] {
    if (error) {
        return [
            {
                id: 'error-node',
                type: 'review',
                title: 'ERROR',
                emoji: '⚠️',
                content: error,
                status: 'failed',
                timestamp: new Date(),
            },
        ];
    }

    // If processing with no response yet, show initial research node
    if (isProcessing && !response) {
        return [
            {
                id: 'node-1',
                type: 'research',
                title: 'NODE 1: RESEARCH & DATA',
                emoji: '🔍',
                content: '',
                status: 'processing',
            },
        ];
    }

    const nodes: FlowNodeData[] = [];

    // Try to parse structured format first
    const nodeRegex = /\[NODE \d+: ([^\]]+)\]\s*([^🔍🧠🎨⚖️💻\[\n]*)?/gi;
    const matches = Array.from(response.matchAll(nodeRegex));

    if (matches.length > 0) {
        // Structured format detected
        matches.forEach((match, index) => {
            const title = match[1].trim();
            const nodeType = determineNodeType(title, index);
            const emoji = getEmojiForType(nodeType);

            // Extract content between this node and the next
            const startIdx = match.index! + match[0].length;
            const nextMatch = matches[index + 1];
            const endIdx = nextMatch ? nextMatch.index! : response.length;
            const content = response.substring(startIdx, endIdx).trim();

            nodes.push({
                id: `node-${index + 1}`,
                type: nodeType,
                title: `NODE ${index + 1}: ${title.toUpperCase()}`,
                emoji,
                content,
                status: isProcessing && index === matches.length - 1 ? 'processing' : 'completed',
                timestamp: new Date(),
            });
        });
    } else {
        // Automatic parsing - split into logical sections
        const sections = splitIntoSections(response);
        sections.forEach((section, index) => {
            const nodeType = getNodeTypeByIndex(index);
            nodes.push({
                id: `node-${index + 1}`,
                type: nodeType,
                title: `NODE ${index + 1}: ${getTitleForType(nodeType)}`.toUpperCase(),
                emoji: getEmojiForType(nodeType),
                content: section,
                status: isProcessing && index === sections.length - 1 ? 'processing' : 'completed',
                timestamp: new Date(),
            });
        });
    }

    return nodes;
}

function determineNodeType(title: string, index: number): NodeType {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('research') || lowerTitle.includes('data') || lowerTitle.includes('scan')) {
        return 'research';
    }
    if (lowerTitle.includes('analys') || lowerTitle.includes('strateg') || lowerTitle.includes('reason')) {
        return 'analysis';
    }
    if (lowerTitle.includes('generat') || lowerTitle.includes('asset') || lowerTitle.includes('code') || lowerTitle.includes('design')) {
        return 'generation';
    }
    if (lowerTitle.includes('review') || lowerTitle.includes('refine') || lowerTitle.includes('critique')) {
        return 'review';
    }
    return getNodeTypeByIndex(index);
}

function getNodeTypeByIndex(index: number): NodeType {
    const types: NodeType[] = ['research', 'analysis', 'generation', 'review'];
    return types[index % 4];
}

function getEmojiForType(type: NodeType): string {
    const emojiMap = {
        research: '🔍',
        analysis: '🧠',
        generation: '🎨',
        review: '⚖️',
    };
    return emojiMap[type];
}

function getTitleForType(type: NodeType): string {
    const titleMap = {
        research: 'Research & Data',
        analysis: 'Strategic Analysis',
        generation: 'Asset Generation',
        review: 'Review & Refinement',
    };
    return titleMap[type];
}

function splitIntoSections(text: string): string[] {
    // If text is short, return as single generation node
    if (text.length < 500) {
        return [text];
    }

    // Try to split by paragraphs
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);

    if (paragraphs.length >= 4) {
        // Return first 4 paragraphs as separate nodes
        return paragraphs.slice(0, 4);
    } else if (paragraphs.length >= 2) {
        // Create 4 nodes from available paragraphs
        return [
            paragraphs[0],
            paragraphs[1] || '',
            paragraphs.slice(2, -1).join('\n\n'),
            paragraphs[paragraphs.length - 1] || '',
        ].filter(s => s.trim());
    } else {
        // Single long response - just show as generation
        return [text];
    }
}
