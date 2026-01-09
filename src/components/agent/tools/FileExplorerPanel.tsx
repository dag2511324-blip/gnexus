/**
 * File Explorer Panel
 * Interactive file tree for browsing and managing project files
 */

import { useState } from 'react';
import {
    ChevronRight,
    ChevronDown,
    File,
    Folder,
    FolderOpen,
    Search,
    Plus,
    Trash2,
    Edit2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FileNode {
    name: string;
    path: string;
    type: 'file' | 'directory';
    children?: FileNode[];
}

interface FileExplorerPanelProps {
    onFileSelect?: (path: string) => void;
    currentFile?: string;
}

// Mock file structure - replace with actual API calls
const mockFileTree: FileNode = {
    name: 'project',
    path: '/',
    type: 'directory',
    children: [
        {
            name: 'src',
            path: '/src',
            type: 'directory',
            children: [
                {
                    name: 'components',
                    path: '/src/components',
                    type: 'directory',
                    children: [
                        { name: 'Navbar.tsx', path: '/src/components/Navbar.tsx', type: 'file' },
                        { name: 'Footer.tsx', path: '/src/components/Footer.tsx', type: 'file' },
                    ],
                },
                {
                    name: 'pages',
                    path: '/src/pages',
                    type: 'directory',
                    children: [
                        { name: 'Agent.tsx', path: '/src/pages/Agent.tsx', type: 'file' },
                        { name: 'Home.tsx', path: '/src/pages/Home.tsx', type: 'file' },
                    ],
                },
                {
                    name: 'lib',
                    path: '/src/lib',
                    type: 'directory',
                    children: [
                        { name: 'ai.ts', path: '/src/lib/ai.ts', type: 'file' },
                        { name: 'AgentPipelineRouter.ts', path: '/src/lib/AgentPipelineRouter.ts', type: 'file' },
                    ],
                },
            ],
        },
        {
            name: 'public',
            path: '/public',
            type: 'directory',
            children: [
                { name: 'logo.svg', path: '/public/logo.svg', type: 'file' },
            ],
        },
        { name: 'package.json', path: '/package.json', type: 'file' },
        { name: 'tsconfig.json', path: '/tsconfig.json', type: 'file' },
    ],
};

function FileTreeNode({
    node,
    onSelect,
    currentFile,
    level = 0
}: {
    node: FileNode;
    onSelect: (path: string) => void;
    currentFile?: string;
    level?: number;
}) {
    const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand first 2 levels
    const isActive = currentFile === node.path;

    const handleClick = () => {
        if (node.type === 'directory') {
            setIsExpanded(!isExpanded);
        } else {
            onSelect(node.path);
        }
    };

    const getFileIcon = (name: string) => {
        const ext = name.split('.').pop()?.toLowerCase();
        const iconMap: Record<string, string> = {
            'tsx': '⚛️',
            'ts': '🔷',
            'jsx': '⚛️',
            'js': '🟨',
            'json': '📋',
            'css': '🎨',
            'html': '🌐',
            'svg': '🖼️',
            'md': '📝',
        };
        return iconMap[ext || ''] || '📄';
    };

    return (
        <div>
            <div
                onClick={handleClick}
                className={`
                    flex items-center gap-2 px-2 py-1 cursor-pointer rounded-md
                    transition-colors duration-150
                    ${isActive
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'hover:bg-white/5 text-gray-300'
                    }
                `}
                style={{ paddingLeft: `${level * 16 + 8}px` }}
            >
                {node.type === 'directory' && (
                    <span className="w-4 h-4 flex-shrink-0">
                        {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                        ) : (
                            <ChevronRight className="w-4 h-4" />
                        )}
                    </span>
                )}

                <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center text-base">
                    {node.type === 'directory' ? (
                        isExpanded ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />
                    ) : (
                        <span>{getFileIcon(node.name)}</span>
                    )}
                </span>

                <span className="text-sm font-mono truncate">{node.name}</span>
            </div>

            {node.type === 'directory' && isExpanded && node.children && (
                <div>
                    {node.children.map((child) => (
                        <FileTreeNode
                            key={child.path}
                            node={child}
                            onSelect={onSelect}
                            currentFile={currentFile}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export function FileExplorerPanel({ onFileSelect, currentFile }: FileExplorerPanelProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const handleFileSelect = (path: string) => {
        console.log('File selected:', path);
        onFileSelect?.(path);
    };

    return (
        <div className="h-full flex flex-col bg-[#0a0a0a] border-r border-white/10">
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-mono font-bold text-gray-300 uppercase tracking-wider">
                        Files
                    </h3>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-gray-500 hover:text-gray-300"
                            title="New File"
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search files..."
                        className="h-8 pl-8 pr-3 text-xs bg-white/5 border-white/10 text-gray-300 placeholder:text-gray-600"
                    />
                </div>
            </div>

            {/* File Tree */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2">
                <FileTreeNode
                    node={mockFileTree}
                    onSelect={handleFileSelect}
                    currentFile={currentFile}
                />
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-white/10">
                <div className="text-xs text-gray-600 font-mono">
                    Project Root
                </div>
            </div>
        </div>
    );
}
