/**
 * CODE CANVAS EDITOR
 * 
 * A Gemini-style code editor and live preview panel that appears when code is being generated.
 * Features Monaco Editor (VS Code's editor) with syntax highlighting and a sandboxed live preview.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import {
    X,
    Code2,
    Play,
    Copy,
    Download,
    Maximize2,
    Minimize2,
    Eye,
    EyeOff,
    Code,
    Monitor,
    Columns2,
    ChevronRight,
    ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// =============================================================================
// TYPES
// =============================================================================

export type ViewMode = 'code' | 'preview' | 'split';

export interface CodeBlock {
    code: string;
    language: string;
    filename?: string;
}

interface CodeCanvasEditorProps {
    codeBlocks: CodeBlock[];
    isVisible: boolean;
    onClose: () => void;
}

// =============================================================================
// UTILITIES
// =============================================================================

/**
 * Generate preview HTML for different language types
 */
const generatePreviewHTML = (codeBlocks: CodeBlock[]): string => {
    const htmlBlock = codeBlocks.find(b => b.language === 'html' || b.language === 'htm');
    const cssBlock = codeBlocks.find(b => b.language === 'css');
    const jsBlock = codeBlocks.find(b => b.language === 'javascript' || b.language === 'js');

    // If we have HTML, use it as base
    if (htmlBlock) {
        let html = htmlBlock.code;

        // Inject CSS if available
        if (cssBlock) {
            const styleTag = `<style>${cssBlock.code}</style>`;
            // Try to insert before </head> or at the start
            if (html.includes('</head>')) {
                html = html.replace('</head>', `${styleTag}</head>`);
            } else if (html.includes('<head>')) {
                html = html.replace('<head>', `<head>${styleTag}`);
            } else {
                html = `${styleTag}${html}`;
            }
        }

        // Inject JS if available
        if (jsBlock) {
            const scriptTag = `<script>${jsBlock.code}</script>`;
            // Try to insert before </body> or at the end
            if (html.includes('</body>')) {
                html = html.replace('</body>', `${scriptTag}</body>`);
            } else {
                html = `${html}${scriptTag}`;
            }
        }

        return html;
    }

    // If no HTML, build a simple page
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview</title>
    ${cssBlock ? `<style>${cssBlock.code}</style>` : ''}
</head>
<body>
    ${htmlBlock?.code || '<div style="padding: 20px; text-align: center; color: #666;">No HTML content to preview</div>'}
    ${jsBlock ? `<script>${jsBlock.code}</script>` : ''}
</body>
</html>
    `.trim();
};

/**
 * Detect if code is previewable (HTML/CSS/JS)
 */
const isPreviewable = (codeBlocks: CodeBlock[]): boolean => {
    return codeBlocks.some(b =>
        ['html', 'htm', 'css', 'javascript', 'js'].includes(b.language.toLowerCase())
    );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function CodeCanvasEditor({ codeBlocks, isVisible, onClose }: CodeCanvasEditorProps) {
    const [selectedBlockIndex, setSelectedBlockIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    // Default to 'code' for single files, 'split' for multiple files
    const [viewMode, setViewMode] = useState<ViewMode>(codeBlocks.length === 1 ? 'code' : 'split');
    const [copied, setCopied] = useState(false);
    const [previewKey, setPreviewKey] = useState(0);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const selectedBlock = codeBlocks[selectedBlockIndex] || codeBlocks[0];
    const canPreview = isPreviewable(codeBlocks);

    // Auto-refresh preview when code changes
    useEffect(() => {
        if (canPreview && (viewMode === 'preview' || viewMode === 'split')) {
            setPreviewKey(prev => prev + 1);
        }
    }, [codeBlocks, canPreview, viewMode]);

    // Handle copy to clipboard
    const handleCopy = useCallback(async () => {
        if (!selectedBlock) return;

        await navigator.clipboard.writeText(selectedBlock.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [selectedBlock]);

    // Handle download
    const handleDownload = useCallback(() => {
        if (!selectedBlock) return;

        const blob = new Blob([selectedBlock.code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = selectedBlock.filename || `code.${selectedBlock.language}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [selectedBlock]);

    // Handle preview refresh
    const handleRefreshPreview = useCallback(() => {
        setPreviewKey(prev => prev + 1);
    }, []);

    if (!isVisible || codeBlocks.length === 0) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    className={`${isFullscreen
                            ? 'fixed inset-0 z-50'
                            : 'w-3/4 border-l'
                        } bg-[#0a0a0a]/95 backdrop-blur-xl border-white/10 flex flex-col`}
                >
                    {/* Header */}
                    <header className="h-14 border-b border-white/10 flex items-center justify-between px-4 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                                <Code2 className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold text-gray-200">Code Canvas</h2>
                                <p className="text-xs text-gray-500">
                                    {selectedBlock?.filename || `${selectedBlock?.language.toUpperCase()} Code`}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Copy Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleCopy}
                                className="text-gray-400 hover:text-gray-200"
                                title="Copy code"
                            >
                                {copied ? (
                                    <motion.div
                                        initial={{ scale: 0.8 }}
                                        animate={{ scale: 1 }}
                                        className="text-green-400"
                                    >
                                        ✓
                                    </motion.div>
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )}
                            </Button>

                            {/* Download Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleDownload}
                                className="text-gray-400 hover:text-gray-200"
                                title="Download code"
                            >
                                <Download className="w-4 h-4" />
                            </Button>

                            {/* Divider */}
                            <div className="h-6 w-px bg-white/10" />

                            {/* View Mode Toggles */}
                            {canPreview && (
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setViewMode('code')}
                                        className={`h-7 px-2 text-xs ${viewMode === 'code'
                                            ? 'bg-cyan-500/20 text-cyan-400'
                                            : 'text-gray-400 hover:text-gray-200'
                                            }`}
                                        title="Code only"
                                    >
                                        <Code className="w-3 h-3 mr-1" />
                                        Code
                                    </Button>

                                    {/* Show Split only for multiple files */}
                                    {codeBlocks.length > 1 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setViewMode('split')}
                                            className={`h-7 px-2 text-xs ${viewMode === 'split'
                                                ? 'bg-cyan-500/20 text-cyan-400'
                                                : 'text-gray-400 hover:text-gray-200'
                                                }`}
                                            title="Split view"
                                        >
                                            <Columns2 className="w-3 h-3 mr-1" />
                                            Split
                                        </Button>
                                    )}

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setViewMode('preview')}
                                        className={`h-7 px-2 text-xs ${viewMode === 'preview'
                                            ? 'bg-cyan-500/20 text-cyan-400'
                                            : 'text-gray-400 hover:text-gray-200'
                                            }`}
                                        title="Preview only"
                                    >
                                        <Monitor className="w-3 h-3 mr-1" />
                                        Preview
                                    </Button>
                                </div>
                            )}

                            {/* Divider */}
                            <div className="h-6 w-px bg-white/10" />

                            {/* Refresh Preview */}
                            {canPreview && viewMode !== 'code' && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleRefreshPreview}
                                    className="text-gray-400 hover:text-gray-200"
                                    title="Refresh preview"
                                >
                                    <Play className="w-4 h-4" />
                                </Button>
                            )}

                            {/* Fullscreen Toggle */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsFullscreen(!isFullscreen)}
                                className="text-gray-400 hover:text-gray-200"
                                title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                            >
                                {isFullscreen ? (
                                    <Minimize2 className="w-4 h-4" />
                                ) : (
                                    <Maximize2 className="w-4 h-4" />
                                )}
                            </Button>

                            {/* Close Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-200"
                                title="Close"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </header>

                    {/* File Tabs (if multiple code blocks) */}
                    {codeBlocks.length > 1 && (
                        <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10 overflow-x-auto">
                            {codeBlocks.map((block, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedBlockIndex(index)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${index === selectedBlockIndex
                                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                        }`}
                                >
                                    {block.filename || `${block.language}.${block.language}`}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Content Area */}
                    <div className="flex-1 flex overflow-hidden">
                        {/* Code Editor - Show if viewMode is 'code' or 'split' */}
                        {(viewMode === 'code' || viewMode === 'split') && (
                            <div className={`${viewMode === 'split' && canPreview ? 'w-1/2 border-r border-white/10' : 'w-full'
                                }`}>
                                <Editor
                                    height="100%"
                                    language={selectedBlock?.language || 'plaintext'}
                                    value={selectedBlock?.code || ''}
                                    theme="vs-dark"
                                    options={{
                                        readOnly: true,
                                        minimap: { enabled: true },
                                        fontSize: 14,
                                        lineNumbers: 'on',
                                        scrollBeyondLastLine: false,
                                        automaticLayout: true,
                                        wordWrap: 'on',
                                        padding: { top: 16, bottom: 16 },
                                    }}
                                />
                            </div>
                        )}

                        {/* Live Preview - Show if viewMode is 'preview' or 'split' */}
                        {(viewMode === 'preview' || viewMode === 'split') && canPreview && (
                            <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'
                                } bg-white flex flex-col`}>
                                {/* Preview Header */}
                                <div className="h-10 bg-gray-100 border-b border-gray-300 flex items-center px-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                                        </div>
                                        <span className="text-xs text-gray-600 ml-2 font-mono">Live Preview</span>
                                    </div>
                                </div>

                                {/* Preview iframe */}
                                <iframe
                                    key={previewKey}
                                    ref={iframeRef}
                                    srcDoc={generatePreviewHTML(codeBlocks)}
                                    sandbox="allow-scripts allow-forms allow-modals allow-popups allow-presentation"
                                    className="flex-1 w-full border-0"
                                    title="Code Preview"
                                />
                            </div>
                        )}
                    </div>

                    {/* Footer Status Bar */}
                    <footer className="h-8 border-t border-white/10 bg-[#050505] flex items-center justify-between px-4 text-xs text-gray-500 font-mono">
                        <div className="flex items-center gap-4">
                            <span>{selectedBlock?.language.toUpperCase()}</span>
                            <span>{selectedBlock?.code.split('\n').length} lines</span>
                            <span>{selectedBlock?.code.length} chars</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span>Ready</span>
                        </div>
                    </footer>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
