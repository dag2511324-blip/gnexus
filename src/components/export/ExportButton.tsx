import { useState } from 'react';
import { Download, FileJson, FileText, Archive, Loader2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import {
  exportToJSON,
  exportToMarkdown,
  artifactToMarkdown,
  exportAllArtifactsZIP,
  copyToClipboard,
  downloadDataUrl,
  getExtensionFromDataUrl,
} from '@/lib/export-utils';
import type { Artifact, Message } from '@/types/gnexus';

interface ExportButtonProps {
  // For single artifact export
  artifact?: Artifact;
  // For bulk export
  allArtifacts?: Artifact[];
  // Project name for file naming
  projectName?: string;
  // For direct media download
  mediaUrl?: string;
  mediaType?: 'image' | 'audio' | 'video' | 'text';
  // Optional messages for ZIP export
  messages?: Message[];
  // Button variant
  variant?: 'icon' | 'button' | 'dropdown';
  // Size
  size?: 'sm' | 'default' | 'lg';
  // Additional class names
  className?: string;
}

export function ExportButton({
  artifact,
  allArtifacts,
  projectName = 'gnexus-export',
  mediaUrl,
  mediaType,
  messages = [],
  variant = 'dropdown',
  size = 'sm',
  className,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleExportJSON = async () => {
    if (!artifact) return;

    setIsExporting(true);
    try {
      const name = (artifact as unknown as { name?: string }).name || artifact.type;
      const safeName = name.replace(/[^a-zA-Z0-9]/g, '_');
      exportToJSON(artifact, `${safeName}.json`);
      toast.success('Exported as JSON');
    } catch (err) {
      toast.error('Failed to export');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportMarkdown = async () => {
    if (!artifact) return;

    setIsExporting(true);
    try {
      const name = (artifact as unknown as { name?: string }).name || artifact.type;
      const safeName = name.replace(/[^a-zA-Z0-9]/g, '_');
      const markdown = artifactToMarkdown(artifact);
      exportToMarkdown(markdown, `${safeName}.md`);
      toast.success('Exported as Markdown');
    } catch (err) {
      toast.error('Failed to export');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportZIP = async () => {
    if (!allArtifacts || allArtifacts.length === 0) return;

    setIsExporting(true);
    try {
      await exportAllArtifactsZIP(allArtifacts, projectName, true, messages);
      toast.success(`Exported ${allArtifacts.length} artifacts as ZIP`);
    } catch (err) {
      toast.error('Failed to export ZIP');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadMedia = () => {
    if (!mediaUrl) return;

    const ext = getExtensionFromDataUrl(mediaUrl);
    const filename = `gnexus-${mediaType || 'file'}-${Date.now()}.${ext}`;
    downloadDataUrl(mediaUrl, filename);
    toast.success('File downloaded');
  };

  const handleCopy = async () => {
    if (artifact) {
      const markdown = artifactToMarkdown(artifact);
      const success = await copyToClipboard(markdown);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Copied to clipboard');
      } else {
        toast.error('Failed to copy');
      }
    }
  };

  // Simple icon button for direct download
  if (variant === 'icon') {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={className}
        onClick={mediaUrl ? handleDownloadMedia : handleExportJSON}
        disabled={isExporting}
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
      </Button>
    );
  }

  // Button with label
  if (variant === 'button') {
    return (
      <Button
        variant="outline"
        size={size}
        className={className}
        onClick={allArtifacts ? handleExportZIP : handleExportJSON}
        disabled={isExporting}
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        {allArtifacts ? `Export All (${allArtifacts.length})` : 'Export'}
      </Button>
    );
  }

  // Dropdown with format options
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={size} className={className} disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {artifact && (
          <>
            <DropdownMenuItem onClick={handleExportJSON}>
              <FileJson className="h-4 w-4 mr-2" />
              Export as JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportMarkdown}>
              <FileText className="h-4 w-4 mr-2" />
              Export as Markdown
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopy}>
              {copied ? (
                <Check className="h-4 w-4 mr-2 text-accent" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              Copy to Clipboard
            </DropdownMenuItem>
          </>
        )}
        {mediaUrl && (
          <DropdownMenuItem onClick={handleDownloadMedia}>
            <Download className="h-4 w-4 mr-2" />
            Download {mediaType || 'File'}
          </DropdownMenuItem>
        )}
        {allArtifacts && allArtifacts.length > 0 && (
          <>
            {artifact && <DropdownMenuSeparator />}
            <DropdownMenuItem onClick={handleExportZIP}>
              <Archive className="h-4 w-4 mr-2" />
              Export All as ZIP ({allArtifacts.length})
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
