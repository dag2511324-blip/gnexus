/**
 * NodeChain Component
 * Animated SVG connection lines between flow nodes
 */

import { motion } from 'framer-motion';
import type { NodeType } from './FlowNode';

interface NodeChainProps {
    fromType: NodeType;
    toType: NodeType;
    active?: boolean;
}

const NODE_COLORS = {
    research: '#06b6d4',
    analysis: '#8b5cf6',
    generation: '#f97316',
    review: '#10b981',
};

export function NodeChain({ fromType, toType, active = true }: NodeChainProps) {
    const fromColor = NODE_COLORS[fromType];
    const toColor = NODE_COLORS[toType];

    return (
        <div className="w-full max-w-4xl mx-auto h-24 relative flex items-center justify-center">
            <svg
                width="2"
                height="96"
                viewBox="0 0 2 96"
                className="absolute"
                style={{ left: '24px' }}
            >
                <defs>
                    <linearGradient id={`gradient-${fromType}-${toType}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={fromColor} stopOpacity="0.5" />
                        <stop offset="100%" stopColor={toColor} stopOpacity="0.5" />
                    </linearGradient>
                </defs>

                {/* Connection line */}
                <motion.line
                    x1="1"
                    y1="0"
                    x2="1"
                    y2="96"
                    stroke={`url(#gradient-${fromType}-${toType})`}
                    strokeWidth="2"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                />

                {/* Animated pulse */}
                {active && (
                    <motion.circle
                        cx="1"
                        cy="0"
                        r="3"
                        fill={toColor}
                        initial={{ cy: 0, opacity: 0 }}
                        animate={{ cy: 96, opacity: [0, 1, 1, 0] }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                )}
            </svg>

            {/* Arrow indicator */}
            <motion.div
                className="absolute left-[18px] flex items-center justify-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 0.5, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <div
                    className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px]"
                    style={{ borderTopColor: toColor }}
                />
            </motion.div>

            {/* Connection label */}
            <motion.div
                className="absolute left-16 text-xs font-mono text-gray-600 uppercase tracking-widest"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                style={{ color: toColor }}
            >
                ↓ Flow to {toType}
            </motion.div>
        </div>
    );
}
