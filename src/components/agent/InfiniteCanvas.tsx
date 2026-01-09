/**
 * Infinite Canvas - Flowith-style Free-form Workspace
 * Allows drag-and-drop planning with sticky notes, mind maps, and flowcharts
 */

import { useState, useCallback, useRef } from 'react';
import ReactFlow, {
    Node,
    Edge,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    NodeTypes,
    Panel,
    ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import { Plus, StickyNote, Circle, Square, Diamond, Type, Trash2, Download, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Custom sticky note node
function StickyNoteNode({ data }: { data: any }) {
    return (
        <div
            className="px-4 py-3 min-w-[200px] max-w-[300px] rounded-lg shadow-lg"
            style={{ backgroundColor: data.color || '#FFD700' }}
        >
            <div className="text-sm text-gray-900 whitespace-pre-wrap">
                {data.label}
            </div>
        </div>
    );
}

// Custom text node
function TextNode({ data }: { data: any }) {
    return (
        <div className="bg-transparent">
            <div
                className="text-lg font-bold"
                style={{ color: data.color || '#ffffff' }}
            >
                {data.label}
            </div>
        </div>
    );
}

// Custom shape nodes
function ShapeNode({ data }: { data: any }) {
    const shapes = {
        circle: Circle,
        square: Square,
        diamond: Diamond,
    };

    const Shape = shapes[data.shape as keyof typeof shapes] || Square;

    return (
        <div className="relative">
            <Shape
                className="w-24 h-24"
                style={{
                    color: data.color || '#f97316',
                    fill: `${data.color || '#f97316'}20`,
                    strokeWidth: 2,
                }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs text-white font-semibold text-center px-2">
                    {data.label}
                </span>
            </div>
        </div>
    );
}

const nodeTypes: NodeTypes = {
    stickyNote: StickyNoteNode,
    text: TextNode,
    shape: ShapeNode,
};

const stickyColors = [
    '#FFD700', // Yellow
    '#FF6B9D', // Pink
    '#00D9FF', // Cyan
    '#9D4EDD', // Purple
    '#06FFA5', // Green
    '#FF6B35', // Orange
];

export function InfiniteCanvas() {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [selectedTool, setSelectedTool] = useState<'sticky' | 'text' | 'shape' | null>(null);
    const [selectedColor, setSelectedColor] = useState(stickyColors[0]);
    const canvasRef = useRef<HTMLDivElement>(null);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
        [setEdges]
    );

    const addNode = useCallback((type: string) => {
        const newNode: Node = {
            id: `${type}-${Date.now()}`,
            type,
            position: {
                x: Math.random() * 400 + 200,
                y: Math.random() * 300 + 100
            },
            data: {
                label: type === 'sticky' ? 'Double-click to edit' : 'New item',
                color: selectedColor,
                shape: 'square',
            },
        };

        setNodes((nds) => [...nds, newNode]);
        setSelectedTool(null);
    }, [selectedColor, setNodes]);

    const clearCanvas = () => {
        setNodes([]);
        setEdges([]);
    };

    const exportCanvas = () => {
        const data = {
            nodes,
            edges,
            timestamp: new Date().toISOString(),
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `canvas-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="w-full h-full bg-[#0a0a0a] rounded-xl border border-white/10 overflow-hidden" ref={canvasRef}>
            <ReactFlowProvider>
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
                    <Background color="#ffffff15" gap={20} />

                    {/* Top Toolbar */}
                    <Panel position="top-left" className="flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-2">
                        <div className="flex items-center gap-1">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => addNode('stickyNote')}
                                className={`${selectedTool === 'sticky' ? 'bg-orange-500/20 text-orange-400' : 'text-gray-400'}`}
                                title="Add Sticky Note"
                            >
                                <StickyNote className="w-4 h-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => addNode('text')}
                                className={`${selectedTool === 'text' ? 'bg-orange-500/20 text-orange-400' : 'text-gray-400'}`}
                                title="Add Text"
                            >
                                <Type className="w-4 h-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => addNode('shape')}
                                className={`${selectedTool === 'shape' ? 'bg-orange-500/20 text-orange-400' : 'text-gray-400'}`}
                                title="Add Shape"
                            >
                                <Square className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="h-6 w-px bg-white/10" />

                        {/* Color Picker */}
                        <div className="flex items-center gap-1">
                            {stickyColors.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => setSelectedColor(color)}
                                    className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${selectedColor === color ? 'scale-110 border-white' : 'border-transparent'
                                        }`}
                                    style={{ backgroundColor: color }}
                                    title={color}
                                />
                            ))}
                        </div>

                        <div className="h-6 w-px bg-white/10" />

                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={clearCanvas}
                            className="text-gray-400 hover:text-red-400"
                            title="Clear Canvas"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>

                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={exportCanvas}
                            className="text-gray-400 hover:text-green-400"
                            title="Export Canvas"
                        >
                            <Download className="w-4 h-4" />
                        </Button>
                    </Panel>

                    {/* Info Panel */}
                    <Panel position="top-right" className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-3">
                        <div className="text-xs text-gray-400 space-y-1">
                            <div>Nodes: {nodes.length}</div>
                            <div>Connections: {edges.length}</div>
                        </div>
                    </Panel>

                    {/* Instructions */}
                    {nodes.length === 0 && (
                        <Panel position="top-center">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6 text-center max-w-md mt-20"
                            >
                                <h3 className="text-lg font-bold text-white mb-3">
                                    🎨 Infinite Canvas
                                </h3>
                                <p className="text-sm text-gray-400 mb-4">
                                    Create free-form diagrams, mind maps, and flowcharts
                                </p>
                                <div className="space-y-2 text-xs text-gray-500 text-left">
                                    <div>• Click icons above to add sticky notes, text, or shapes</div>
                                    <div>• Drag nodes to position them</div>
                                    <div>• Connect nodes by dragging from handles</div>
                                    <div>• Choose colors from the palette</div>
                                </div>
                            </motion.div>
                        </Panel>
                    )}
                </ReactFlow>
            </ReactFlowProvider>
        </div>
    );
}
