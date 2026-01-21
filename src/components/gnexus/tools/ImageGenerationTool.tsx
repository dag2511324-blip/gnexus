import { useState, useRef } from 'react';
import { useGnexus } from '@/contexts/GnexusContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Image as ImageIcon, Loader2, Download, Sparkles, Copy, Check, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { downloadDataUrl, copyToClipboard } from '@/lib/export-utils';
import { GenerationProgress, GenerationStatus } from '@/components/ai-studio';

const IMAGE_MODELS = [
  { id: 'sdxl', name: 'SDXL', description: 'High quality, slower' },
  { id: 'flux-schnell', name: 'FLUX Schnell', description: 'Fast & good' },
  { id: 'sd-1.5', name: 'SD 1.5', description: 'Classic reliable' },
  { id: 'sdxl-turbo', name: 'SDXL Turbo', description: 'Fast turbo' },
];

const SIZES = [
  { label: '512×512', width: 512, height: 512 },
  { label: '768×768', width: 768, height: 768 },
  { label: '1024×1024', width: 1024, height: 1024 },
  { label: '1024×768', width: 1024, height: 768 },
  { label: '768×1024', width: 768, height: 1024 },
];

export function ImageGenerationTool() {
  const { activeToolModal, closeToolModal, addArtifact } = useGnexus();
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [model, setModel] = useState('sdxl');
  const [sizeIndex, setSizeIndex] = useState(0);
  const [steps, setSteps] = useState(30);
  const [guidance, setGuidance] = useState(7.5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [progressState, setProgressState] = useState({
    status: 'idle' as GenerationStatus,
    progress: 0,
    retryAttempt: 0,
    maxRetries: 5,
    estimatedWaitTime: 0,
    statusMessage: '',
  });
  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  const isOpen = activeToolModal === 'image-generation';
  const selectedSize = SIZES[sizeIndex];

  const handleGenerate = async (retryCount = 0) => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setImageUrl(null);
    setProgressState(prev => ({
      ...prev,
      status: 'initializing',
      progress: 5,
      retryAttempt: retryCount,
      statusMessage: 'Starting image generation...',
    }));

    try {
      setProgressState(prev => ({
        ...prev,
        status: 'connecting',
        progress: 15,
        statusMessage: 'Connecting to API...',
      }));

      const { data, error } = await supabase.functions.invoke('huggingface-image', {
        body: {
          prompt: prompt.trim(),
          negativePrompt: negativePrompt.trim() || undefined,
          model,
          width: selectedSize.width,
          height: selectedSize.height,
          numInferenceSteps: steps,
          guidanceScale: guidance,
        },
      });

      if (error) throw error;

      if (data.loading) {
        const waitTime = data.estimatedTime || 20;
        setProgressState(prev => ({
          ...prev,
          status: 'model-loading',
          progress: 20 + (retryCount * 10),
          retryAttempt: retryCount,
          estimatedWaitTime: waitTime,
          statusMessage: `Model is loading (attempt ${retryCount + 1}/5)...`,
        }));

        if (retryCount < 5) {
          toast.info(`Model is loading, retrying in ${waitTime} seconds...`);
          retryTimeoutRef.current = setTimeout(() => {
            handleGenerate(retryCount + 1);
          }, waitTime * 1000);
          return;
        } else {
          throw new Error('Model took too long to load. Please try again.');
        }
      }

      if (!data.success) {
        throw new Error(data.error || 'Image generation failed');
      }

      setProgressState(prev => ({
        ...prev,
        status: 'complete',
        progress: 100,
        statusMessage: 'Image generated successfully!',
      }));

      setImageUrl(data.image);
      toast.success('Image generated successfully!');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate image';
      setProgressState(prev => ({
        ...prev,
        status: 'error',
        progress: 0,
        statusMessage: errorMessage,
      }));
      toast.error(errorMessage);
      console.error('Image generation error:', err);
    } finally {
      setIsGenerating(false);
      setTimeout(() => {
        setProgressState(prev => ({ ...prev, status: 'idle', progress: 0 }));
      }, 2000);
    }
  };

  const handleDownload = (format: 'png' | 'jpeg' | 'webp' = 'png') => {
    if (imageUrl) {
      downloadDataUrl(imageUrl, `gnexus-image-${Date.now()}.${format}`);
      toast.success(`Image downloaded as ${format.toUpperCase()}`);
    }
  };

  const handleCopyToClipboard = async () => {
    if (imageUrl) {
      // For images, we copy the data URL
      const success = await copyToClipboard(imageUrl);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Image URL copied to clipboard');
      }
    }
  };

  const handleSaveAsArtifact = () => {
    if (imageUrl && prompt) {
      addArtifact({
        id: `img-${Date.now()}`,
        type: 'component',
        name: `Generated Image: ${prompt.substring(0, 30)}...`,
        purpose: prompt,
        props: [],
        variants: [`${selectedSize.width}x${selectedSize.height}`],
        states: ['generated'],
        accessibilityNotes: `Image generated with ${model}`,
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
    setNegativePrompt('');
    setImageUrl(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
              <ImageIcon className="h-4 w-4 text-accent" />
            </div>
            Image Generation
          </DialogTitle>
          <DialogDescription>
            Create images using FLUX, Stable Diffusion XL, and other models
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 py-4">
          {/* Controls */}
          <div className="space-y-4">
            {/* Model Selection */}
            <div className="space-y-2">
              <Label>Model</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {IMAGE_MODELS.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-3 w-3 text-accent" />
                        <span>{m.name}</span>
                        <span className="text-muted-foreground text-xs">- {m.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Size Selection */}
            <div className="space-y-2">
              <Label>Size</Label>
              <Select value={sizeIndex.toString()} onValueChange={(v) => setSizeIndex(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SIZES.map((s, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Prompt */}
            <div className="space-y-2">
              <Label>Prompt</Label>
              <Textarea
                placeholder="A majestic mountain landscape at sunset, photorealistic, 8k, detailed..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="h-24 resize-none"
              />
            </div>

            {/* Negative Prompt */}
            <div className="space-y-2">
              <Label>Negative Prompt (Optional)</Label>
              <Textarea
                placeholder="blurry, low quality, distorted, watermark..."
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                className="h-16 resize-none"
              />
            </div>

            {/* Parameters */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Steps: {steps}</Label>
                <Slider
                  value={[steps]}
                  onValueChange={([v]) => setSteps(v)}
                  min={10}
                  max={50}
                  step={5}
                />
              </div>
              <div className="space-y-2">
                <Label>Guidance: {guidance.toFixed(1)}</Label>
                <Slider
                  value={[guidance]}
                  onValueChange={([v]) => setGuidance(v)}
                  min={1}
                  max={15}
                  step={0.5}
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
                  Generate Image
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
                modelName={IMAGE_MODELS.find(m => m.id === model)?.name}
                statusMessage={progressState.statusMessage}
              />
            )}
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Preview</Label>
              {imageUrl && (
                <div className="flex items-center gap-1">
                  <Select value={downloadFormat} onValueChange={(v) => setDownloadFormat(v as 'png' | 'jpeg' | 'webp')}>
                    <SelectTrigger className="h-7 w-20 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="png">PNG</SelectItem>
                      <SelectItem value="jpeg">JPEG</SelectItem>
                      <SelectItem value="webp">WebP</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="sm" onClick={() => handleDownload(downloadFormat)}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleCopyToClipboard}>
                    {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleSaveAsArtifact}>
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <div
              className="rounded-lg bg-secondary/30 border border-border flex items-center justify-center overflow-hidden"
              style={{ aspectRatio: `${selectedSize.width}/${selectedSize.height}`, maxHeight: '400px' }}
            >
              {isGenerating ? (
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="text-sm">Generating image...</span>
                </div>
              ) : imageUrl ? (
                <img src={imageUrl} alt="Generated" className="w-full h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground p-8 text-center">
                  <ImageIcon className="h-12 w-12 opacity-50" />
                  <span className="text-sm">Your generated image will appear here</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
