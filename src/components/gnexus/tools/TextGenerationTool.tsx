import { useState, useRef } from 'react';
import { useGnexus } from '@/contexts/GnexusContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { MessageSquare, Loader2, Copy, Check, Sparkles, Download, FileText, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { copyToClipboard, exportToText, exportToMarkdown } from '@/lib/export-utils';
import { GenerationProgress, GenerationStatus } from '@/components/ai-studio';

const TEXT_MODELS = [
  { id: 'mistral', name: 'Mistral 7B', description: 'Fast & versatile' },
  { id: 'qwen', name: 'Qwen 2.5', description: 'Strong reasoning' },
  { id: 'phi', name: 'Phi-3 Mini', description: 'Efficient & fast' },
  { id: 'llama', name: 'Llama 3 8B', description: 'Balanced quality' },
  { id: 'gemma', name: 'Gemma 2 9B', description: 'Google quality' },
];

export function TextGenerationTool() {
  const { activeToolModal, closeToolModal, addArtifact } = useGnexus();
  const [prompt, setPrompt] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [model, setModel] = useState('mistral');
  const [maxTokens, setMaxTokens] = useState(512);
  const [temperature, setTemperature] = useState(0.7);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [progressState, setProgressState] = useState({
    status: 'idle' as GenerationStatus,
    progress: 0,
    retryAttempt: 0,
    maxRetries: 3,
    estimatedWaitTime: 0,
    statusMessage: '',
  });
  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  const isOpen = activeToolModal === 'text-generation';

  const handleGenerate = async (retryCount = 0) => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setResult(null);
    setProgressState(prev => ({
      ...prev,
      status: 'initializing',
      progress: 10,
      retryAttempt: retryCount,
      statusMessage: 'Starting text generation...',
    }));

    try {
      setProgressState(prev => ({
        ...prev,
        status: 'generating',
        progress: 30,
        statusMessage: 'Generating text...',
      }));

      const { data, error } = await supabase.functions.invoke('huggingface-text', {
        body: {
          prompt: prompt.trim(),
          systemPrompt: systemPrompt.trim() || undefined,
          model,
          maxTokens,
          temperature,
        },
      });

      if (error) throw error;

      if (data.loading) {
        setProgressState(prev => ({
          ...prev,
          status: 'model-loading',
          progress: 25,
          retryAttempt: retryCount,
          estimatedWaitTime: 5,
          statusMessage: `Text model is loading (attempt ${retryCount + 1}/3)...`,
        }));

        if (retryCount < 3) {
          toast.info('Model is loading, retrying in 5 seconds...');
          retryTimeoutRef.current = setTimeout(() => {
            handleGenerate(retryCount + 1);
          }, 5000);
          return;
        } else {
          throw new Error('Model took too long to load. Please try again.');
        }
      }

      if (!data.success) {
        throw new Error(data.error || 'Generation failed');
      }

      setProgressState(prev => ({
        ...prev,
        status: 'complete',
        progress: 100,
        statusMessage: 'Text generated!',
      }));

      setResult(data.text);
      toast.success('Text generated successfully!');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate text';
      setProgressState(prev => ({
        ...prev,
        status: 'error',
        progress: 0,
        statusMessage: errorMessage,
      }));
      toast.error(errorMessage);
      console.error('Text generation error:', err);
    } finally {
      setIsGenerating(false);
      setTimeout(() => {
        setProgressState(prev => ({ ...prev, status: 'idle', progress: 0 }));
      }, 2000);
    }
  };

  const handleCopy = async () => {
    if (result) {
      const success = await copyToClipboard(result);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Copied to clipboard');
      }
    }
  };

  const handleDownloadText = () => {
    if (result) {
      exportToText(result, `generated-text-${Date.now()}.txt`);
      toast.success('Downloaded as TXT');
    }
  };

  const handleDownloadMarkdown = () => {
    if (result) {
      const markdown = `# Generated Text\n\n**Prompt:** ${prompt}\n\n**Model:** ${model}\n\n---\n\n${result}`;
      exportToMarkdown(markdown, `generated-text-${Date.now()}.md`);
      toast.success('Downloaded as Markdown');
    }
  };

  const handleSaveAsArtifact = () => {
    if (result && prompt) {
      addArtifact({
        id: `txt-${Date.now()}`,
        type: 'microcopy',
        context: prompt,
        element: 'Generated Text',
        variations: [{ text: result, rationale: `Generated with ${model}` }],
        bestPractices: [],
        createdAt: new Date(),
      });
      toast.success('Saved to artifacts');
    }
  };

  const handleClose = () => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    closeToolModal();
    setPrompt('');
    setSystemPrompt('');
    setResult(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <MessageSquare className="h-4 w-4 text-primary" />
            </div>
            Text Generation
          </DialogTitle>
          <DialogDescription>
            Generate text using state-of-the-art language models from HuggingFace
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Model Selection */}
          <div className="space-y-2">
            <Label>Model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEXT_MODELS.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-3 w-3 text-primary" />
                      <span>{m.name}</span>
                      <span className="text-muted-foreground text-xs">- {m.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* System Prompt */}
          <div className="space-y-2">
            <Label>System Prompt (Optional)</Label>
            <Textarea
              placeholder="You are a helpful assistant..."
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="h-20 resize-none"
            />
          </div>

          {/* User Prompt */}
          <div className="space-y-2">
            <Label>Prompt</Label>
            <Textarea
              placeholder="Write your prompt here..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="h-32 resize-none"
            />
          </div>

          {/* Parameters */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Max Tokens: {maxTokens}</Label>
              <Slider
                value={[maxTokens]}
                onValueChange={([v]) => setMaxTokens(v)}
                min={64}
                max={2048}
                step={64}
              />
            </div>
            <div className="space-y-2">
              <Label>Temperature: {temperature.toFixed(1)}</Label>
              <Slider
                value={[temperature]}
                onValueChange={([v]) => setTemperature(v)}
                min={0}
                max={1.5}
                step={0.1}
              />
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={() => handleGenerate()}
            disabled={isGenerating || !prompt.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Text
              </>
            )}
          </Button>

          {/* Progress Indicator */}
          {isGenerating && (
            <GenerationProgress
              isGenerating={isGenerating}
              status={progressState.status}
              progress={progressState.progress}
              retryAttempt={progressState.retryAttempt}
              maxRetries={progressState.maxRetries}
              estimatedWaitTime={progressState.estimatedWaitTime}
              modelName={TEXT_MODELS.find(m => m.id === model)?.name}
              statusMessage={progressState.statusMessage}
            />
          )}

          {/* Result */}
          {result && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Generated Text</Label>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={handleCopy}>
                    {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleDownloadText} title="Download as TXT">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleDownloadMarkdown} title="Download as Markdown">
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleSaveAsArtifact} title="Save as Artifact">
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="rounded-lg bg-secondary/50 p-4 border border-border">
                <p className="text-sm whitespace-pre-wrap">{result}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
