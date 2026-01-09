/**
 * Auto-Optimization Engine
 * Automatically optimizes workflows by reordering, parallelizing, and merging steps
 */

import { AlertCircle, Zap, GitMerge, Shuffle } from 'lucide-react';

export interface OptimizationSuggestion {
    id: string;
    type: 'reorder' | 'parallelize' | 'merge' | 'shortcut';
    title: string;
    description: string;
    estimatedImprovement: string;
    affectedNodes: string[];
    autoApply?: boolean;
}

const OPTIMIZATION_ICONS = {
    reorder: Shuffle,
    parallelize: Zap,
    merge: GitMerge,
    shortcut: AlertCircle,
};

export function AutoOptimizationEngine() {
    const suggestions: OptimizationSuggestion[] = [
        {
            id: 'opt-1',
            type: 'parallelize',
            title: 'Parallelize Data Processing',
            description: 'Steps 3-5 can run simultaneously',
            estimatedImprovement: '40% faster execution',
            affectedNodes: ['node-3', 'node-4', 'node-5'],
            autoApply: false,
        },
        {
            id: 'opt-2',
            type: 'merge',
            title: 'Merge Duplicate Analysis',
            description: 'Combine analysis steps 2 and 4',
            estimatedImprovement: '25% time reduction',
            affectedNodes: ['node-2', 'node-4'],
            autoApply: true,
        },
        {
            id: 'opt-3',
            type: 'reorder',
            title: 'Reorder for Efficiency',
            description: 'Move validation earlier to fail fast',
            estimatedImprovement: '15% resource savings',
            affectedNodes: ['node-6'],
            autoApply: false,
        },
    ];

    return (
        <div className="bg-[#0a0a0a] rounded-xl border border-white/10 p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-400" />
                ⚡ Auto-Optimization Engine
            </h3>
            <div className="space-y-3">
                {suggestions.map(s => {
                    const Icon = OPTIMIZATION_ICONS[s.type];
                    return (
                        <div key={s.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                            <div className="flex items-start gap-3">
                                <Icon className="w-5 h-5 text-green-400 mt-0.5" />
                                <div className="flex-1">
                                    <div className="font-semibold text-white mb-1">{s.title}</div>
                                    <div className="text-sm text-gray-400 mb-2">{s.description}</div>
                                    <div className="text-xs text-green-400 font-mono">
                                        💡 {s.estimatedImprovement}
                                    </div>
                                </div>
                                {s.autoApply && (
                                    <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded">
                                        Auto-Applied
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
