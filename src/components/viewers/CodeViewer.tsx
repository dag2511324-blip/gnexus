import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Copy,
  Check,
  Download,
  Code,
  FileCode,
  WrapText,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface CodeViewerProps {
  code: string;
  language?: string;
  filename?: string;
  className?: string;
  onClose?: () => void;
  showLineNumbers?: boolean;
}

const LANGUAGE_COLORS: Record<string, string> = {
  typescript: 'bg-blue-500',
  javascript: 'bg-yellow-500',
  python: 'bg-green-500',
  rust: 'bg-orange-500',
  go: 'bg-cyan-500',
  java: 'bg-red-500',
  cpp: 'bg-purple-500',
  html: 'bg-orange-400',
  css: 'bg-blue-400',
  json: 'bg-gray-500',
  sql: 'bg-indigo-500',
  markdown: 'bg-gray-600',
};

const SYNTAX_PATTERNS: Record<string, RegExp[]> = {
  keyword: [
    /\b(const|let|var|function|class|return|if|else|for|while|import|export|from|async|await|try|catch|throw|new|this|super|extends|implements|interface|type|enum|namespace|module|declare|readonly|abstract|private|public|protected|static|override|get|set|as|in|of|typeof|instanceof)\b/g,
  ],
  string: [/"[^"]*"|'[^']*'|`[^`]*`/g],
  comment: [/\/\/.*$/gm, /\/\*[\s\S]*?\*\//g],
  number: [/\b\d+\.?\d*\b/g],
  function: [/\b([a-zA-Z_]\w*)\s*\(/g],
  type: [/\b([A-Z][a-zA-Z0-9]*)\b/g],
};

export function CodeViewer({
  code,
  language = 'typescript',
  filename,
  className,
  onClose,
  showLineNumbers = true,
}: CodeViewerProps) {
  const [copied, setCopied] = useState(false);
  const [wordWrap, setWordWrap] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const extensions: Record<string, string> = {
      typescript: 'ts',
      javascript: 'js',
      python: 'py',
      rust: 'rs',
      go: 'go',
      java: 'java',
      cpp: 'cpp',
      html: 'html',
      css: 'css',
      json: 'json',
      sql: 'sql',
      markdown: 'md',
    };
    const ext = extensions[language] || 'txt';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `code-${Date.now()}.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const highlightCode = (text: string): string => {
    let result = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Apply syntax highlighting
    SYNTAX_PATTERNS.comment.forEach((pattern) => {
      result = result.replace(pattern, '<span class="text-muted-foreground/60">$&</span>');
    });
    SYNTAX_PATTERNS.string.forEach((pattern) => {
      result = result.replace(pattern, '<span class="text-success">$&</span>');
    });
    SYNTAX_PATTERNS.keyword.forEach((pattern) => {
      result = result.replace(pattern, '<span class="text-primary font-medium">$&</span>');
    });
    SYNTAX_PATTERNS.number.forEach((pattern) => {
      result = result.replace(pattern, '<span class="text-warning">$&</span>');
    });
    SYNTAX_PATTERNS.type.forEach((pattern) => {
      result = result.replace(pattern, '<span class="text-accent">$&</span>');
    });

    return result;
  };

  const lines = code.split('\n');
  const lineCount = lines.length;
  const lineNumberWidth = String(lineCount).length * 10 + 20;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl overflow-hidden bg-secondary/30 border border-border',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-secondary/50 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-destructive/60" />
            <div className="h-3 w-3 rounded-full bg-warning/60" />
            <div className="h-3 w-3 rounded-full bg-success/60" />
          </div>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'h-2 w-2 rounded-full',
                LANGUAGE_COLORS[language] || 'bg-muted-foreground'
              )}
            />
            <span className="text-sm text-muted-foreground">
              {filename || `code.${language}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Select value={language} disabled>
            <SelectTrigger className="h-7 w-28 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="typescript">TypeScript</SelectItem>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            className={cn('h-7 w-7', wordWrap && 'text-primary')}
            onClick={() => setWordWrap(!wordWrap)}
            title="Toggle word wrap"
          >
            <WrapText className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleCopy}
            title="Copy code"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-success" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleDownload}
            title="Download"
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onClose}
              title="Close"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Code content */}
      <div className="overflow-auto max-h-[500px]">
        <pre
          className={cn(
            'p-4 text-sm font-mono',
            wordWrap ? 'whitespace-pre-wrap' : 'whitespace-pre'
          )}
        >
          <code className="flex">
            {showLineNumbers && (
              <div
                className="select-none text-muted-foreground/50 text-right pr-4 border-r border-border mr-4"
                style={{ minWidth: lineNumberWidth }}
              >
                {lines.map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
            )}
            <div className="flex-1">
              {lines.map((line, i) => (
                <div
                  key={i}
                  className="hover:bg-muted/30 -mx-2 px-2"
                  dangerouslySetInnerHTML={{ __html: highlightCode(line) || '\u00A0' }}
                />
              ))}
            </div>
          </code>
        </pre>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-secondary/30 border-t border-border text-xs text-muted-foreground flex items-center justify-between">
        <span>{lineCount} lines</span>
        <span>{new Blob([code]).size} bytes</span>
      </div>
    </motion.div>
  );
}
