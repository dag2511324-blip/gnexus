import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Archive, FileJson, FileText, Loader2, Download, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { exportAllArtifactsZIP, exportToJSON, artifactToMarkdown, exportToMarkdown, exportProjectSummary } from '@/lib/export-utils';
import type { Artifact, Message, ProjectContext } from '@/types/gnexus';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  artifacts: Artifact[];
  messages: Message[];
  projectContext: ProjectContext;
}

export function ExportModal({ isOpen, onClose, artifacts, messages, projectContext }: ExportModalProps) {
  const [selectedArtifacts, setSelectedArtifacts] = useState<Set<string>>(new Set(artifacts.map(a => a.id)));
  const [includeMessages, setIncludeMessages] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);
  const [exportFormat, setExportFormat] = useState<'zip' | 'json' | 'markdown'>('zip');
  const [isExporting, setIsExporting] = useState(false);

  const toggleArtifact = (id: string) => {
    const newSet = new Set(selectedArtifacts);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedArtifacts(newSet);
  };

  const toggleAll = () => {
    if (selectedArtifacts.size === artifacts.length) {
      setSelectedArtifacts(new Set());
    } else {
      setSelectedArtifacts(new Set(artifacts.map(a => a.id)));
    }
  };

  const handleExport = async () => {
    const selected = artifacts.filter(a => selectedArtifacts.has(a.id));
    if (selected.length === 0) {
      toast.error('Please select at least one artifact');
      return;
    }

    setIsExporting(true);

    try {
      switch (exportFormat) {
        case 'zip':
          await exportAllArtifactsZIP(
            selected,
            projectContext.name || 'gnexus-project',
            includeMessages,
            messages
          );
          toast.success(`Exported ${selected.length} artifacts as ZIP`);
          break;

        case 'json': {
          const exportData = {
            project: projectContext,
            artifacts: selected,
            ...(includeMessages ? { messages } : {}),
            exportedAt: new Date().toISOString(),
          };
          exportToJSON(exportData, `${projectContext.name || 'gnexus-export'}.json`);
          toast.success('Exported as JSON');
          break;
        }

        case 'markdown': {
          let markdown = '';
          if (includeSummary) {
            markdown += exportProjectSummary(projectContext, selected, messages);
            markdown += '\n\n---\n\n';
          }
          selected.forEach(artifact => {
            markdown += artifactToMarkdown(artifact);
            markdown += '\n\n---\n\n';
          });
          exportToMarkdown(markdown, `${projectContext.name || 'gnexus-export'}.md`);
          toast.success('Exported as Markdown');
          break;
        }
      }
      onClose();
    } catch (err) {
      toast.error('Export failed');
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const getArtifactName = (artifact: Artifact): string => {
    return (artifact as unknown as { name?: string }).name || artifact.type.charAt(0).toUpperCase() + artifact.type.slice(1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5 text-primary" />
            Export Project
          </DialogTitle>
          <DialogDescription>
            Select artifacts and format for export
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Format Selection */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <div className="flex gap-2">
              <Button
                variant={exportFormat === 'zip' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setExportFormat('zip')}
                className="flex-1"
              >
                <Archive className="h-4 w-4 mr-2" />
                ZIP
              </Button>
              <Button
                variant={exportFormat === 'json' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setExportFormat('json')}
                className="flex-1"
              >
                <FileJson className="h-4 w-4 mr-2" />
                JSON
              </Button>
              <Button
                variant={exportFormat === 'markdown' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setExportFormat('markdown')}
                className="flex-1"
              >
                <FileText className="h-4 w-4 mr-2" />
                Markdown
              </Button>
            </div>
          </div>

          {/* Artifact Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Artifacts ({selectedArtifacts.size}/{artifacts.length})</Label>
              <Button variant="ghost" size="sm" onClick={toggleAll}>
                {selectedArtifacts.size === artifacts.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            <ScrollArea className="h-[200px] rounded-md border border-border p-3">
              <div className="space-y-2">
                {artifacts.map(artifact => (
                  <div key={artifact.id} className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedArtifacts.has(artifact.id)}
                      onCheckedChange={() => toggleArtifact(artifact.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{getArtifactName(artifact)}</p>
                      <p className="text-xs text-muted-foreground">{artifact.type}</p>
                    </div>
                  </div>
                ))}
                {artifacts.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No artifacts to export
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Additional Options */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Checkbox
                id="include-messages"
                checked={includeMessages}
                onCheckedChange={(checked) => setIncludeMessages(checked === true)}
              />
              <Label htmlFor="include-messages" className="flex items-center gap-2 cursor-pointer">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                Include chat history ({messages.length} messages)
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                id="include-summary"
                checked={includeSummary}
                onCheckedChange={(checked) => setIncludeSummary(checked === true)}
              />
              <Label htmlFor="include-summary" className="cursor-pointer">
                Include project summary
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting || selectedArtifacts.size === 0}>
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export ({selectedArtifacts.size})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
