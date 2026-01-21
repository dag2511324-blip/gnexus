import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Copy,
  Check,
  Download,
  FileText,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface TextViewerProps {
  text: string;
  title?: string;
  className?: string;
  onClose?: () => void;
  maxHeight?: number;
}

export function TextViewer({
  text,
  title = 'Generated Text',
  className,
  onClose,
  maxHeight = 400,
}: TextViewerProps) {
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('left');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `text-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const charCount = text.length;
  const paragraphs = text.split(/\n\n+/).filter(Boolean).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl overflow-hidden bg-card border border-border',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h4 className="font-medium text-foreground text-sm">{title}</h4>
            <p className="text-xs text-muted-foreground">
              {wordCount} words · {charCount} characters · {paragraphs} paragraphs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleCopy}
            title="Copy text"
          >
            {copied ? (
              <Check className="h-4 w-4 text-success" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleDownload}
            title="Download"
          >
            <Download className="h-4 w-4" />
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onClose}
              title="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-secondary/20 border-b border-border">
        <div className="flex items-center gap-4">
          {/* Alignment */}
          <div className="flex items-center gap-1 bg-secondary/50 rounded-md p-0.5">
            <Button
              variant="ghost"
              size="icon"
              className={cn('h-7 w-7', alignment === 'left' && 'bg-background')}
              onClick={() => setAlignment('left')}
            >
              <AlignLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn('h-7 w-7', alignment === 'center' && 'bg-background')}
              onClick={() => setAlignment('center')}
            >
              <AlignCenter className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn('h-7 w-7', alignment === 'right' && 'bg-background')}
              onClick={() => setAlignment('right')}
            >
              <AlignRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Font size */}
          <div className="flex items-center gap-2">
            <Type className="h-3.5 w-3.5 text-muted-foreground" />
            <Slider
              value={[fontSize]}
              min={10}
              max={24}
              step={1}
              onValueChange={(v) => setFontSize(v[0])}
              className="w-20"
            />
            <span className="text-xs text-muted-foreground w-6">{fontSize}</span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3 w-3 mr-1" /> Collapse
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" /> Expand
            </>
          )}
        </Button>
      </div>

      {/* Content */}
      <div
        className="p-6 overflow-auto"
        style={{ maxHeight: isExpanded ? 'none' : maxHeight }}
      >
        <div
          className="prose prose-invert max-w-none"
          style={{
            fontSize: `${fontSize}px`,
            textAlign: alignment,
            lineHeight: 1.7,
          }}
        >
          {text.split(/\n\n+/).map((paragraph, i) => (
            <p key={i} className="mb-4 last:mb-0 text-foreground/90">
              {paragraph.split('\n').map((line, j) => (
                <span key={j}>
                  {line}
                  {j < paragraph.split('\n').length - 1 && <br />}
                </span>
              ))}
            </p>
          ))}
        </div>
      </div>

      {/* Gradient fade for collapsed state */}
      {!isExpanded && text.length > 500 && (
        <div className="h-12 bg-gradient-to-t from-card to-transparent -mt-12 relative pointer-events-none" />
      )}
    </motion.div>
  );
}
