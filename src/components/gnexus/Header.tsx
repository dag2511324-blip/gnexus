import { useState, useEffect } from "react";
import { 
  ChevronRight, 
  Columns, 
  Maximize2, 
  Settings, 
  Plus,
  Search,
  Clock,
  MessageSquare,
  RotateCcw,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGnexus } from "@/contexts/GnexusContext";
import { ExportModal } from "@/components/export";
import { AIQuickActions } from "./AIQuickActions";

export function Header() {
  const { projectContext, session, messages, workflowPhases, clearMessages, artifacts, openToolModal } = useGnexus();
  const [showExportModal, setShowExportModal] = useState(false);
  const [elapsedTime, setElapsedTime] = useState("00:00");

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const diff = now.getTime() - session.startTime.getTime();
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setElapsedTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [session.startTime]);

  // Keyboard shortcuts for AI tools
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'v':
            e.preventDefault();
            openToolModal('video-generation');
            break;
          case 'i':
            e.preventDefault();
            openToolModal('image-generation');
            break;
          case 'a':
            e.preventDefault();
            openToolModal('audio-tool');
            break;
          case 't':
            e.preventDefault();
            openToolModal('text-generation');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openToolModal]);

  const handleAIAction = (actionId: 'video' | 'image' | 'audio' | 'text') => {
    const toolMap: Record<string, 'video-generation' | 'image-generation' | 'audio-tool' | 'text-generation'> = {
      video: 'video-generation',
      image: 'image-generation',
      audio: 'audio-tool',
      text: 'text-generation',
    };
    openToolModal(toolMap[actionId]);
  };

  const activePhase = workflowPhases.find(p => p.status === 'active');

  return (
    <header className="flex h-12 items-center justify-between border-b border-border bg-sidebar px-4">
      {/* Left: Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-glow">
            <span className="text-[10px] font-bold text-primary-foreground">G</span>
          </div>
          <span className="font-semibold text-foreground">GNEXUS</span>
          <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
            v2.0
          </span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Projects</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-foreground">
          {projectContext.name || 'New Project'}
        </span>
        {activePhase && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Phase {activePhase.number}
          </span>
        )}
      </div>

      {/* Center: AI Quick Actions + Session Info */}
      <div className="flex items-center gap-4">
        <AIQuickActions variant="compact" onActionClick={handleAIAction} />
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2 text-sm">
          <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
          <span className="text-muted-foreground">Session</span>
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="font-mono text-foreground">{elapsedTime}</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm">
          <MessageSquare className="h-3 w-3 text-muted-foreground" />
          <span className="text-muted-foreground">{messages.length} msgs</span>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">{session.id}</span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button 
          onClick={clearMessages}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
          title="New Session"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button 
          onClick={() => setShowExportModal(true)}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
          title="Export Project"
        >
          <Download className="h-4 w-4" />
        </button>
        <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
          <Columns className="h-4 w-4" />
        </button>
        <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
          <Maximize2 className="h-4 w-4" />
        </button>
        <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
          <Search className="h-4 w-4" />
        </button>
        <Button size="sm" className="h-8 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
        <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
          <Settings className="h-4 w-4" />
        </button>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        artifacts={artifacts}
        messages={messages}
        projectContext={projectContext}
      />
    </header>
  );
}
