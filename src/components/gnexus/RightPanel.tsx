import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings2,
  CircleDot,
  Check,
  ChevronDown,
  Users,
  Target,
  Map,
  Layout,
  Zap,
  Search,
  BarChart,
  TrendingUp,
  Monitor,
  Smartphone,
  Globe,
  Code,
  MessageSquare,
  GitBranch,
  PenTool,
  Lightbulb,
  FlaskConical,
  Accessibility,
  Palette,
  Type,
  AlertTriangle,
  Rocket,
  Image,
  Video,
  Mic,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGnexus } from "@/contexts/GnexusContext";
import { Persona, CompetitorAnalysis } from "@/types/gnexus";

type TabId = "flow" | "context" | "tools";

interface PhaseProps {
  number: number;
  title: string;
  description: string;
  status: "completed" | "active" | "pending";
  time?: string;
  substeps?: { label: string; completed: boolean }[];
  expanded?: boolean;
}

const Phase = ({
  number,
  title,
  description,
  status,
  time,
  substeps,
  expanded: defaultExpanded = false,
}: PhaseProps) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div
      className={cn(
        "rounded-xl border transition-all duration-200",
        status === "active"
          ? "bg-card border-primary/30"
          : status === "completed"
          ? "bg-card/50 border-border"
          : "bg-transparent border-border/50"
      )}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start gap-3 p-3"
      >
        <div
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
            status === "completed" && "bg-accent/20 text-accent",
            status === "active" && "bg-primary/20 text-primary",
            status === "pending" && "bg-secondary text-muted-foreground"
          )}
        >
          {status === "completed" ? (
            <Check className="h-4 w-4" />
          ) : (
            number
          )}
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <h4
              className={cn(
                "font-medium",
                status === "pending" ? "text-muted-foreground" : "text-foreground"
              )}
            >
              {title}
            </h4>
            {status === "active" && (
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          {time && (
            <p className="text-[10px] text-muted-foreground mt-1 font-mono">{time}</p>
          )}
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform shrink-0 mt-1",
            expanded && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {expanded && substeps && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2">
              {substeps.map((step, i) => (
                <div key={i} className="flex items-center gap-2 pl-10">
                  <div
                    className={cn(
                      "h-4 w-4 rounded-full flex items-center justify-center",
                      step.completed
                        ? "bg-accent/20 text-accent"
                        : "border border-border"
                    )}
                  >
                    {step.completed && <Check className="h-2.5 w-2.5" />}
                  </div>
                  <span
                    className={cn(
                      "text-xs",
                      step.completed ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface PersonaCardProps {
  persona: Persona;
}

const PersonaCard = ({ persona }: PersonaCardProps) => (
  <div className="rounded-xl bg-card border border-border p-4 space-y-3">
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
        {persona.initials}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-foreground">{persona.name}</h4>
          <span
            className={cn(
              "text-[10px] font-medium px-2 py-0.5 rounded-full",
              persona.category === "primary"
                ? "bg-primary/10 text-primary"
                : "bg-accent/10 text-accent"
            )}
          >
            {persona.category === "primary" ? "Primary" : "Secondary"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{persona.role}</p>
      </div>
    </div>
    {persona.goals.length > 0 && (
      <div className="flex flex-wrap gap-1.5">
        {persona.goals.slice(0, 3).map((goal, i) => (
          <span
            key={i}
            className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground"
          >
            {goal.length > 30 ? goal.substring(0, 30) + '...' : goal}
          </span>
        ))}
      </div>
    )}
  </div>
);

interface InsightCardProps {
  type: "pain" | "opportunity" | "differentiator";
  title: string;
  description: string;
}

const InsightCard = ({ type, title, description }: InsightCardProps) => (
  <div
    className={cn(
      "rounded-lg p-3 space-y-1",
      type === "pain" && "bg-destructive/5 border border-destructive/20",
      type === "opportunity" && "bg-accent/5 border border-accent/20",
      type === "differentiator" && "bg-primary/5 border border-primary/20"
    )}
  >
    <div className="flex items-center gap-2">
      {type === "pain" && <CircleDot className="h-3 w-3 text-destructive" />}
      {type === "opportunity" && <Zap className="h-3 w-3 text-accent" />}
      {type === "differentiator" && <Lightbulb className="h-3 w-3 text-primary" />}
      <span
        className={cn(
          "text-xs font-medium",
          type === "pain" && "text-destructive",
          type === "opportunity" && "text-accent",
          type === "differentiator" && "text-primary"
        )}
      >
        {title}
      </span>
    </div>
    <p className="text-xs text-muted-foreground">{description}</p>
  </div>
);

interface ToolCardProps {
  icon: React.ReactNode;
  name: string;
  description: string;
  count?: number;
  onClick?: () => void;
}

const ToolCard = ({ icon, name, description, count, onClick }: ToolCardProps) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center gap-2 rounded-xl bg-card border border-border p-4 hover:bg-card-elevated hover:border-primary/30 transition-all group"
  >
    <div className="relative">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
        {icon}
      </div>
      {count !== undefined && count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
          {count}
        </span>
      )}
    </div>
    <div className="text-center">
      <p className="text-xs font-medium text-foreground">{name}</p>
      <p className="text-[10px] text-muted-foreground">{description}</p>
    </div>
  </button>
);

interface CompetitorItemProps {
  name: string;
  pros: string[];
  cons: string[];
}

const CompetitorItem = ({ name, pros, cons }: CompetitorItemProps) => (
  <div className="flex items-start gap-3 py-2">
    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-muted-foreground">
      {name.charAt(0)}
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-foreground">{name}</p>
      <div className="flex flex-wrap gap-2 mt-1 text-[10px]">
        {pros[0] && <span className="text-accent">+ {pros[0]}</span>}
        {cons[0] && <span className="text-destructive">- {cons[0]}</span>}
      </div>
    </div>
  </div>
);

export function RightPanel() {
  const [activeTab, setActiveTab] = useState<TabId>("flow");
  const { 
    workflowPhases, 
    openToolModal, 
    artifacts, 
    getPersonas, 
    getCompetitors,
    projectContext,
    updateProjectContext,
    getWorkflowProgress,
  } = useGnexus();

  const personas = getPersonas();
  const competitorAnalysis = getCompetitors();
  const progress = getWorkflowProgress();

  const personaCount = artifacts.filter(a => a.type === 'persona').length;
  const journeyCount = artifacts.filter(a => a.type === 'journey').length;

  const activePhases = workflowPhases.filter(p => p.status === 'active' || p.status === 'completed').length;

  const tabs = [
    { id: "flow" as TabId, label: "Flow", icon: Settings2 },
    { id: "context" as TabId, label: "Context", icon: CircleDot },
    { id: "tools" as TabId, label: "Tools", icon: Settings2 },
  ];

  const togglePlatform = (platform: 'desktop' | 'mobile' | 'web') => {
    const platforms = projectContext.platforms.includes(platform)
      ? projectContext.platforms.filter(p => p !== platform)
      : [...projectContext.platforms, platform];
    updateProjectContext({ platforms });
  };

  return (
    <aside className="flex h-full w-80 flex-col border-l border-border bg-sidebar">
      {/* Tabs */}
      <div className="flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors relative",
              activeTab === tab.id
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {activeTab === "flow" && (
            <motion.div
              key="flow"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-3"
            >
              {/* Progress Header */}
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Workflow Progress</h3>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {activePhases}/{workflowPhases.length} active
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-1 rounded-full bg-secondary overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-accent to-primary transition-all duration-500" 
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>

              {/* Phases */}
              <div className="space-y-2">
                {workflowPhases.map((phase) => (
                  <Phase
                    key={phase.number}
                    number={phase.number}
                    title={phase.title}
                    description={phase.description}
                    status={phase.status}
                    time={phase.time}
                    substeps={phase.substeps}
                    expanded={phase.status === 'active'}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "context" && (
            <motion.div
              key="context"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              {/* Personas from artifacts */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Personas</h3>
                  <button 
                    onClick={() => openToolModal('persona')}
                    className="text-[10px] text-primary hover:underline"
                  >
                    + Add
                  </button>
                </div>
                {personas.length > 0 ? (
                  personas.map((persona) => (
                    <PersonaCard key={persona.id} persona={persona} />
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground py-4 text-center border border-dashed border-border rounded-lg">
                    No personas yet. Create one using the Persona tool.
                  </p>
                )}
              </div>

              {/* Key Insights - generated from personas */}
              {personas.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold text-foreground">Key Insights</h3>
                  </div>
                  {personas[0]?.painPoints?.[0] && (
                    <InsightCard
                      type="pain"
                      title="Pain Point"
                      description={personas[0].painPoints[0]}
                    />
                  )}
                  {personas[0]?.goals?.[0] && (
                    <InsightCard
                      type="opportunity"
                      title="Opportunity"
                      description={personas[0].goals[0]}
                    />
                  )}
                </div>
              )}

              {/* Competitive Landscape */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold text-foreground">Competitors</h3>
                  </div>
                  <button 
                    onClick={() => openToolModal('competitor-analysis')}
                    className="text-[10px] text-primary hover:underline"
                  >
                    + Analyze
                  </button>
                </div>
                {competitorAnalysis?.competitors && competitorAnalysis.competitors.length > 0 ? (
                  <div className="divide-y divide-border">
                    {competitorAnalysis.competitors.map((comp, i) => (
                      <CompetitorItem
                        key={i}
                        name={comp.name}
                        pros={comp.pros}
                        cons={comp.cons}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground py-4 text-center border border-dashed border-border rounded-lg">
                    Run competitor analysis to see insights.
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "tools" && (
            <motion.div
              key="tools"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              {/* Design Tools */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Design Tools
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <ToolCard
                    icon={<Users className="h-5 w-5" />}
                    name="Persona"
                    description="User profiles"
                    count={personaCount}
                    onClick={() => openToolModal('persona')}
                  />
                  <ToolCard
                    icon={<Target className="h-5 w-5" />}
                    name="JTBD"
                    description="Jobs mapping"
                    onClick={() => openToolModal('jtbd')}
                  />
                  <ToolCard
                    icon={<Map className="h-5 w-5" />}
                    name="Journey"
                    description="User journey"
                    count={journeyCount}
                    onClick={() => openToolModal('journey')}
                  />
                  <ToolCard
                    icon={<GitBranch className="h-5 w-5" />}
                    name="Flow"
                    description="User flows"
                    onClick={() => openToolModal('flow')}
                  />
                  <ToolCard
                    icon={<Layout className="h-5 w-5" />}
                    name="Wireframe"
                    description="Layouts"
                    onClick={() => openToolModal('wireframe')}
                  />
                  <ToolCard
                    icon={<PenTool className="h-5 w-5" />}
                    name="Component"
                    description="UI specs"
                    onClick={() => openToolModal('component')}
                  />
                  <ToolCard
                    icon={<MessageSquare className="h-5 w-5" />}
                    name="Microcopy"
                    description="UX writing"
                    onClick={() => openToolModal('microcopy')}
                  />
                  <ToolCard
                    icon={<Code className="h-5 w-5" />}
                    name="Handoff"
                    description="Dev specs"
                    onClick={() => openToolModal('handoff')}
                  />
                </div>
              </div>

              {/* Advanced Tools */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Advanced Tools
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <ToolCard
                    icon={<FlaskConical className="h-5 w-5" />}
                    name="A/B Test"
                    description="Experiments"
                    onClick={() => openToolModal('ab-test')}
                  />
                  <ToolCard
                    icon={<Accessibility className="h-5 w-5" />}
                    name="A11y Check"
                    description="WCAG audit"
                    onClick={() => openToolModal('accessibility')}
                  />
                  <ToolCard
                    icon={<Palette className="h-5 w-5" />}
                    name="Colors"
                    description="Palette"
                    onClick={() => openToolModal('color-palette')}
                  />
                  <ToolCard
                    icon={<Type className="h-5 w-5" />}
                    name="Typography"
                    description="Font system"
                    onClick={() => openToolModal('typography')}
                  />
                  <ToolCard
                    icon={<AlertTriangle className="h-5 w-5" />}
                    name="Errors"
                    description="Messages"
                    onClick={() => openToolModal('error-message')}
                  />
                  <ToolCard
                    icon={<Rocket className="h-5 w-5" />}
                    name="Onboarding"
                    description="User flow"
                    onClick={() => openToolModal('onboarding')}
                  />
                </div>
              </div>

              {/* AI Generation */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  AI Generation
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <ToolCard
                    icon={<MessageSquare className="h-5 w-5" />}
                    name="Text AI"
                    description="Generate text"
                    onClick={() => openToolModal('text-generation')}
                  />
                  <ToolCard
                    icon={<Image className="h-5 w-5" />}
                    name="Image AI"
                    description="Create images"
                    onClick={() => openToolModal('image-generation')}
                  />
                  <ToolCard
                    icon={<Mic className="h-5 w-5" />}
                    name="Audio AI"
                    description="Speech tools"
                    onClick={() => openToolModal('audio-tool')}
                  />
                  <ToolCard
                    icon={<Video className="h-5 w-5" />}
                    name="Video AI"
                    description="Generate video"
                    onClick={() => openToolModal('video-generation')}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Analysis
                </h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => openToolModal('market-research')}
                    className="flex w-full items-center gap-3 rounded-xl bg-card border border-border p-3 hover:bg-card-elevated hover:border-primary/30 transition-all"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                      <Search className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">Market Research</p>
                      <p className="text-xs text-muted-foreground">Industry data & trends</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => openToolModal('competitor-analysis')}
                    className="flex w-full items-center gap-3 rounded-xl bg-card border border-border p-3 hover:bg-card-elevated hover:border-primary/30 transition-all"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                      <BarChart className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">Competitor Analysis</p>
                      <p className="text-xs text-muted-foreground">Feature comparison</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => openToolModal('trend-analysis')}
                    className="flex w-full items-center gap-3 rounded-xl bg-card border border-border p-3 hover:bg-card-elevated hover:border-primary/30 transition-all"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">Trend Analysis</p>
                      <p className="text-xs text-muted-foreground">Emerging patterns</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Target Platforms */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Target Platforms
                </h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => togglePlatform('desktop')}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-lg border px-4 py-3 transition-colors",
                      projectContext.platforms.includes('desktop')
                        ? "bg-primary/10 border-primary/20 text-primary"
                        : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Monitor className="h-5 w-5" />
                    <span className="text-[10px] font-medium">Desktop</span>
                  </button>
                  <button 
                    onClick={() => togglePlatform('mobile')}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-lg border px-4 py-3 transition-colors",
                      projectContext.platforms.includes('mobile')
                        ? "bg-primary/10 border-primary/20 text-primary"
                        : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Smartphone className="h-5 w-5" />
                    <span className="text-[10px] font-medium">Mobile</span>
                  </button>
                  <button 
                    onClick={() => togglePlatform('web')}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-lg border px-4 py-3 transition-colors",
                      projectContext.platforms.includes('web')
                        ? "bg-primary/10 border-primary/20 text-primary"
                        : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Globe className="h-5 w-5" />
                    <span className="text-[10px] font-medium">Web</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}
