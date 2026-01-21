import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Image, Music, FileText, Code, Loader2, Download, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAIGeneration } from '@/hooks/useAIGeneration';
import { Modality, getModelsByModality } from '@/lib/models';
import { GenerationProgress } from './GenerationProgress';
import { ImageViewer, VideoViewer, AudioViewer, CodeViewer, TextViewer } from '@/components/viewers';
const MODALITY_CONFIG: Record<Modality, { icon: typeof Video; label: string; color: string }> = {
  video: { icon: Video, label: 'Video', color: 'from-purple-500 to-pink-500' },
  image: { icon: Image, label: 'Image', color: 'from-blue-500 to-cyan-500' },
  audio: { icon: Music, label: 'Audio', color: 'from-green-500 to-emerald-500' },
  text: { icon: FileText, label: 'Text', color: 'from-orange-500 to-red-500' },
  code: { icon: Code, label: 'Code', color: 'from-violet-500 to-indigo-500' },
};

export function UnifiedGenerator() {
  const [modality, setModality] = useState<Modality>('image');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const { generate, isGenerating, generationState } = useAIGeneration();
  const { toast } = useToast();
  
  const models = getModelsByModality(modality);
  const currentModel = models.find(m => m.id === selectedModel) || models[0];
  
  const handleModalityChange = (newModality: Modality) => {
    setModality(newModality);
    const newModels = getModelsByModality(newModality);
    setSelectedModel(newModels.find(m => m.recommended)?.id || newModels[0]?.id || '');
    setResult(null);
  };
  
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ title: 'Please enter a prompt', variant: 'destructive' });
      return;
    }
    
    const genResult = await generate(modality, {
      prompt,
      model: selectedModel || currentModel?.id || '',
    });
    
    if (genResult.success && genResult.data) {
      setResult(genResult.data);
      toast({ title: 'Generation complete!' });
    } else {
      toast({ title: 'Generation failed', description: genResult.error, variant: 'destructive' });
    }
  };
  
  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result;
    link.download = `generation-${Date.now()}.${modality === 'image' ? 'png' : modality === 'video' ? 'mp4' : modality === 'audio' ? 'wav' : 'txt'}`;
    link.click();
  };
  
  // Set initial model
  React.useEffect(() => {
    if (!selectedModel && models.length > 0) {
      setSelectedModel(models.find(m => m.recommended)?.id || models[0].id);
    }
  }, [models, selectedModel]);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Panel */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle>Create with AI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Modality Selector */}
          <div className="flex gap-2">
            {(Object.keys(MODALITY_CONFIG) as Modality[]).map((mod) => {
              const config = MODALITY_CONFIG[mod];
              const Icon = config.icon;
              return (
                <Button
                  key={mod}
                  variant={modality === mod ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleModalityChange(mod)}
                  className={modality === mod ? `bg-gradient-to-r ${config.color}` : ''}
                >
                  <Icon className="h-4 w-4 mr-1" />
                  {config.label}
                </Button>
              );
            })}
          </div>
          
          {/* Model Selection */}
          <div className="space-y-2">
            <Label>Model</Label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <span className="flex items-center gap-2">
                      {model.name}
                      {model.recommended && <span className="text-xs text-yellow-500">★</span>}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {currentModel && (
              <p className="text-xs text-muted-foreground">{currentModel.advantage}</p>
            )}
          </div>
          
          {/* Prompt */}
          <div className="space-y-2">
            <Label>Prompt</Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`Describe what you want to ${modality === 'audio' ? 'say' : 'create'}...`}
              rows={4}
              className="resize-none"
            />
          </div>
          
          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className={`w-full bg-gradient-to-r ${MODALITY_CONFIG[modality].color}`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate'
            )}
          </Button>
          
          {isGenerating && (
            <GenerationProgress
              isGenerating={isGenerating}
              status={generationState.status}
              progress={generationState.progress}
              retryAttempt={generationState.retryAttempt}
              maxRetries={generationState.maxRetries}
              estimatedWaitTime={generationState.estimatedWaitTime}
              modelName={currentModel?.name}
              statusMessage={generationState.statusMessage}
            />
          )}
        </CardContent>
      </Card>
      
      {/* Result Panel */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Result</CardTitle>
            {result && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {result ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              {modality === 'image' && (
                <ImageViewer 
                  src={result} 
                  alt="Generated image" 
                  showControls={true}
                />
              )}
              {modality === 'video' && (
                <VideoViewer 
                  src={result} 
                  showControls={true}
                />
              )}
              {modality === 'audio' && (
                <AudioViewer 
                  src={result} 
                  title="Generated Audio"
                  showWaveform={true}
                />
              )}
              {modality === 'text' && (
                <TextViewer 
                  text={result} 
                  title="Generated Text"
                  maxHeight={400}
                />
              )}
              {modality === 'code' && (
                <CodeViewer 
                  code={result} 
                  language="typescript"
                  showLineNumbers={true}
                />
              )}
            </motion.div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <p>Your generation will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
