
import { ReactNode } from "react";
import { Loader2, Sparkles, AlertCircle, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MermaidViewer } from "./viewers/MermaidViewer";

interface ToolInterfaceProps {
    title: string;
    description: string;
    icon: ReactNode;
    children: ReactNode;
    result: unknown;
    error: string | null;
    isLoading: boolean;
    onGenerate: () => void;
    onClose?: () => void; // Optional, as pages might not have a close button
    onReset: () => void;
    footerInfo: string;
}

export function ToolInterface({
    title,
    description,
    icon,
    children,
    result,
    error,
    isLoading,
    onGenerate,
    onClose,
    onReset,
    footerInfo,
}: ToolInterfaceProps) {

    // Helper to clean code fences if the AI adds them
    const cleanContent = (content: string) => {
        if (!content) return '';
        return content.trim()
            .replace(/^```(mermaid|tsx|jsx|react|javascript|typescript|json)?\s*/i, '')
            .replace(/```$/, '')
            .trim();
    };

    return (
        <div className="flex flex-col h-full bg-card">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        {icon}
                    </div>
                    <div>
                        <h2 className="font-semibold text-foreground">{title}</h2>
                        <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
                {error && (
                    <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                    </div>
                )}

                {!result ? (
                    <div className="space-y-4">
                        {children}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-accent">
                            <Sparkles className="h-4 w-4" />
                            <span className="text-sm font-medium">Generated Successfully</span>
                        </div>

                        {/* Advanced Visualization Renderers */}
                        {(result as any).mermaidChart && (
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium">Visualization</h3>
                                <MermaidViewer chart={cleanContent((result as any).mermaidChart)} />
                            </div>
                        )}

                        {/* Image Result */}
                        {(result as any).imageUrl && (
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium">Generated Image</h3>
                                <div className="rounded-xl overflow-hidden border border-border bg-black/5">
                                    <img
                                        src={(result as any).imageUrl}
                                        alt="Generated"
                                        className="w-full h-auto object-contain max-h-[500px]"
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open((result as any).imageUrl, '_blank')}
                                    >
                                        Download / Open Full Size
                                    </Button>
                                </div>
                            </div>
                        )}

                        {(result as any).reactCode && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-medium">React Code</h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 gap-1"
                                        onClick={() => navigator.clipboard.writeText(cleanContent((result as any).reactCode))}
                                    >
                                        <Copy className="h-3 w-3" />
                                        Copy
                                    </Button>
                                </div>
                                <pre className="rounded-xl bg-secondary p-4 text-xs text-foreground overflow-auto max-h-80 font-mono">
                                    {cleanContent((result as any).reactCode)}
                                </pre>
                            </div>
                        )}

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium">JSON Data</h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 gap-1"
                                    onClick={() => navigator.clipboard.writeText(JSON.stringify(result, null, 2))}
                                >
                                    <Copy className="h-3 w-3" />
                                    Copy
                                </Button>
                            </div>
                            <pre className="rounded-xl bg-secondary p-4 text-xs text-foreground overflow-auto max-h-40 font-mono opacity-80 hover:opacity-100 transition-opacity">
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border px-6 py-4 bg-card mt-auto">
                <p className="text-xs text-muted-foreground">
                    {footerInfo}
                </p>
                <div className="flex gap-2">
                    {result ? (
                        <>
                            <Button variant="outline" onClick={onReset}>
                                Generate Another
                            </Button>
                            {onClose && (
                                <Button onClick={onClose}>
                                    Done
                                </Button>
                            )}
                        </>
                    ) : (
                        <>
                            {onClose && (
                                <Button variant="outline" onClick={onClose}>
                                    Cancel
                                </Button>
                            )}
                            <Button onClick={onGenerate} disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4 mr-2" />
                                        Generate
                                    </>
                                )}
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
