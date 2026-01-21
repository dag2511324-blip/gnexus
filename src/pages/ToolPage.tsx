
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGnexus } from "@/contexts/GnexusContext";
import { ALL_TOOLS } from "@/lib/tools-data";
import { ToolInterface } from "@/components/gnexus/ToolInterface";
import { ToolInput } from "@/components/gnexus/ToolModal";
import { ToolType } from "@/types/gnexus";

export default function ToolPage() {
    const { toolId } = useParams<{ toolId: string }>();
    const { generateArtifact, currentModel } = useGnexus();

    const [inputs, setInputs] = useState<Record<string, string>>({});
    const [result, setResult] = useState<unknown>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const toolDef = ALL_TOOLS.find(t => t.id === toolId);

    useEffect(() => {
        // Reset state when tool changes
        setInputs({});
        setResult(null);
        setError(null);
    }, [toolId]);

    if (!toolDef) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold mb-2">Tool Not Found</h1>
                <p className="text-muted-foreground mb-4">The tool "{toolId}" does not exist.</p>
                <Link to="/ai-studio">
                    <Button>Back to AI Studio</Button>
                </Link>
            </div>
        );
    }

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const artifact = await generateArtifact(toolDef.id, inputs);
            if (artifact) {
                setResult(artifact);
            } else {
                setError('Failed to generate. Please try again.');
            }
        } catch (err) {
            setError('An error occurred during generation.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setResult(null);
        setError(null);
    };

    const handleChange = (key: string, value: string) => {
        setInputs((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Page Header */}
            <header className="border-b border-border bg-card px-6 py-4">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <Link to="/ai-studio">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Link to="/ai-studio" className="hover:text-foreground transition-colors">AI Studio</Link>
                        <span>/</span>
                        <span className="text-foreground font-medium">{toolDef.name}</span>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 p-6 md:p-8">
                <div className="max-w-4xl mx-auto h-[80vh] bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                    <ToolInterface
                        title={toolDef.name}
                        description={toolDef.description}
                        icon={<toolDef.icon className="h-5 w-5" />}
                        result={result}
                        error={error}
                        isLoading={isLoading}
                        onGenerate={handleGenerate}
                        onReset={handleReset}
                        // No onClose for page view
                        footerInfo={`GNEXUS • ${currentModel.name}`}
                    >
                        {toolDef.inputFields.map((field) => (
                            <ToolInput
                                key={field.key}
                                label={field.label}
                                value={inputs[field.key] || ''}
                                onChange={(v) => handleChange(field.key, v)}
                                placeholder={field.placeholder}
                                multiline={field.multiline}
                                type={field.type}
                                accept={field.accept}
                                options={field.options}
                            />
                        ))}
                    </ToolInterface>
                </div>
            </main>
        </div>
    );
}
