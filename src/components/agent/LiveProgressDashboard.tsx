/**
 * Live Progress Dashboard
 * Real-time monitoring of AI agent execution
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock, CheckCircle2, AlertCircle, Loader2, Zap } from 'lucide-react';

export interface ExecutionStage {
    id: string;
    name: string;
    status: 'waiting' | 'running' | 'complete' | 'error';
    startTime?: Date;
    endTime?: Date;
    duration?: number;
    progress?: number;
}

export interface AgentActivity {
    agentName: string;
    status: 'active' | 'idle' | 'error';
    currentTask?: string;
}

interface LiveProgressDashboardProps {
    stages: ExecutionStage[];
    activeAgents: AgentActivity[];
    queuedTasks: number;
}

export function LiveProgressDashboard({ stages, activeAgents, queuedTasks }: LiveProgressDashboardProps) {
    const [elapsedTime, setElapsedTime] = useState(0);

    const runningStage = stages.find(s => s.status === 'running');
    const completedStages = stages.filter(s => s.status === 'complete').length;
    const totalProgress = Math.round((completedStages / stages.length) * 100);

    useEffect(() => {
        if (runningStage) {
            const interval = setInterval(() => {
                setElapsedTime(prev => prev + 0.1);
            }, 100);
            return () => clearInterval(interval);
        }
    }, [runningStage]);

    const getStatusIcon = (status: ExecutionStage['status']) => {
        switch (status) {
            case 'complete': return <CheckCircle2 className="w-5 h-5 text-green-400" />;
            case 'running': return <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />;
            case 'error': return <AlertCircle className="w-5 h-5 text-red-400" />;
            default: return <Clock className="w-5 h-5 text-gray-600" />;
        }
    };

    return (
        <div className="w-full bg-[#0a0a0a] rounded-xl border border-white/10 p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-orange-400" />
                        📊 Execution Dashboard
                    </h3>
                    <div className="text-sm text-gray-400">
                        {new Date().toLocaleTimeString()}
                    </div>
                </div>

                {/* Overall Progress */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Overall Progress</span>
                        <span className="text-orange-400 font-mono font-bold text-lg">
                            {totalProgress}%
                        </span>
                    </div>
                    <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${totalProgress}%` }}
                            transition={{ duration: 0.5 }}
                            className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
                        >
                            <div className="w-full h-full bg-gradient-to-r from-white/20 to-transparent animate-pulse" />
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Stages */}
            <div className="space-y-3 mb-6">
                {stages.map((stage, index) => (
                    <motion.div
                        key={stage.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`
                            flex items-center gap-3 p-3 rounded-lg border
                            ${stage.status === 'running'
                                ? 'bg-orange-500/10 border-orange-500/30'
                                : stage.status === 'complete'
                                    ? 'bg-green-500/10 border-green-500/30'
                                    : stage.status === 'error'
                                        ? 'bg-red-500/10 border-red-500/30'
                                        : 'bg-white/5 border-white/10'
                            }
                        `}
                    >
                        {/* Icon */}
                        {getStatusIcon(stage.status)}

                        {/* Content */}
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-white">
                                    Stage {index + 1}: {stage.name}
                                </span>
                                {stage.duration && (
                                    <span className="text-xs text-gray-500 font-mono">
                                        {stage.duration.toFixed(1)}s
                                    </span>
                                )}
                            </div>

                            {/* Progress bar for running stage */}
                            {stage.status === 'running' && stage.progress !== undefined && (
                                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${stage.progress}%` }}
                                        className="h-full bg-orange-400"
                                    />
                                </div>
                            )}

                            {/* Status text */}
                            <span className="text-xs text-gray-500">
                                {stage.status === 'complete' && ' Complete'}
                                {stage.status === 'running' && ` Running... (${elapsedTime.toFixed(1)}s)`}
                                {stage.status === 'waiting' && ' Waiting'}
                                {stage.status === 'error' && ' Error occurred'}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Agent Activity */}
            <div className="border-t border-white/10 pt-4 mb-4">
                <h4 className="text-sm font-semibold text-gray-400 mb-3">Active Agents</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {activeAgents.map((agent, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/5 rounded-lg p-3 border border-white/10"
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <div className={`w-2 h-2 rounded-full ${agent.status === 'active' ? 'bg-green-400 animate-pulse' :
                                        agent.status === 'error' ? 'bg-red-400' :
                                            'bg-gray-600'
                                    }`} />
                                <span className="text-xs font-medium text-white">
                                    {agent.agentName}
                                </span>
                            </div>
                            {agent.currentTask && (
                                <span className="text-[10px] text-gray-500 line-clamp-1">
                                    {agent.currentTask}
                                </span>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center border-t border-white/10 pt-4">
                <div>
                    <div className="text-2xl font-bold text-green-400">
                        {completedStages}
                    </div>
                    <div className="text-xs text-gray-500">Complete</div>
                </div>
                <div>
                    <div className="text-2xl font-bold text-orange-400">
                        {activeAgents.filter(a => a.status === 'active').length}
                    </div>
                    <div className="text-xs text-gray-500">Active</div>
                </div>
                <div>
                    <div className="text-2xl font-bold text-blue-400">
                        {queuedTasks}
                    </div>
                    <div className="text-xs text-gray-500">Queued</div>
                </div>
            </div>
        </div>
    );
}

// Sample data for demonstration
export const SAMPLE_EXECUTION: {
    stages: ExecutionStage[];
    activeAgents: AgentActivity[];
    queuedTasks: number;
} = {
    stages: [
        {
            id: 'stage-1',
            name: 'Requirements Analysis',
            status: 'complete',
            startTime: new Date(Date.now() - 10000),
            endTime: new Date(Date.now() - 8000),
            duration: 2.3,
        },
        {
            id: 'stage-2',
            name: 'Architecture Design',
            status: 'complete',
            startTime: new Date(Date.now() - 8000),
            endTime: new Date(Date.now() - 4000),
            duration: 4.1,
        },
        {
            id: 'stage-3',
            name: 'Code Generation',
            status: 'running',
            startTime: new Date(Date.now() - 4000),
            progress: 65,
        },
        {
            id: 'stage-4',
            name: 'Security Review',
            status: 'waiting',
        },
        {
            id: 'stage-5',
            name: 'Optimization',
            status: 'waiting',
        },
    ],
    activeAgents: [
        { agentName: 'Planner AI', status: 'idle' },
        { agentName: 'Devstral Coder', status: 'active', currentTask: 'Generating React components...' },
        { agentName: 'Analyst AI', status: 'idle' },
    ],
    queuedTasks: 2,
};
