
import { motion } from "framer-motion";
import { ALL_TOOLS } from "@/lib/tools-data";
import { useGnexus } from "@/contexts/GnexusContext";
import { ToolType } from "@/types/gnexus";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export function GnexusToolsGrid() {
    const { openToolModal } = useGnexus();

    const categories = [
        { id: 'media', label: 'Media & Vision', color: 'text-pink-500', bg: 'bg-pink-500/10' },
        { id: 'code', label: 'Code & Engineering', color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { id: 'content', label: 'Content & Productivity', color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { id: 'business', label: 'Business & Legal', color: 'text-green-500', bg: 'bg-green-500/10' },
        { id: 'lifestyle', label: 'Lifestyle', color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { id: 'creative', label: 'Creative & Utility', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    ];

    return (
        <div className="space-y-8">
            {categories.map((category) => {
                const tools = ALL_TOOLS.filter(t => t.category === category.id);
                if (tools.length === 0) return null;

                return (
                    <div key={category.id} className="space-y-4">
                        <h3 className={cn("text-lg font-semibold flex items-center gap-2", category.color)}>
                            <span className={cn("h-6 w-1 rounded-full", category.bg.replace('/10', ''))} />
                            {category.label}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {tools.map((tool, index) => {
                                const Icon = tool.icon;
                                return (
                                    <Link to={`/tools/${tool.id}`} key={tool.id}>
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="group cursor-pointer rounded-xl border border-border bg-card p-4 hover:border-primary/50 hover:shadow-lg transition-all h-full"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className={cn("p-2 rounded-lg transition-colors", category.bg, "group-hover:bg-opacity-80")}>
                                                    <Icon className={cn("h-5 w-5", category.color)} />
                                                </div>
                                            </div>
                                            <h4 className="font-medium text-foreground mb-1 group-hover:text-primary transition-colors">
                                                {tool.name}
                                            </h4>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {tool.description}
                                            </p>
                                        </motion.div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
