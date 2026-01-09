/**
 * Thought Graph - Flowith-style Visual Thinking System
 * Visualize AI reasoning as an interactive node graph
 */

import { useCallback, useState } from 'react';
import ReactFlow, {
    Node,
    Edge,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    MiniMap,
    Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import { Brain, Lightbulb, Search, Target, Zap, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Thought node types
export type ThoughtNodeType =
    | 'hypothesis'   // 💡 Initial ideas
    | 'research'     // 🔍 Information gathering
    | 'analysis'     // 🧠 Deep analysis
    | 'decision'     // ⚖️ Decision points
    | 'action'       // ⚡ Execution steps
    | 'validation'   // ✅ Quality checks
    | 'reflection';  // 🔄 Self-critique

export interface ThoughtNodeData {
    label: string;
    type: ThoughtNodeType;
    content: string;
    confidence: number; // 0-100
    timestamp: Date;
    status: 'pending' | 'processing' | 'completed' | 'failed';
}

// Node type configurations
const nodeTypeConfig: Record<ThoughtNodeType, {
    icon: any;
    color: string;
    bgColor: string;
    borderColor: string;
}> = {
    hypothesis: {
        icon: Lightbulb,
        color: '#FFD700',
        bgColor: 'rgba(255, 215, 0, 0.1)',
        borderColor: 'rgba(255, 215, 0, 0.3)',
    },
    research: {
        icon: Search,
        color: '#00D9FF',
        bgColor: 'rgba(0, 217, 255, 0.1)',
        borderColor: 'rgba(0, 217, 255, 0.3)',
    },
    analysis: {
        icon: Brain,
        color: '#9D4EDD',
        bgColor: 'rgba(157, 78, 221, 0.1)',
        borderColor: 'rgba(157, 78, 221, 0.3)',
    },
    decision: {
        icon: Target,
        color: '#0077FF',
        bgColor: 'rgba(0, 119, 255, 0.1)',
        borderColor: 'rgba(0, 119, 255, 0.3)',
    },
    action: {
        icon: Zap,
        color: '#FF6B35',
        bgColor: 'rgba(255, 107, 53, 0.1)',
        borderColor: 'rgba(255, 107, 53, 0.3)',
    },
    validation: {
        icon: CheckCircle,
        color: '#06FFA5',
        bgColor: 'rgba(6, 255, 165, 0.1)',
        borderColor: 'rgba(6, 255, 165, 0.3)',
    },
    reflection: {
        icon: RefreshCw,
        color: '#FF006E',
        bgColor: 'rgba(255, 0, 110, 0.1)',
        borderColor: 'rgba(255, 0, 110, 0.3)',
    },
};

// Custom node component
function ThoughtNode({ data }: { data: ThoughtNodeData }) {
    const config = nodeTypeConfig[data.type];
    const Icon = config.icon;

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="px-4 py-3 rounded-xl border-2 min-w-[200px] max-w-[300px]"
            style={{
                backgroundColor: config.bgColor,
                borderColor: config.borderColor,
                backdropFilter: 'blur(10px)',
            }}
        >
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4" style={{ color: config.color }} />
                <span
                    className="text-xs font-mono uppercase tracking-wider font-bold"
                    style={{ color: config.color }}
                >
                    {data.type}
                </span>
                {data.status === 'processing' && (
                    <div className="ml-auto">
                        <div
                            className="w-2 h-2 rounded-full animate-pulse"
                            style={{ backgroundColor: config.color }}
                        />
                    </div>
                )}
            </div>

            {/* Label */}
            <div className="text-sm font-semibold text-white mb-1">
                {data.label}
            </div>

            {/* Content */}
            <div className="text-xs text-gray-400 mb-2 line-clamp-3">
                {data.content}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-[10px]">
                <span className="text-gray-600">
                    {data.timestamp.toLocaleTimeString()}
                </span>
                <div className="flex items-center gap-1">
                    <span className="text-gray-500">Confidence:</span>
                    <span
                        className="font-bold"
                        style={{ color: config.color }}
                    >
                        {data.confidence}%
                    </span>
                </div>
            </div>
        </motion.div>
    );
}

const nodeTypes = {
    thoughtNode: ThoughtNode,
};

// Initial example nodes for demonstration
const initialNodes: Node<ThoughtNodeData>[] = [
    {
        id: '1',
        type: 'thoughtNode',
        position: { x: 250, y: 50 },
        data: {
            label: 'Initial Hypothesis',
            type: 'hypothesis',
            content: 'User wants to build an e-commerce platform with payment integration',
            confidence: 85,
            timestamp: new Date(),
            status: 'completed',
        },
    },
    {
        id: '2',
        type: 'thoughtNode',
        position: { x: 100, y: 200 },
        data: {
            label: 'Market Research',
            type: 'research',
            content: 'Analyze competitor features, pricing models, and user expectations',
            confidence: 92,
            timestamp: new Date(),
            status: 'completed',
        },
    },
    {
        id: '3',
        type: 'thoughtNode',
        position: { x: 400, y: 200 },
        data: {
            label: 'Technical Requirements',
            type: 'research',
            content: 'Database schema, API endpoints, payment gateway integration',
            confidence: 88,
            timestamp: new Date(),
            status: 'processing',
        },
    },
    {
        id: '4',
        type: 'thoughtNode',
        position: { x: 250, y: 350 },
        data: {
            label: 'Architecture Analysis',
            type: 'analysis',
            content: 'Evaluate monolith vs microservices, scaling strategy, deployment',
            confidence: 78,
            timestamp: new Date(),
            status: 'pending',
        },
    },
];

const initialEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', animated: true },
    { id: 'e1-3', source: '1', target: '3', animated: true },
    { id: 'e2-4', source: '2', target: '4', animated: true },
    { id: 'e3-4', source: '3', target: '4', animated: true },
];

export function ThoughtGraph() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    return (
        <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'w-full h-[600px]'} bg-[#0a0a0a] rounded-xl overflow-hidden border border-white/10`}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                className="bg-[#0a0a0a]"
            >
                <Background color="#ffffff20" gap={20} />
                <MiniMap
                    className="bg-white/5 border border-white/10"
                    maskColor="rgba(0, 0, 0, 0.6)"
                />

                <Panel position="top-left" className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-3">
                    <div className="space-y-2">
                        <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                            🧠 Thought Graph
                        </h3>
                        <div className="text-xs text-gray-400">
                            Visualizing AI reasoning process
                        </div>
                    </div>
                </Panel>

                <Panel position="top-right" className="space-x-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="bg-white/5 border border-white/10 text-white hover:bg-white/10"
                    >
                        {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                    </Button>
                </Panel>
            </ReactFlow>
        </div>
    );
}
