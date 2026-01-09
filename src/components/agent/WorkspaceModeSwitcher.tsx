/**
 * Workspace Mode Switcher
 * Toggle between Flow, Thought Graph, and Planning Tree views
 */

import { Brain, GitBranch, Workflow } from 'lucide-react';
import { Button } from '@/components/ui/button';

type WorkspaceMode = 'flow' | 'thoughts' | 'plan';

interface WorkspaceModeSwitcherProps {
    mode: WorkspaceMode;
    onChange: (mode: WorkspaceMode) => void;
}

const modes = [
    { key: 'flow' as const, label: 'Node Flow', icon: Workflow, description: 'Service pipeline execution' },
    { key: 'thoughts' as const, label: 'Thought Graph', icon: Brain, description: 'Visual AI reasoning' },
    { key: 'plan' as const, label: 'Planning Tree', icon: GitBranch, description: 'Hierarchical planning' },
];

export function WorkspaceModeSwitcher({ mode, onChange }: WorkspaceModeSwitcherProps) {
    return (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full p-1">
            {modes.map((m) => {
                const Icon = m.icon;
                const isActive = mode === m.key;

                return (
                    <Button
                        key={m.key}
                        variant="ghost"
                        size="sm"
                        onClick={() => onChange(m.key)}
                        className={`
                            rounded-full px-4 transition-all
                            ${isActive
                                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }
                        `}
                        title={m.description}
                    >
                        <Icon className="w-4 h-4 mr-2" />
                        {m.label}
                    </Button>
                );
            })}
        </div>
    );
}
