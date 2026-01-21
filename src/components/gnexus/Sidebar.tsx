import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Map,
  GitBranch,
  Layout,
  FileText,
  ChevronDown,
  Zap,
  Code,
  Sparkles,
  Trash2,
  Clock,
  Download,
  Archive,
  HelpCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useGnexus } from "@/contexts/GnexusContext";
import { ExportButton, ExportModal } from "@/components/export";
import { Button } from "@/components/ui/button";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  count?: number;
  onClick?: () => void;
}

const NavItem = ({ icon, label, active, count, onClick }: NavItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200",
      active
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
    )}
  >
    {icon}
    <span className="flex-1 text-left">{label}</span>
    {count !== undefined && count > 0 && (
      <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
        {count}
      </span>
    )}
  </button>
);

interface ArtifactItemProps {
  name: string;
  time: string;
  color: "primary" | "accent" | "warning";
  initials?: string;
  onDelete?: () => void;
  onExport?: () => void;
}

const ArtifactItem = ({ name, time, color, initials, onDelete, onExport }: ArtifactItemProps) => (
  <div className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-secondary transition-colors cursor-pointer group">
    {initials ? (
      <div className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold",
        color === "primary" && "bg-primary/20 text-primary",
        color === "accent" && "bg-accent/20 text-accent",
        color === "warning" && "bg-warning/20 text-warning"
      )}>
        {initials}
      </div>
    ) : (
      <div className={cn(
        "h-2 w-2 rounded-full",
        color === "primary" && "bg-primary",
        color === "accent" && "bg-accent",
        color === "warning" && "bg-warning"
      )} />
    )}
    <div className="flex-1 min-w-0">
      <p className="text-sm text-foreground truncate">{name}</p>
      {time && <p className="text-xs text-muted-foreground">{time}</p>}
    </div>
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
      {onExport && (
        <button
          onClick={(e) => { e.stopPropagation(); onExport(); }}
          className="p-1 hover:bg-primary/20 rounded transition-all"
          title="Export"
        >
          <Download className="h-3 w-3 text-primary" />
        </button>
      )}
      {onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1 hover:bg-destructive/20 rounded transition-all"
          title="Delete"
        >
          <Trash2 className="h-3 w-3 text-destructive" />
        </button>
      )}
    </div>
  </div>
);

export function Sidebar() {
  const {
    projectContext,
    artifacts,
    removeArtifact,
    messages,
    getWorkflowProgress,
    workflowPhases,
    session,
  } = useGnexus();
  const navigate = useNavigate();

  const [activeNav, setActiveNav] = useState("Chat");
  const [isProjectOpen, setIsProjectOpen] = useState(true);
  const [elapsedTime, setElapsedTime] = useState("00:00");
  const [showExportModal, setShowExportModal] = useState(false);

  // Calculate elapsed time
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

  const progress = getWorkflowProgress();
  const activePhase = workflowPhases.find(p => p.status === 'active');
  const completedPhases = workflowPhases.filter(p => p.status === 'completed').length;

  // Get artifact counts by type
  const journeyCount = artifacts.filter(a => a.type === 'journey').length;
  const flowCount = artifacts.filter(a => a.type === 'flow').length;
  const wireframeCount = artifacts.filter(a => a.type === 'wireframe').length;
  const componentCount = artifacts.filter(a => a.type === 'component').length;

  // Get recent artifacts for display
  const recentArtifacts = artifacts.slice(-5).reverse();

  const getArtifactColor = (type: string): "primary" | "accent" | "warning" => {
    if (type === 'persona' || type === 'jtbd') return 'primary';
    if (type === 'journey' || type === 'flow') return 'accent';
    return 'warning';
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getArtifactInitials = (artifact: any): string => {
    if (artifact.type === 'persona' && artifact.initials) return artifact.initials;
    if (artifact.type === 'persona' && artifact.name) {
      const parts = artifact.name.split(' ');
      return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : artifact.name.substring(0, 2).toUpperCase();
    }
    return artifact.type.substring(0, 2).toUpperCase();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getArtifactName = (artifact: any): string => {
    if (artifact.name) return artifact.name;
    if (artifact.type === 'jtbd' && artifact.userType) return `JTBD: ${artifact.userType}`;
    if (artifact.type === 'journey' && artifact.goal) return artifact.goal.substring(0, 30);
    if (artifact.type === 'flow') return artifact.name || 'User Flow';
    return artifact.type.charAt(0).toUpperCase() + artifact.type.slice(1);
  };

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-glow">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-semibold text-foreground">GNEXUS</span>
        <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-medium text-accent">
          LIVE
        </span>
      </div>

      {/* Project Info */}
      <div className="border-b border-border p-4">
        <button
          onClick={() => setIsProjectOpen(!isProjectOpen)}
          className="flex w-full items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
            <Layout className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium text-foreground">
              {projectContext.name || 'New Project'}
            </p>
            <p className="text-xs text-muted-foreground">
              <span className="text-accent">●</span> Active • Phase {activePhase?.number ?? 0}
            </p>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              isProjectOpen && "rotate-180"
            )}
          />
        </button>

        {isProjectOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4"
          >
            {/* Session Stats */}
            <div className="rounded-lg bg-card p-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-mono text-foreground">{elapsedTime}</span>
                </div>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-mono">
                  {completedPhases}/{workflowPhases.length} phases
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-2xl font-bold text-accent">{progress.percentage}%</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Complete</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{artifacts.length}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Artifacts</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MessageSquare className="h-3 w-3" />
                <span>{messages.length} messages</span>
                <span className="text-border">•</span>
                <span className="font-mono text-[10px]">{session.id}</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Workspace Navigation */}
      <div className="flex-1 overflow-y-auto p-3">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Workspace
        </p>
        <nav className="space-y-1">
          <NavItem
            icon={<MessageSquare className="h-4 w-4" />}
            label="Chat"
            active={activeNav === "Chat"}
            count={messages.length}
            onClick={() => setActiveNav("Chat")}
          />
          <NavItem
            icon={<Map className="h-4 w-4" />}
            label="Journey Map"
            active={activeNav === "Journey Map"}
            count={journeyCount}
            onClick={() => openToolModal('journey')}
          />
          <NavItem
            icon={<GitBranch className="h-4 w-4" />}
            label="User Flows"
            active={activeNav === "User Flows"}
            count={flowCount}
            onClick={() => openToolModal('flow')}
          />
          <NavItem
            icon={<Layout className="h-4 w-4" />}
            label="Wireframes"
            active={activeNav === "Wireframes"}
            count={wireframeCount}
            onClick={() => openToolModal('wireframe')}
          />
          <NavItem
            icon={<Code className="h-4 w-4" />}
            label="Components"
            active={activeNav === "Components"}
            count={componentCount}
            onClick={() => openToolModal('component')}
          />
          <NavItem
            icon={<FileText className="h-4 w-4" />}
            label="Documentation"
            active={activeNav === "Documentation"}
            onClick={() => {
              setActiveNav("Documentation");
              navigate("/ai-studio");
            }}
          />
          <NavItem
            icon={<Sparkles className="h-4 w-4" />}
            label="Gnexus Tools"
            active={activeNav === "Gnexus Tools"}
            onClick={() => {
              setActiveNav("Gnexus Tools");
              navigate("/tools");
            }}
          />
          <NavItem
            icon={<HelpCircle className="h-4 w-4" />}
            label="Help & Guide"
            active={activeNav === "Help & Guide"}
            onClick={() => {
              setActiveNav("Help & Guide");
              navigate("/ai-enhancement-guide");
            }}
          />
        </nav>

        {/* Artifacts */}
        <div className="mt-6">
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Recent Artifacts
            </p>
            <div className="flex items-center gap-2">
              {artifacts.length > 0 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[10px]"
                    onClick={() => setShowExportModal(true)}
                  >
                    <Archive className="h-3 w-3 mr-1" />
                    Export
                  </Button>
                  <span className="text-[10px] text-muted-foreground">{artifacts.length} total</span>
                </>
              )}
            </div>
          </div>
          <div className="space-y-1">
            {recentArtifacts.length > 0 ? (
              recentArtifacts.map((artifact) => (
                <ArtifactItem
                  key={artifact.id}
                  name={getArtifactName(artifact)}
                  time={formatTime(artifact.createdAt)}
                  color={getArtifactColor(artifact.type)}
                  initials={getArtifactInitials(artifact)}
                  onDelete={() => removeArtifact(artifact.id)}
                  onExport={() => {
                    import('@/lib/export-utils').then(({ exportToJSON }) => {
                      const name = getArtifactName(artifact);
                      exportToJSON(artifact, `${name.replace(/[^a-zA-Z0-9]/g, '_')}.json`);
                    });
                  }}
                />
              ))
            ) : (
              <p className="text-xs text-muted-foreground px-3 py-2">
                No artifacts yet. Use the tools to generate.
              </p>
            )}
          </div>
        </div>

        {/* Export Modal */}
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          artifacts={artifacts}
          messages={messages}
          projectContext={projectContext}
        />
      </div>

      {/* Session Info */}
      <div className="border-t border-border p-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            AI Status
          </p>
          <span className="flex items-center gap-1 text-[10px] text-accent">
            <Zap className="h-3 w-3" />
            Ready
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground">
          {projectContext.platforms.length > 0
            ? `Platforms: ${projectContext.platforms.join(', ')}`
            : 'Set project details to begin'}
        </p>
      </div>
    </aside>
  );
}
