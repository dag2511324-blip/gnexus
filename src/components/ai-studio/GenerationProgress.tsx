import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Clock, RefreshCw, Zap, Sparkles, Check, AlertCircle, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type GenerationStatus = 'idle' | 'initializing' | 'connecting' | 'model-loading' | 'generating' | 'processing' | 'complete' | 'error';

interface GenerationProgressProps {
  isGenerating: boolean;
  status: GenerationStatus;
  progress: number;
  retryAttempt: number;
  maxRetries: number;
  estimatedWaitTime: number;
  modelName?: string;
  statusMessage?: string;
}

const STATUS_CONFIG: Record<GenerationStatus, { icon: typeof Loader2; label: string; color: string }> = {
  idle: { icon: Sparkles, label: 'Ready', color: 'text-muted-foreground' },
  initializing: { icon: Zap, label: 'Initializing', color: 'text-primary' },
  connecting: { icon: RefreshCw, label: 'Connecting to API', color: 'text-blue-400' },
  'model-loading': { icon: Clock, label: 'Model Loading', color: 'text-amber-400' },
  generating: { icon: Sparkles, label: 'Generating', color: 'text-purple-400' },
  processing: { icon: Loader2, label: 'Processing', color: 'text-cyan-400' },
  complete: { icon: Check, label: 'Complete', color: 'text-green-400' },
  error: { icon: AlertCircle, label: 'Error', color: 'text-destructive' },
};

const TIPS = [
  'First generation may take 30-60 seconds as the model warms up (cold start)',
  'FLUX.1 Schnell is optimized for speed with just 4 steps',
  'Extended waits (up to 5 minutes) are normal for heavy models',
  'The system automatically retries if the model is still loading',
  'After first use, the model stays warm for faster subsequent generations',
  'If one model fails, the system automatically tries alternatives',
  'Video generation requires HuggingFace Pro - use image generation instead',
  'Smaller text models (Phi-3, Gemma-2B) are faster and more reliable',
];

export function GenerationProgress({
  isGenerating,
  status,
  progress,
  retryAttempt,
  maxRetries,
  estimatedWaitTime,
  modelName,
  statusMessage,
}: GenerationProgressProps) {
  const [countdown, setCountdown] = useState(estimatedWaitTime);
  const [showTips, setShowTips] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);

  // Countdown timer
  useEffect(() => {
    setCountdown(estimatedWaitTime);
  }, [estimatedWaitTime]);

  useEffect(() => {
    if (!isGenerating || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [isGenerating, countdown]);

  // Rotate tips
  useEffect(() => {
    if (!isGenerating) return;

    const tipTimer = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % TIPS.length);
    }, 8000);

    return () => clearInterval(tipTimer);
  }, [isGenerating]);

  if (!isGenerating && status === 'idle') return null;

  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-4 space-y-3"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={status === 'generating' || status === 'model-loading' ? { rotate: 360 } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className={cn('flex h-8 w-8 items-center justify-center rounded-lg', 
                status === 'model-loading' ? 'bg-amber-500/20' : 
                status === 'generating' ? 'bg-purple-500/20' :
                status === 'complete' ? 'bg-green-500/20' :
                status === 'error' ? 'bg-destructive/20' :
                'bg-primary/20'
              )}
            >
              <Icon className={cn('h-4 w-4', config.color, (status !== 'idle' && status !== 'complete' && status !== 'error') && 'animate-pulse')} />
            </motion.div>
            <div>
              <p className={cn('font-medium', config.color)}>
                {statusMessage || config.label}
              </p>
              {modelName && (
                <p className="text-xs text-muted-foreground">{modelName}</p>
              )}
            </div>
          </div>

          {retryAttempt > 0 && (
            <Badge variant="outline" className="border-amber-500/50 text-amber-400">
              <RefreshCw className="h-3 w-3 mr-1" />
              Attempt {retryAttempt + 1}/{maxRetries}
            </Badge>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="relative h-2 overflow-hidden rounded-full bg-secondary">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-purple-500 to-cyan-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
            {/* Shimmer effect during loading */}
            {isGenerating && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
            )}
          </div>
        </div>

        {/* Countdown Timer */}
        {estimatedWaitTime > 0 && status === 'model-loading' && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-amber-400" />
            <span className="text-muted-foreground">Estimated wait:</span>
            <span className="font-mono text-amber-400">
              {countdown > 0 ? `${countdown}s` : 'Almost ready...'}
            </span>
          </div>
        )}

        {/* Tips Section */}
        <div className="space-y-2">
          <button
            onClick={() => setShowTips(!showTips)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Lightbulb className="h-3 w-3" />
            <span>Tips & Info</span>
            {showTips ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          
          <AnimatePresence>
            {showTips && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-lg bg-secondary/50 p-3 text-xs text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <motion.p
                      key={currentTip}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                    >
                      {TIPS[currentTip]}
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
