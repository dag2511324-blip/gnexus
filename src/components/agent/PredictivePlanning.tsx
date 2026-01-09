/**
 * Predictive Planning System  
 * AI-powered prediction of bottlenecks, risks, and optimization opportunities
 */

import { AlertTriangle, TrendingUp, Zap, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export type PredictionType = 'bottleneck' | 'risk' | 'opportunity' | 'dependency';

export interface Prediction {
    id: string;
    type: PredictionType;
    title: string;
    description: string;
    confidence: number;
    impact: 'low' | 'medium' | 'high';
    nodeId?: string;
    suggestion?: string;
}

const PREDICTION_CONFIG = {
    bottleneck: {
        icon: AlertTriangle,
        color: '#FF6B35',
        bgColor: 'rgba(255, 107, 53, 0.1)',
        label: 'Bottleneck',
    },
    risk: {
        icon: AlertCircle,
        color: '#EF4444',
        bgColor: 'rgba(239, 68, 68, 0.1)',
        label: 'Risk',
    },
    opportunity: {
        icon: Zap,
        color: '#06FFA5',
        bgColor: 'rgba(6, 255, 165, 0.1)',
        label: 'Opportunity',
    },
    dependency: {
        icon: TrendingUp,
        color: '#00D9FF',
        bgColor: 'rgba(0, 217, 255, 0.1)',
        label: 'Dependency',
    },
};

interface PredictivePlanningProps {
    predictions: Prediction[];
}

export function PredictivePlanning({ predictions }: PredictivePlanningProps) {
    const getImpactBadge = (impact: string) => {
        const colors = {
            low: 'bg-blue-500/20 text-blue-400',
            medium: 'bg-yellow-500/20 text-yellow-400',
            high: 'bg-red-500/20 text-red-400',
        };
        return colors[impact as keyof typeof colors];
    };

    const sortedPredictions = [...predictions].sort((a, b) => {
        const impactOrder = { high: 3, medium: 2, low: 1 };
        return impactOrder[b.impact] - impactOrder[a.impact];
    });

    return (
        <div className="w-full bg-[#0a0a0a] rounded-xl border border-white/10 p-6">
            {/* Header */}
            <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-2">
                    🔮 Predictive Planning
                </h3>
                <p className="text-sm text-gray-400">
                    AI-powered insights to optimize your workflow
                </p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-3 mb-6">
                {Object.entries(PREDICTION_CONFIG).map(([type, config]) => {
                    const count = predictions.filter(p => p.type === type).length;
                    const Icon = config.icon;

                    return (
                        <div
                            key={type}
                            className="p-3 rounded-lg border border-white/10"
                            style={{ backgroundColor: config.bgColor }}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <Icon className="w-4 h-4" style={{ color: config.color }} />
                                <span className="text-2xl font-bold" style={{ color: config.color }}>
                                    {count}
                                </span>
                            </div>
                            <div className="text-xs text-gray-500">{config.label}s</div>
                        </div>
                    );
                })}
            </div>

            {/* Predictions List */}
            <div className="space-y-3">
                {sortedPredictions.map((prediction, index) => {
                    const config = PREDICTION_CONFIG[prediction.type];
                    const Icon = config.icon;

                    return (
                        <motion.div
                            key={prediction.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 rounded-lg border border-white/10"
                            style={{ backgroundColor: config.bgColor }}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Icon className="w-5 h-5" style={{ color: config.color }} />
                                    <span className="font-semibold text-white">
                                        {prediction.title}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getImpactBadge(prediction.impact)}`}>
                                        {prediction.impact.toUpperCase()}
                                    </span>
                                    <span className="text-xs font-mono text-gray-500">
                                        {prediction.confidence}%
                                    </span>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-gray-300 mb-3">
                                {prediction.description}
                            </p>

                            {/* Suggestion */}
                            {prediction.suggestion && (
                                <div className="p-2 rounded bg-white/5 border border-white/10">
                                    <div className="text-xs text-gray-400 mb-1">💡 Suggestion:</div>
                                    <div className="text-sm text-gray-300">
                                        {prediction.suggestion}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    );
                })}

                {predictions.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <Zap className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No predictions available</p>
                        <p className="text-sm mt-1">AI will analyze your workflow shortly</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Sample predictions for demonstration
export const SAMPLE_PREDICTIONS: Prediction[] = [
    {
        id: 'pred-1',
        type: 'bottleneck',
        title: 'Database Query Performance',
        description: 'The user data query may take 2x longer than estimated due to large dataset size',
        confidence: 87,
        impact: 'high',
        nodeId: 'node-3',
        suggestion: 'Add database indexing on user_id column and implement pagination',
    },
    {
        id: 'pred-2',
        type: 'risk',
        title: 'API Rate Limiting',
        description: 'High probability of hitting OpenRouter rate limits during peak execution',
        confidence: 92,
        impact: 'medium',
        suggestion: 'Implement exponential backoff and request queuing',
    },
    {
        id: 'pred-3',
        type: 'opportunity',
        title: 'Parallelization Possible',
        description: 'Steps 3-5 can be executed in parallel for 40% speed improvement',
        confidence: 95,
        impact: 'high',
        suggestion: 'Refactor to use Promise.all() for parallel execution',
    },
    {
        id: 'pred-4',
        type: 'dependency',
        title: 'Blocked Task Detected',
        description: 'Task B cannot start until Task A completes data processing',
        confidence: 100,
        impact: 'medium',
        nodeId: 'node-5',
        suggestion: 'Consider streaming data to unblock Task B earlier',
    },
];
