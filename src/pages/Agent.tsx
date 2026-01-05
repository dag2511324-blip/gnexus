/**
 * G-NEXUS AGENT GRID PAGE - FLOWITH TRANSFORMATION
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import {
    Terminal,
    Megaphone,
    Eye,
    Brain,
    Zap,
    Loader2,
    Bot,
    Palette,
    ImageIcon,
    Activity,
    ArrowRight,
    Check,
    Target,
    Layers,
    Copy,
    Maximize2,
    Shield,
    Map as MapIcon,
    Plus,
    Minus,
    Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAgentDispatcher } from '@/hooks/useNexus';
import { toast } from 'sonner';
import { AI_MODELS, type ModelKey } from '@/lib/ai';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';

// =============================================================================
// TYPES
// =============================================================================

interface AgentCard {
    key: ModelKey;
    name: string;
    label: string;
    description: string;
    color: string;
    icon: React.ReactNode;
    capabilities: string[];
    stats: {
        parameters?: string;
        speed?: string;
        accuracy?: string;
    };
}

interface CanvasNode {
    id: string;
    type: 'agent' | 'mission' | 'input';
    content?: string;
    agentKey?: ModelKey;
    status?: 'idle' | 'processing' | 'completed' | 'failed';
    x: number;
    y: number;
}

// =============================================================================
// AGENT CONFIGURATIONS
// =============================================================================

const AGENTS: AgentCard[] = [
    {
        key: 'coder',
        name: 'Web Development',
        label: 'Custom SaaS & Landing Pages',
        description: 'Custom SaaS platforms, landing pages, and e-commerce solutions with native Telebirr Integration.',
        color: '#f97316',
        icon: <Terminal className="w-8 h-8" />,
        capabilities: ['React & Next.js', 'Telebirr & Chapa', 'Responsive Design'],
        stats: { speed: 'Ultra-Fast', accuracy: 'Precision' },
    },
    {
        key: 'flux',
        name: '3D & Architecture',
        label: 'Photorealistic Rendering',
        description: 'Photorealistic ArchViz, product rendering, and immersive virtual tours that bring vision to life.',
        color: '#f97316',
        icon: <Palette className="w-8 h-8" />,
        capabilities: ['High-Fidelity Renders', 'Virtual Tours', 'Product Visualization'],
        stats: { speed: 'Advanced', accuracy: 'Artistic' },
    },
    {
        key: 'agentic',
        name: 'AI Automation',
        label: 'Business Process Automation',
        description: 'Intelligent Telegram bots, AI coding agents, and business process automation powered by cutting-edge tech.',
        color: '#f97316',
        icon: <Brain className="w-8 h-8" />,
        capabilities: ['Custom AI Agents', 'Process Automation', 'Smart Integrations'],
        stats: { speed: 'Autonomous', accuracy: 'Adaptive' },
    },
    {
        key: 'marketing',
        name: 'G-Nexus Platform',
        label: 'SaaS Business Management',
        description: 'All-in-one business management SaaS designed specifically for Ethiopian SMEs to thrive digitally.',
        color: '#f97316',
        icon: <Layers className="w-8 h-8" />,
        capabilities: ['ERP & CRM', 'Website Builder', 'AI Assistant'],
        stats: { speed: 'Instant', accuracy: 'Creative' },
    },
];

const EXTENDED_AGENTS: AgentCard[] = [
    ...AGENTS,
    {
        key: 'planner',
        name: 'Nexus Strategic Planner',
        label: 'Planning & Consultation',
        description: 'Conversational AI for strategic planning, brainstorming, and task management.',
        color: '#06b6d4',
        icon: <Target className="w-8 h-8" />,
        capabilities: ['Planning', 'Brainstorming', 'Task Management', 'Research'],
        stats: { speed: 'Fast', accuracy: 'Strategic' },
    },
    {
        key: 'playground',
        name: 'Nexus Aesthetic Canvas',
        label: 'Artistic Visual Production',
        description: 'Create aesthetically pleasing images with artistic flair and fine detail control.',
        color: '#ec4899',
        icon: <Palette className="w-8 h-8" />,
        capabilities: ['Art Generation', 'Style Control', 'Aesthetic Focus', 'High Detail'],
        stats: { speed: 'Fast', accuracy: 'Vivid' },
    },
    {
        key: 'sdxl',
        name: 'Nexus SDXL Studio',
        label: 'Versatile Visual Studio',
        description: 'Versatile image generation with excellent prompt following and diverse styles.',
        color: '#8b5cf6',
        icon: <ImageIcon className="w-8 h-8" />,
        capabilities: ['Versatile Styles', 'Prompt Following', 'Controlnet', 'LoRA'],
        stats: { speed: 'Flexible', accuracy: 'Creative' },
    },
    {
        key: 'agentic',
        name: 'Nexus Autonomous Agent',
        label: 'Process Automation Engine',
        description: 'Autonomous agent for GUI interaction and task automation across applications.',
        color: '#ef4444',
        icon: <Bot className="w-8 h-8" />,
        capabilities: ['GUI Control', 'Task Automation', 'Screen Reading', 'Action Planning'],
        stats: { speed: 'Autonomous', accuracy: 'Adaptive' },
    },
];

// =============================================================================
// COMPONENTS
// =============================================================================

const AgentCardComponent = ({
    agent,
    isSelected,
    isHovered,
    onClick,
    onHover,
    cardRef,
}: {
    agent: AgentCard;
    isSelected: boolean;
    isHovered: boolean;
    onClick: () => void;
    onHover: (hovered: boolean) => void;
    cardRef?: (el: HTMLDivElement | null) => void;
}) => {
    const internalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (cardRef && internalRef.current) {
            cardRef(internalRef.current);
        }
    }, [cardRef]);

    return (
        <motion.div
            ref={internalRef}
            layout
            onClick={onClick}
            onMouseEnter={() => onHover(true)}
            onMouseLeave={() => onHover(false)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            animate={{
                opacity: isSelected || isHovered ? 1 : 0.7,
            }}
            className={`
                relative cursor-pointer rounded-2xl p-6
                bg-[#0a0a0a]/80 backdrop-blur-xl
                border-2 transition-all duration-300
                ${isSelected
                    ? 'border-opacity-100'
                    : isHovered
                        ? 'border-opacity-60'
                        : 'border-opacity-20 border-white/10'
                }
            `}
            style={{
                borderColor: isSelected || isHovered ? agent.color : undefined,
                boxShadow: isSelected
                    ? `0 0 40px ${agent.color}40, 0 0 80px ${agent.color}20`
                    : isHovered
                        ? `0 0 20px ${agent.color}30`
                        : 'none',
            }}
        >
            <AnimatePresence>
                {isSelected && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center z-10"
                        style={{ backgroundColor: agent.color }}
                    >
                        <Check className="w-5 h-5 text-white" />
                    </motion.div>
                )}
            </AnimatePresence>

            <div
                className="w-16 h-16 rounded-xl flex items-center justify-center mb-4"
                style={{
                    backgroundColor: `${agent.color}20`,
                    boxShadow: isSelected ? `0 0 20px ${agent.color}40` : 'none',
                }}
            >
                <div style={{ color: agent.color }}>{agent.icon}</div>
            </div>

            <h3 className="font-mono font-bold text-lg text-gray-200 mb-1">
                {agent.name}
            </h3>
            <p
                className="text-sm font-medium mb-3"
                style={{ color: agent.color }}
            >
                {agent.label}
            </p>

            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                {agent.description}
            </p>

            <div className="space-y-3 mt-auto">
                {agent.capabilities.map((cap) => (
                    <div key={cap} className="flex items-center gap-3 text-xs text-gray-300 font-medium group/item">
                        <Sparkles className="w-3.5 h-3.5 text-orange-500/80 group-hover/item:text-orange-400 transition-colors" />
                        {cap}
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

// =============================================================================
// MINI MAP COMPONENT
// =============================================================================

const MiniMap = ({
    x,
    y,
    scale,
    canvasSize = 8000
}: {
    x: any;
    y: any;
    scale: number;
    canvasSize?: number
}) => {
    const mapSize = 160;
    const ratio = mapSize / canvasSize;

    // Viewport rectangle dimensions
    const vWidth = (window.innerWidth / scale) * ratio;
    const vHeight = (window.innerHeight / scale) * ratio;

    // Viewport position (inverse of canvas movement)
    const [rectPos, setRectPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const update = () => {
            const currentX = x.get();
            const currentY = y.get();

            // Map the canvas space (0-8000) to map space (0-160)
            // The x/y are offsets from the center/initial point
            // Initial x is -4000 + window.innerWidth/2
            // So relative to 0,0 top left:
            const relX = -currentX * ratio;
            const relY = -currentY * ratio;

            setRectPos({ x: relX, y: relY });
        };

        const unsubscribeX = x.on('change', update);
        const unsubscribeY = y.on('change', update);
        update();

        return () => {
            unsubscribeX();
            unsubscribeY();
        };
    }, [x, y, ratio]);

    return (
        <div
            className="fixed bottom-32 right-8 w-[160px] h-[160px] bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden z-50 pointer-events-none"
            style={{ boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}
        >
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff20_1px,transparent_1px)] [background-size:10px_10px]" />

            {/* Viewport Indicator */}
            <div
                className="absolute border border-orange-500/50 bg-orange-500/10"
                style={{
                    width: Math.min(vWidth, mapSize),
                    height: Math.min(vHeight, mapSize),
                    left: Math.max(0, Math.min(rectPos.x, mapSize - vWidth)),
                    top: Math.max(0, Math.min(rectPos.y, mapSize - vHeight)),
                }}
            />

            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 opacity-50">
                <MapIcon className="w-3 h-3 text-gray-400" />
                <span className="text-[8px] font-mono text-gray-400 uppercase tracking-widest font-bold">Workspace Map</span>
            </div>
        </div>
    );
};

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function AgentGridPage() {
    const [hoveredAgent, setHoveredAgent] = useState<ModelKey | null>(null);
    const [prompt, setPrompt] = useState('');
    const [showExtended, setShowExtended] = useState(false);
    const [taskStatus, setTaskStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle');

    const {
        selectedAgent,
        selectAgent,
        dispatch,
        loading,
        output,
        error,
        agentInfo,
    } = useAgentDispatcher();

    // Canvas State
    const [nodes, setNodes] = useState<CanvasNode[]>([]);
    const [canvasScale, setCanvasScale] = useState(1);
    const [isFlowActive, setIsFlowActive] = useState(false);

    // Motion Values for Canvas Navigation
    const x = useMotionValue(-4000 + window.innerWidth / 2);
    const y = useMotionValue(-650);

    // Refs
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const cardRefs = useRef<Map<ModelKey, HTMLDivElement>>(new Map());
    const inputContainerRef = useRef<HTMLDivElement>(null);
    const workspaceRef = useRef<HTMLDivElement>(null);

    const displayedAgents = showExtended ? EXTENDED_AGENTS : AGENTS;
    const selectedAgentCard = displayedAgents.find(a => a.key === selectedAgent);

    // Zoom Handlers
    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = -e.deltaY;
            const factor = 0.002;
            const newScale = Math.min(Math.max(canvasScale + delta * factor, 0.2), 2);
            setCanvasScale(newScale);
        } else {
            // Horizontal and Vertical shift
            x.set(x.get() - e.deltaX);
            y.set(y.get() - e.deltaY);
        }
    };

    const zoomIn = () => setCanvasScale(prev => Math.min(prev + 0.1, 2));
    const zoomOut = () => setCanvasScale(prev => Math.max(prev - 0.1, 0.2));
    const resetView = () => {
        setCanvasScale(1);
        x.set(-4000 + window.innerWidth / 2);
        y.set(-650);
    };

    // Handle dispatch
    const handleDispatch = async () => {
        if (!selectedAgent || !prompt.trim() || loading) return;

        setTaskStatus('processing');
        setIsFlowActive(true);
        const currentPrompt = prompt;
        setPrompt('');

        const newNode: CanvasNode = {
            id: `mission-${Date.now()}`,
            type: 'mission',
            content: '',
            agentKey: selectedAgent,
            status: 'processing',
            x: 0,
            y: 0,
        };

        setNodes(prev => [...prev.filter(n => n.type !== 'mission'), newNode]);

        try {
            const result = await dispatch(currentPrompt);
            setTaskStatus('completed');
            setNodes(prev => prev.map(n => n.id === newNode.id ? { ...n, content: result as string, status: 'completed' } : n));
        } catch {
            setTaskStatus('failed');
            setNodes(prev => prev.map(n => n.id === newNode.id ? { ...n, status: 'failed' } : n));
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <SEO
                title="Our Services | G-NEXUS Ethiopia's Digital Future"
                description="Explore our premium digital solutions including Web Development, 3D Architecture, and AI Automation."
            />

            <div
                className="flex-1 relative overflow-hidden bg-[#020202] h-screen w-screen font-sans"
                onWheel={handleWheel}
                ref={workspaceRef}
            >
                {/* Fixed Background Layers */}
                <div className="absolute inset-0 pointer-events-none opacity-20">
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:40px_40px]" />
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:200px_200px]" />
                </div>

                <Navbar />

                {/* Mini Map */}
                <MiniMap x={x} y={y} scale={canvasScale} />

                {/* Workspace Controls */}
                <div className="fixed top-24 right-8 z-50 flex flex-col gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={zoomIn}
                        title="Zoom In"
                        className="rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white"
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={zoomOut}
                        title="Zoom Out"
                        className="rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white"
                    >
                        <Minus className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={resetView}
                        title="Center Workspace"
                        className="rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white"
                    >
                        <Target className="w-4 h-4" />
                    </Button>
                </div>

                {/* Draggable Workspace */}
                <motion.div
                    drag
                    dragMomentum={true}
                    dragTransition={{ bounceStiffness: 200, bounceDamping: 20 }}
                    className="absolute inset-0 cursor-grab active:cursor-grabbing"
                    style={{
                        width: '8000px',
                        height: '8000px',
                        x,
                        y,
                        scale: canvasScale,
                    }}
                >
                    <div
                        className="relative w-full h-full pt-[800px] flex flex-col items-center"
                        style={{
                            backgroundImage: `
                                linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
                            `,
                            backgroundSize: '100px 100px',
                        }}
                    >
                        {/* Hero Section */}
                        {!isFlowActive && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center mb-24 select-none px-8"
                            >
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[10px] font-mono text-orange-400 uppercase tracking-widest mb-6">
                                    Our Services
                                </div>
                                <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tighter mb-6 font-display">
                                    Building Ethiopia's <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-yellow-600">Digital Future</span>
                                </h1>
                                <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed mb-12">
                                    From web development to AI automation, we deliver premium digital solutions that blend ancient wisdom with futuristic technology.
                                </p>
                            </motion.div>
                        )}

                        {/* Agents Selection Grid */}
                        <div className="relative z-20">
                            {!isFlowActive ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl px-8">
                                    {displayedAgents.map((agent) => (
                                        <AgentCardComponent
                                            key={agent.key}
                                            agent={agent}
                                            isSelected={selectedAgent === agent.key}
                                            isHovered={hoveredAgent === agent.key}
                                            onClick={() => selectAgent(agent.key)}
                                            onHover={(h) => setHoveredAgent(h ? agent.key : null)}
                                            cardRef={(el) => el && cardRefs.current.set(agent.key, el)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    {AGENTS.filter(a => a.key === selectedAgent).map(agent => (
                                        <AgentCardComponent
                                            key={agent.key}
                                            agent={agent}
                                            isSelected={true}
                                            isHovered={false}
                                            onClick={() => { }}
                                            onHover={() => { }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Result Nodes */}
                        <div className="mt-24 space-y-24 w-full flex flex-col items-center">
                            {nodes.filter(n => n.type === 'mission').map((node) => (
                                <motion.div
                                    key={node.id}
                                    initial={{ opacity: 0, scale: 0.9, y: 100 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    className="w-full max-w-5xl px-8"
                                >
                                    <div className="flex flex-col items-center gap-12">
                                        <div className="h-24 w-[1px] bg-gradient-to-b from-orange-500/50 via-orange-500/10 to-transparent" />

                                        <div className="w-full bg-[#0a0a0a]/90 backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
                                            {/* Mission Header - Styled like Service Card top */}
                                            <div className="flex items-center gap-6 mb-10">
                                                <div className="w-16 h-16 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                                                    <Bot className="w-8 h-8 text-orange-500" />
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-mono text-orange-500/60 uppercase tracking-[0.3em] mb-1 font-bold">Extraction Result</div>
                                                    <div className="text-gray-100 font-bold text-2xl tracking-tight uppercase">G-Nexus Intelligence</div>
                                                </div>

                                                {node.status === 'completed' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(node.content || '');
                                                            toast.success('Caputred to clipboard');
                                                        }}
                                                        className="ml-auto h-12 w-12 bg-white/5 rounded-2xl hover:bg-white/10"
                                                    >
                                                        <Copy className="w-5 h-5 text-gray-400" />
                                                    </Button>
                                                )}
                                            </div>

                                            <div className="prose prose-invert max-w-none">
                                                {node.status === 'processing' ? (
                                                    <div className="space-y-6">
                                                        <div className="h-6 bg-orange-500/10 rounded-lg w-3/4 animate-pulse" />
                                                        <div className="h-6 bg-orange-500/5 rounded-lg w-1/2 animate-pulse" />
                                                        <div className="h-6 bg-orange-500/10 rounded-lg w-2/3 animate-pulse" />
                                                    </div>
                                                ) : (
                                                    <div className="text-gray-200 font-sans text-xl leading-relaxed whitespace-pre-wrap">
                                                        {node.content}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Footer decor to match image card feeling */}
                                            <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Sparkles className="w-4 h-4 text-orange-500/40" />
                                                    <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Premium AI Output</span>
                                                </div>
                                                <div className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">
                                                    {new Date().toLocaleTimeString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* System Stats Block */}
                        {!isFlowActive && (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                                className="mt-48 grid grid-cols-2 md:grid-cols-4 gap-12 w-full max-w-4xl"
                            >
                                {[
                                    { label: 'Neural Throughput', value: '4.8 GB/s', icon: <Zap className="w-5 h-5" /> },
                                    { label: 'Active Synapses', value: '142', icon: <Bot className="w-5 h-5" /> },
                                    { label: 'Security Level', value: 'Encrypted', icon: <Shield className="w-5 h-5" /> },
                                    { label: 'System Uptime', value: '99.98%', icon: <Activity className="w-5 h-5" /> },
                                ].map((stat) => (
                                    <div key={stat.label} className="text-center group">
                                        <div className="flex justify-center mb-4 text-cyan-500/40 group-hover:text-cyan-400 transition-colors">{stat.icon}</div>
                                        <div className="text-2xl font-bold text-gray-200 font-mono tracking-tighter mb-1">{stat.value}</div>
                                        <div className="text-[10px] text-gray-600 uppercase tracking-widest leading-none">{stat.label}</div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* Floating Input Controller */}
                <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-3xl px-8 z-50">
                    <motion.div
                        ref={inputContainerRef}
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-[#0f0f0f]/95 backdrop-blur-3xl border border-white/10 rounded-[32px] p-2 shadow-2xl shadow-black/90"
                    >
                        <div className="flex flex-col gap-1">
                            <div className="flex items-end gap-3 p-2">
                                <div className="flex-1">
                                    <textarea
                                        ref={inputRef}
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleDispatch();
                                            }
                                        }}
                                        placeholder={selectedAgentCard ? `Command ${selectedAgentCard.name}...` : "Select an agent to begin"}
                                        className="w-full bg-transparent px-6 py-4 text-gray-100 placeholder:text-gray-600 focus:outline-none resize-none min-h-[60px] max-h-[300px] text-lg leading-relaxed"
                                        rows={1}
                                    />
                                </div>
                                <Button
                                    onClick={handleDispatch}
                                    disabled={!selectedAgent || !prompt.trim() || loading}
                                    className={`
                                        w-16 h-16 rounded-[24px] transition-all duration-500 shadow-xl
                                        ${selectedAgent && prompt.trim() && !loading
                                            ? 'bg-white text-black hover:bg-gray-200 scale-100'
                                            : 'bg-white/5 text-gray-700 scale-95'
                                        }
                                    `}
                                >
                                    {loading ? <Loader2 className="w-7 h-7 animate-spin" /> : <ArrowRight className="w-7 h-7" />}
                                </Button>
                            </div>

                            <div className="px-8 pb-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-orange-500 animate-pulse' : 'bg-gray-700'}`} />
                                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em]">
                                        {loading ? 'Executing Mission' : selectedAgentCard ? `${selectedAgentCard.name} Standby` : 'Ready for Command'}
                                    </span>
                                </div>

                                {isFlowActive && (
                                    <button
                                        onClick={() => {
                                            setIsFlowActive(false);
                                            setNodes([]);
                                        }}
                                        className="text-[10px] font-mono text-orange-500/50 hover:text-orange-400 transition-colors uppercase tracking-[0.2em]"
                                    >
                                        TERMINATE FLOW
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>

            </div>
        </div>
    );
}

