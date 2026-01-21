
import { GnexusToolsGrid } from "@/components/gnexus/GnexusToolsGrid";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function ToolsIndex() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-surface-1 to-surface-2">
            {/* Header */}
            <header className="border-b border-border/50 bg-card-glass/90 backdrop-blur-xl sticky top-0 z-50 shadow-glass">
                <div className="container-modern py-6">
                    <div className="flex items-center gap-6">
                        <Link to="/ai-studio">
                            <Button variant="ghost" size="icon" className="hover:bg-card/50 transition-colors">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold font-display bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
                                <Sparkles className="h-6 w-6 text-primary" />
                                Gnexus AI Tools
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Specialized AI tools for design, code, business, and more.
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="container-modern py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <GnexusToolsGrid />
                </motion.div>
            </main>
        </div>
    );
}
