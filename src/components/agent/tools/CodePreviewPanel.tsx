/**
 * Code Preview Panel
 * Monaco Editor-based code viewer with syntax highlighting and actions
 */

import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Download, Copy, Check, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CodePreviewPanelProps {
    code: string;
    language?: string;
    filename?: string;
    onClose?: () => void;
}

export function CodePreviewPanel({
    code,
    language = 'typescript',
    filename = 'code.tsx',
    onClose
}: CodePreviewPanelProps) {
    const [copied, setCopied] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        toast.success('Code copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success(`Downloaded ${filename}`);
    };

    const getLanguageFromFilename = (name: string): string => {
        const ext = name.split('.').pop()?.toLowerCase();
        const langMap: Record<string, string> = {
            'ts': 'typescript',
            'tsx': 'typescript',
            'js': 'javascript',
            'jsx': 'javascript',
            'py': 'python',
            'html': 'html',
            'css': 'css',
            'json': 'json',
            'md': 'markdown',
            'yml': 'yaml',
            'yaml': 'yaml',
        };
        return langMap[ext || ''] || 'plaintext';
    };

    const detectedLanguage = getLanguageFromFilename(filename);
    const lines = code.split('\n').length;
    const chars = code.length;

    return (
        <div
            className={`
                ${isFullscreen
                    ? 'fixed inset-0 z-50 bg-black'
                    : 'w-full h-full'
                }
                flex flex-col
            `}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#1e1e1e] border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500 cursor-pointer hover:opacity-80" onClick={onClose} />
                        <div className="w-3 h-3 rounded-full bg-yellow-500 cursor-pointer hover:opacity-80" />
                        <div className="w-3 h-3 rounded-full bg-green-500 cursor-pointer hover:opacity-80" />
                    </div>
                    <span className="text-sm font-mono text-gray-400">{filename}</span>
                    <span className="text-xs text-gray-600">
                        {lines} lines • {chars} chars
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                        className="h-8 text-gray-400 hover:text-white"
                    >
                        {copied ? (
                            <>
                                <Check className="w-4 h-4 mr-2" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4 mr-2" />
                                Copy
                            </>
                        )}
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDownload}
                        className="h-8 text-gray-400 hover:text-white"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="h-8 text-gray-400 hover:text-white"
                    >
                        {isFullscreen ? (
                            <Minimize2 className="w-4 h-4" />
                        ) : (
                            <Maximize2 className="w-4 h-4" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 overflow-hidden">
                <Editor
                    height="100%"
                    language={detectedLanguage}
                    value={code}
                    theme="vs-dark"
                    options={{
                        readOnly: true,
                        minimap: { enabled: lines > 50 },
                        scrollBeyondLastLine: false,
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
                        lineNumbers: 'on',
                        renderWhitespace: 'selection',
                        bracketPairColorization: { enabled: true },
                        guides: {
                            bracketPairs: true,
                            indentation: true,
                        },
                        smoothScrolling: true,
                        cursorBlinking: 'smooth',
                        padding: { top: 16, bottom: 16 },
                    }}
                    loading={
                        <div className="flex items-center justify-center h-full bg-[#1e1e1e] text-gray-400">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
                        </div>
                    }
                />
            </div>
        </div>
    );
}
