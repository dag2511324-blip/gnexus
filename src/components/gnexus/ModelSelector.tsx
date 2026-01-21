import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sparkles, Brain, Zap, Search, Code } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGnexus } from "@/contexts/GnexusContext";
import { AIModel } from "@/types/gnexus";

const iconMap = {
  sparkles: Sparkles,
  brain: Brain,
  zap: Zap,
  search: Search,
  code: Code,
};

export function ModelSelector() {
  const { currentModel, setCurrentModel, models } = useGnexus();
  const [isOpen, setIsOpen] = useState(false);

  const CurrentIcon = iconMap[currentModel.icon];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg bg-card border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
      >
        <CurrentIcon className="h-3 w-3 text-primary" />
        <span>{currentModel.name}</span>
        <ChevronDown className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute bottom-full left-0 mb-2 w-64 rounded-xl bg-card border border-border shadow-xl z-50 overflow-hidden"
            >
              <div className="p-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1.5">
                  G-CORE01 Models
                </p>
                {models.map((model) => {
                  const Icon = iconMap[model.icon];
                  const isSelected = model.id === currentModel.id;

                  return (
                    <button
                      key={model.id}
                      onClick={() => {
                        setCurrentModel(model);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-2 py-2 transition-colors",
                        isSelected
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-secondary"
                      )}
                    >
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg",
                        isSelected ? "bg-primary/20" : "bg-secondary"
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{model.name}</p>
                          {model.capabilities?.map(cap => (
                            <span key={cap} className="px-1 py-0.5 rounded-[3px] bg-background text-[8px] uppercase font-bold text-muted-foreground border border-border">
                              {cap}
                            </span>
                          ))}
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          {model.provider} • {model.description}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
