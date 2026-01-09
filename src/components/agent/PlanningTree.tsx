/**
 * Planning Tree - Hierarchical Task Planning System
 * Multi-level plan builder with progress tracking
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight,
    ChevronDown,
    Circle,
    CheckCircle2,
    Clock,
    Pause,
    Plus,
    Trash2,
    GripVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface PlanNode {
    id: string;
    title: string;
    type: 'goal' | 'task';
    status: 'pending' | 'in-progress' | 'completed' | 'blocked';
    timeEstimate?: string;
    children?: PlanNode[];
    expanded?: boolean;
}

const statusConfig = {
    pending: { icon: Pause, color: '#6B7280', label: 'Pending' },
    'in-progress': { icon: Clock, color: '#F97316', label: 'In Progress' },
    completed: { icon: CheckCircle2, color: '#06FFA5', label: 'Completed' },
    blocked: { icon: Circle, color: '#EF4444', label: 'Blocked' },
};

interface TreeNodeProps {
    node: PlanNode;
    level: number;
    onToggle: (id: string) => void;
    onStatusChange: (id: string, status: PlanNode['status']) => void;
    onAdd: (parentId: string) => void;
    onDelete: (id: string) => void;
}

function TreeNode({ node, level, onToggle, onStatusChange, onAdd, onDelete }: TreeNodeProps) {
    const hasChildren = node.children && node.children.length > 0;
    const StatusIcon = statusConfig[node.status].icon;
    const isGoal = node.type === 'goal';

    return (
        <div>
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg
                    hover:bg-white/5 transition-colors group
                `}
                style={{ marginLeft: `${level * 24}px` }}
            >
                {/* Expand/Collapse */}
                <button
                    onClick={() => onToggle(node.id)}
                    className="flex-shrink-0 w-4 h-4"
                >
                    {hasChildren ? (
                        node.expanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        )
                    ) : (
                        <div className="w-4 h-4" />
                    )}
                </button>

                {/* Status Icon */}
                <button
                    onClick={() => {
                        const statuses: PlanNode['status'][] = ['pending', 'in-progress', 'completed', 'blocked'];
                        const currentIndex = statuses.indexOf(node.status);
                        const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                        onStatusChange(node.id, nextStatus);
                    }}
                    className="flex-shrink-0"
                >
                    <StatusIcon
                        className="w-4 h-4"
                        style={{ color: statusConfig[node.status].color }}
                    />
                </button>

                {/* Icon */}
                <span className="text-lg">
                    {isGoal ? '🎯' : '⚡'}
                </span>

                {/* Title */}
                <span className={`
                    flex-1 text-sm
                    ${node.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-300'}
                `}>
                    {node.title}
                </span>

                {/* Time Estimate */}
                {node.timeEstimate && (
                    <span className="text-xs text-gray-600 font-mono">
                        {node.timeEstimate}
                    </span>
                )}

                {/* Actions (visible on hover) */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-gray-600 hover:text-gray-300"
                        onClick={() => onAdd(node.id)}
                    >
                        <Plus className="w-3 h-3" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-gray-600 hover:text-red-400"
                        onClick={() => onDelete(node.id)}
                    >
                        <Trash2 className="w-3 h-3" />
                    </Button>
                    <GripVertical className="w-4 h-4 text-gray-600 cursor-move" />
                </div>
            </motion.div>

            {/* Children */}
            <AnimatePresence>
                {node.expanded && hasChildren && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                    >
                        {node.children!.map((child) => (
                            <TreeNode
                                key={child.id}
                                node={child}
                                level={level + 1}
                                onToggle={onToggle}
                                onStatusChange={onStatusChange}
                                onAdd={onAdd}
                                onDelete={onDelete}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function PlanningTree() {
    const [plan, setPlan] = useState<PlanNode>({
        id: '1',
        title: 'Build E-Commerce Platform',
        type: 'goal',
        status: 'in-progress',
        expanded: true,
        children: [
            {
                id: '1-1',
                title: 'Frontend Development',
                type: 'goal',
                status: 'in-progress',
                timeEstimate: '2 weeks',
                expanded: true,
                children: [
                    { id: '1-1-1', title: 'Product catalog page', type: 'task', status: 'completed', timeEstimate: '2 days' },
                    { id: '1-1-2', title: 'Shopping cart', type: 'task', status: 'in-progress', timeEstimate: '3 days' },
                    { id: '1-1-3', title: 'Checkout flow', type: 'task', status: 'pending', timeEstimate: '4 days' },
                ],
            },
            {
                id: '1-2',
                title: 'Backend API',
                type: 'goal',
                status: 'pending',
                timeEstimate: '3 weeks',
                expanded: false,
                children: [
                    { id: '1-2-1', title: 'Database schema', type: 'task', status: 'pending', timeEstimate: '1 day' },
                    { id: '1-2-2', title: 'REST API endpoints', type: 'task', status: 'pending', timeEstimate: '5 days' },
                ],
            },
            {
                id: '1-3',
                title: 'Payment Integration',
                type: 'goal',
                status: 'pending',
                timeEstimate: '1 week',
                expanded: false,
            },
        ],
    });

    const toggleNode = (id: string) => {
        const updateNode = (node: PlanNode): PlanNode => {
            if (node.id === id) {
                return { ...node, expanded: !node.expanded };
            }
            if (node.children) {
                return { ...node, children: node.children.map(updateNode) };
            }
            return node;
        };
        setPlan(updateNode(plan));
    };

    const changeStatus = (id: string, status: PlanNode['status']) => {
        const updateNode = (node: PlanNode): PlanNode => {
            if (node.id === id) {
                return { ...node, status };
            }
            if (node.children) {
                return { ...node, children: node.children.map(updateNode) };
            }
            return node;
        };
        setPlan(updateNode(plan));
    };

    const addChild = (parentId: string) => {
        // Simplified - would need proper implementation
        console.log('Add child to:', parentId);
    };

    const deleteNode = (id: string) => {
        // Simplified - would need proper implementation
        console.log('Delete node:', id);
    };

    // Calculate progress
    const calculateProgress = (node: PlanNode): { completed: number; total: number } => {
        let completed = 0;
        let total = 0;

        const count = (n: PlanNode) => {
            if (n.type === 'task') {
                total++;
                if (n.status === 'completed') completed++;
            }
            if (n.children) {
                n.children.forEach(count);
            }
        };

        count(node);
        return { completed, total };
    };

    const { completed, total } = calculateProgress(plan);
    const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <div className="w-full h-full bg-[#0a0a0a] rounded-xl border border-white/10 p-4">
            {/* Header */}
            <div className="mb-4 pb-4 border-b border-white/10">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                        📋 Planning Tree
                    </h3>
                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Goal
                    </Button>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Overall Progress</span>
                        <span className="text-orange-400 font-mono font-bold">{progressPercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
                        />
                    </div>
                    <div className="text-xs text-gray-600">
                        {completed} of {total} tasks completed
                    </div>
                </div>
            </div>

            {/* Tree */}
            <div className="overflow-y-auto max-h-[500px]">
                <TreeNode
                    node={plan}
                    level={0}
                    onToggle={toggleNode}
                    onStatusChange={changeStatus}
                    onAdd={addChild}
                    onDelete={deleteNode}
                />
            </div>
        </div>
    );
}
