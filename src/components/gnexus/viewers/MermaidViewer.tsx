import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Maximize, Minimize, ZoomIn, ZoomOut, RotateCcw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MermaidViewerProps {
    chart: string;
    className?: string;
    onDownload?: () => void;
}

mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: 'Inter, sans-serif',
});

export function MermaidViewer({ chart, className = '', onDownload }: MermaidViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [svg, setSvg] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const renderChart = async () => {
            if (!chart) return;

            try {
                setError(null);
                const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
                const { svg } = await mermaid.render(id, chart);
                setSvg(svg);
            } catch (err) {
                console.error('Mermaid render error:', err);
                setError('Failed to render diagram. Syntax might be invalid.');
            }
        };

        renderChart();
    }, [chart]);

    const handleDownloadInternal = () => {
        if (onDownload) {
            onDownload();
            return;
        }

        // Fallback download if no handler provided
        const blob = new Blob([chart], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `diagram-${Date.now()}.mmd`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (error) {
        return (
            <div className="flex items-center justify-center p-8 text-destructive border border-destructive/20 rounded-lg bg-destructive/10">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className={`relative border border-border rounded-lg bg-card/50 overflow-hidden ${className}`}>
            <div className="absolute top-2 right-2 z-10 flex gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleDownloadInternal} title="Download Source">
                    <Download className="h-4 w-4" />
                </Button>
            </div>

            <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={4}
                centerOnInit
            >
                {({ zoomIn, zoomOut, resetTransform }) => (
                    <>
                        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 bg-card/80 backdrop-blur rounded-lg border border-border/50 p-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => zoomIn()}>
                                <ZoomIn className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => zoomOut()}>
                                <ZoomOut className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => resetTransform()}>
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        </div>

                        <TransformComponent wrapperClass="w-full h-[400px]" contentClass="w-full h-full">
                            <div
                                ref={containerRef}
                                className="w-full h-full flex items-center justify-center p-4 min-h-[400px]"
                                dangerouslySetInnerHTML={{ __html: svg }}
                            />
                        </TransformComponent>
                    </>
                )}
            </TransformWrapper>
        </div>
    );
}
