import { motion } from 'framer-motion';
import { Video, Image, Mic, FileText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface AIAction {
  id: 'video' | 'image' | 'audio' | 'text';
  name: string;
  description: string;
  icon: typeof Video;
  gradient: string;
  bgColor: string;
  models: string[];
  shortcut?: string;
}

export const AI_ACTIONS: AIAction[] = [
  {
    id: 'video',
    name: 'Video AI',
    description: 'Generate cinematic videos',
    icon: Video,
    gradient: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10 hover:bg-purple-500/20',
    models: ['Wan 2.2 (14B)', 'LTX-Video'],
    shortcut: 'Alt+V',
  },
  {
    id: 'image',
    name: 'Image AI',
    description: 'Create stunning images',
    icon: Image,
    gradient: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10 hover:bg-blue-500/20',
    models: ['FLUX.1 [schnell]', 'Z-Image-Turbo'],
    shortcut: 'Alt+I',
  },
  {
    id: 'audio',
    name: 'Voice AI',
    description: 'Text-to-speech & transcription',
    icon: Mic,
    gradient: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10 hover:bg-green-500/20',
    models: ['Kokoro v1.0', 'CosyVoice 2'],
    shortcut: 'Alt+A',
  },
  {
    id: 'text',
    name: 'Text AI',
    description: 'AI text generation',
    icon: FileText,
    gradient: 'from-orange-500 to-amber-500',
    bgColor: 'bg-orange-500/10 hover:bg-orange-500/20',
    models: ['Qwen2.5-Coder', 'DeepSeek-R1'],
    shortcut: 'Alt+T',
  },
];

interface AIQuickActionsProps {
  variant?: 'compact' | 'full' | 'cards';
  onActionClick: (actionId: 'video' | 'image' | 'audio' | 'text') => void;
  className?: string;
}

export function AIQuickActions({ 
  variant = 'compact', 
  onActionClick,
  className = '' 
}: AIQuickActionsProps) {
  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <div className={`flex items-center gap-1 ${className}`}>
          {AI_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Tooltip key={action.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onActionClick(action.id)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${action.bgColor}`}
                  >
                    <Icon className="h-4 w-4 text-foreground" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[200px]">
                  <div className="space-y-1">
                    <p className="font-semibold">{action.name}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Models: {action.models.join(' • ')}
                    </p>
                    {action.shortcut && (
                      <p className="text-xs font-mono bg-secondary px-1.5 py-0.5 rounded inline-block">
                        {action.shortcut}
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Sparkles className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">AI Studio:</span>
        {AI_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              onClick={() => onActionClick(action.id)}
              className={`gap-2 border-border hover:border-primary/50 transition-all`}
            >
              <Icon className="h-4 w-4" />
              {action.name}
            </Button>
          );
        })}
      </div>
    );
  }

  // Cards variant
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {AI_ACTIONS.map((action, index) => {
        const Icon = action.icon;
        return (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            onClick={() => onActionClick(action.id)}
            className="group cursor-pointer"
          >
            <div className="rounded-xl border border-border bg-card p-5 hover:border-primary/50 transition-all overflow-hidden relative">
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
              
              <div className="relative z-10">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient} mb-4`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {action.name}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {action.description}
                </p>
                
                <div className="flex flex-wrap gap-1">
                  {action.models.map((model) => (
                    <span
                      key={model}
                      className="text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground"
                    >
                      {model}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}