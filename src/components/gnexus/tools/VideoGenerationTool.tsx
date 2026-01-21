import { useState, useRef } from 'react';
import { useGnexus } from '@/contexts/GnexusContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Video, Loader2, Download, Sparkles, AlertCircle, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { downloadDataUrl } from '@/lib/export-utils';
import { GenerationProgress, GenerationStatus } from '@/components/ai-studio';

const VIDEO_MODELS = [
  { id: 'text-to-video', name: 'Text-to-Video', description: 'General video generation' },
  { id: 'zeroscope', name: 'Zeroscope', description: 'High quality video' },
  { id: 'animate-diff', name: 'AnimateDiff', description: 'Animation focused' },
];

export function VideoGenerationTool() {
  const { activeToolModal, closeToolModal, addArtifact } = useGnexus();
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('low quality, blurry, distorted');
  const [model, setModel] = useState('text-to-video');
  const [numFrames, setNumFrames] = useState(16);
  const [steps, setSteps] = useState(25);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoFormat, setVideoFormat] = useState<'gif' | 'mp4'>('mp4');
  const [progressState, setProgressState] = useState({
    status: 'idle' as GenerationStatus,
    progress: 0,
    retryAttempt: 0,
    maxRetries: 8,
    estimatedWaitTime: 0,
    statusMessage: '',
  });
  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  const isOpen = activeToolModal === 'video-generation';

  const handleGenerate = async (retryCount = 0) => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setVideoUrl(null);
    setProgressState(prev => ({
      ...prev,
      status: 'initializing',
      progress: 5,
      retryAttempt: retryCount,
      statusMessage: 'Starting video generation...',
    }));

    try {
      setProgressState(prev => ({
        ...prev,
        status: 'connecting',
        progress: 10,
        statusMessage: 'Connecting to video API...',
      }));

      const { data, error } = await supabase.functions.invoke('huggingface-video', {
        body: {
          prompt: prompt.trim(),
          negativePrompt: negativePrompt.trim() || undefined,
          model,
          numFrames,
          numInferenceSteps: steps,
        },
      });

      if (error) throw error;

      if (data.loading) {
        const waitTime = data.estimatedTime || 60;
        setProgressState(prev => ({
          ...prev,
          status: 'model-loading',
          progress: 15 + (retryCount * 5),
          retryAttempt: retryCount,
          estimatedWaitTime: waitTime,
          statusMessage: `Video model is loading (attempt ${retryCount + 1}/8)...`,
        }));

        if (retryCount < 8) {
          toast.info(`Model is loading. Retrying in ${Math.ceil(waitTime)} seconds...`);
          retryTimeoutRef.current = setTimeout(() => {
            handleGenerate(retryCount + 1);
          }, waitTime * 1000);
          return;
        } else {
          throw new Error('Model took too long to load. Please try again later.');
        }
      }

      if (!data.success) {
        throw new Error(data.error || 'Video generation failed');
      }

      setProgressState(prev => ({
        ...prev,
        status: 'complete',
        progress: 100,
        statusMessage: 'Video generated successfully!',
      }));

      setVideoUrl(data.video);
      setVideoFormat(data.format || 'mp4');
      toast.success('Video generated successfully!');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate video';
      setProgressState(prev => ({
        ...prev,
        status: 'error',
        progress: 0,
        statusMessage: errorMessage,
      }));
      toast.error(errorMessage);
      console.error('Video generation error:', err);
    } finally {
      setIsGenerating(false);
      setTimeout(() => {
        setProgressState(prev => ({ ...prev, status: 'idle', progress: 0 }));
      }, 2000);
    }
  };

  const handleDownload = () => {
    if (videoUrl) {
      downloadDataUrl(videoUrl, `gnexus-video-${Date.now()}.${videoFormat}`);
      toast.success('Video downloaded');
    }
  };

  const handleSaveAsArtifact = () => {
    if (videoUrl && prompt) {
      addArtifact({
        id: `vid-${Date.now()}`,
        type: 'component',
        name: `Generated Video: ${prompt.substring(0, 30)}...`,
        purpose: prompt,
        props: [],
        variants: [`${numFrames} frames`, videoFormat],
        states: ['generated'],
        accessibilityNotes: `Video generated with ${model}`,
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
    setVideoUrl(null);
    setProgressState(prev => ({ ...prev, status: 'idle', progress: 0 }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Video className="h-4 w-4 text-primary" />
            </div>
            Video Generation
          </DialogTitle>
          <DialogDescription>
            Create videos from text prompts using AI video models
          </DialogDescription>
        </DialogHeader>

        <Alert className="border-amber-500/50 bg-amber-500/10">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-200">
            Video generation requires significant compute time. Models may take 30-60 seconds to load.
          </AlertDescription>
        </Alert>

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
                  {VIDEO_MODELS.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      <div className="flex items-center gap-2">
                        <Video className="h-3 w-3 text-primary" />
                        <span>{m.name}</span>
                        <span className="text-muted-foreground text-xs">- {m.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Prompt */}
            <div className="space-y-2">
              <Label>Prompt</Label>
              <Textarea
                placeholder="A cat playing piano, cinematic, high quality..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="h-24 resize-none"
              />
            </div>

            {/* Negative Prompt */}
            <div className="space-y-2">
              <Label>Negative Prompt</Label>
              <Textarea
                placeholder="low quality, blurry, distorted..."
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                className="h-16 resize-none"
              />
            </div>

            {/* Parameters */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Frames: {numFrames}</Label>
                <Slider
                  value={[numFrames]}
                  onValueChange={([v]) => setNumFrames(v)}
                  min={8}
                  max={24}
                  step={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Steps: {steps}</Label>
                <Slider
                  value={[steps]}
                  onValueChange={([v]) => setSteps(v)}
                  min={15}
                  max={50}
                  step={5}
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
                  {progressState.estimatedWaitTime ? `Loading model (~${progressState.estimatedWaitTime}s)...` : 'Generating...'}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Video
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
                modelName={VIDEO_MODELS.find(m => m.id === model)?.name}
                statusMessage={progressState.statusMessage}
              />
            )}
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Preview</Label>
              {videoUrl && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground mr-2">{videoFormat.toUpperCase()}</span>
                  <Button variant="ghost" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleSaveAsArtifact}>
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <div 
              className="rounded-lg bg-secondary/30 border border-border flex items-center justify-center overflow-hidden aspect-video"
            >
              {isGenerating ? (
                <div className="flex flex-col items-center gap-3 text-muted-foreground p-4">
                  <Loader2 className="h-10 w-10 animate-spin" />
                  <span className="text-sm text-center">
                    {progressState.estimatedWaitTime > 0
                      ? `Model is loading (~${progressState.estimatedWaitTime}s remaining)`
                      : 'Generating video...'
                    }
                  </span>
                  <span className="text-xs text-muted-foreground">This may take a while</span>
                </div>
              ) : videoUrl ? (
                videoFormat === 'gif' ? (
                  <img src={videoUrl} alt="Generated" className="w-full h-full object-contain" />
                ) : (
                  <video 
                    src={videoUrl} 
                    controls 
                    autoPlay 
                    loop 
                    muted 
                    className="w-full h-full object-contain"
                  />
                )
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground p-8 text-center">
                  <Video className="h-12 w-12 opacity-50" />
                  <span className="text-sm">Your generated video will appear here</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
