import { useState, useRef } from 'react';
import { useGnexus } from '@/contexts/GnexusContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mic, Volume2, Loader2, Upload, Download, Play, Pause, Copy, Check, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { downloadDataUrl, copyToClipboard, exportToText } from '@/lib/export-utils';
import { GenerationProgress, GenerationStatus } from '@/components/ai-studio';

const STT_MODELS = [
  { id: 'whisper-turbo', name: 'Whisper Turbo', description: 'Fast transcription' },
  { id: 'whisper-large', name: 'Whisper Large', description: 'Best accuracy' },
  { id: 'whisper-medium', name: 'Whisper Medium', description: 'Balanced' },
];

const TTS_MODELS = [
  { id: 'mms-eng', name: 'MMS English', description: 'Clear speech' },
  { id: 'speecht5', name: 'SpeechT5', description: 'Natural voice' },
  { id: 'bark', name: 'Bark Small', description: 'Expressive' },
];

export function AudioTool() {
  const { activeToolModal, closeToolModal } = useGnexus();
  const [activeTab, setActiveTab] = useState('tts');
  
  // TTS State
  const [ttsText, setTtsText] = useState('');
  const [ttsModel, setTtsModel] = useState('mms-eng');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // STT State
  const [sttModel, setSttModel] = useState('whisper-turbo');
  const [transcription, setTranscription] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [transcriptionCopied, setTranscriptionCopied] = useState(false);
  
  // Common State
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressState, setProgressState] = useState({
    status: 'idle' as GenerationStatus,
    progress: 0,
    retryAttempt: 0,
    maxRetries: 3,
    estimatedWaitTime: 0,
    statusMessage: '',
  });
  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  const isOpen = activeToolModal === 'audio-tool';

  const handleTTS = async (retryCount = 0) => {
    if (!ttsText.trim()) {
      toast.error('Please enter text to synthesize');
      return;
    }

    setIsProcessing(true);
    setAudioUrl(null);
    setProgressState(prev => ({
      ...prev,
      status: 'initializing',
      progress: 10,
      retryAttempt: retryCount,
      statusMessage: 'Starting speech synthesis...',
    }));

    try {
      setProgressState(prev => ({
        ...prev,
        status: 'generating',
        progress: 30,
        statusMessage: 'Generating speech...',
      }));

      const { data, error } = await supabase.functions.invoke('huggingface-audio', {
        body: {
          text: ttsText.trim(),
          model: ttsModel,
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
          statusMessage: `Audio model is loading (attempt ${retryCount + 1}/3)...`,
        }));

        if (retryCount < 3) {
          toast.info('Model is loading, retrying in 5 seconds...');
          retryTimeoutRef.current = setTimeout(() => {
            handleTTS(retryCount + 1);
          }, 5000);
          return;
        } else {
          throw new Error('Model took too long to load.');
        }
      }

      if (!data.success) {
        throw new Error(data.error || 'Speech synthesis failed');
      }

      setProgressState(prev => ({
        ...prev,
        status: 'complete',
        progress: 100,
        statusMessage: 'Audio generated!',
      }));

      setAudioUrl(data.audio);
      toast.success('Audio generated successfully!');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate audio';
      setProgressState(prev => ({
        ...prev,
        status: 'error',
        progress: 0,
        statusMessage: errorMessage,
      }));
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        setProgressState(prev => ({ ...prev, status: 'idle', progress: 0 }));
      }, 2000);
    }
  };

  const handleSTT = async (retryCount = 0) => {
    if (!selectedFile) {
      toast.error('Please select an audio file');
      return;
    }

    setIsProcessing(true);
    setTranscription(null);

    try {
      const formData = new FormData();
      formData.append('audio', selectedFile);
      formData.append('model', sttModel);

      const { data, error } = await supabase.functions.invoke('huggingface-audio', {
        body: formData,
      });

      if (error) throw error;

      if (data.loading) {
        if (retryCount < 3) {
          toast.info('Model is loading, retrying in 5 seconds...');
          retryTimeoutRef.current = setTimeout(() => {
            handleSTT(retryCount + 1);
          }, 5000);
          return;
        } else {
          throw new Error('Model took too long to load.');
        }
      }

      if (!data.success) {
        throw new Error(data.error || 'Transcription failed');
      }

      setTranscription(data.text);
      toast.success('Audio transcribed successfully!');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to transcribe audio';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        toast.error('Please select an audio file');
        return;
      }
      setSelectedFile(file);
      setTranscription(null);
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleDownload = () => {
    if (audioUrl) {
      downloadDataUrl(audioUrl, `gnexus-audio-${Date.now()}.wav`);
      toast.success('Audio downloaded');
    }
  };

  const handleCopyTranscription = async () => {
    if (transcription) {
      const success = await copyToClipboard(transcription);
      if (success) {
        setTranscriptionCopied(true);
        setTimeout(() => setTranscriptionCopied(false), 2000);
        toast.success('Transcription copied to clipboard');
      }
    }
  };

  const handleExportTranscription = () => {
    if (transcription) {
      exportToText(transcription, `transcription-${Date.now()}.txt`);
      toast.success('Transcription exported');
    }
  };

  const handleClose = () => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    closeToolModal();
    setTtsText('');
    setAudioUrl(null);
    setTranscription(null);
    setSelectedFile(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Mic className="h-4 w-4 text-primary" />
            </div>
            Audio Tool
          </DialogTitle>
          <DialogDescription>
            Convert text to speech or transcribe audio files using AI
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="py-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tts" className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Text to Speech
            </TabsTrigger>
            <TabsTrigger value="stt" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Speech to Text
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tts" className="space-y-4 mt-4">
            {/* TTS Model */}
            <div className="space-y-2">
              <Label>Voice Model</Label>
              <Select value={ttsModel} onValueChange={setTtsModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TTS_MODELS.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-3 w-3 text-primary" />
                        <span>{m.name}</span>
                        <span className="text-muted-foreground text-xs">- {m.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Text Input */}
            <div className="space-y-2">
              <Label>Text to Speak</Label>
              <Textarea
                placeholder="Enter the text you want to convert to speech..."
                value={ttsText}
                onChange={(e) => setTtsText(e.target.value)}
                className="h-32 resize-none"
              />
            </div>

            {/* Generate Button */}
            <Button
              onClick={() => handleTTS()}
              disabled={isProcessing || !ttsText.trim()}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4 mr-2" />
                  Generate Speech
                </>
              )}
            </Button>

            {/* Progress Indicator */}
            {isProcessing && activeTab === 'tts' && (
              <GenerationProgress
                isGenerating={isProcessing}
                status={progressState.status}
                progress={progressState.progress}
                retryAttempt={progressState.retryAttempt}
                maxRetries={progressState.maxRetries}
                estimatedWaitTime={progressState.estimatedWaitTime}
                modelName={TTS_MODELS.find(m => m.id === ttsModel)?.name}
                statusMessage={progressState.statusMessage}
              />
            )}

            {/* Audio Player */}
            {audioUrl && (
              <div className="rounded-lg bg-secondary/30 border border-border p-4 space-y-3">
                <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />
                <div className="flex items-center justify-center gap-3">
                  <Button variant="outline" size="icon" onClick={togglePlayback}>
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleDownload}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="stt" className="space-y-4 mt-4">
            {/* STT Model */}
            <div className="space-y-2">
              <Label>Transcription Model</Label>
              <Select value={sttModel} onValueChange={setSttModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STT_MODELS.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      <div className="flex items-center gap-2">
                        <Mic className="h-3 w-3 text-primary" />
                        <span>{m.name}</span>
                        <span className="text-muted-foreground text-xs">- {m.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label>Audio File</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="audio-upload"
                />
                <label htmlFor="audio-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  {selectedFile ? (
                    <p className="text-sm text-foreground">{selectedFile.name}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Click to upload an audio file (MP3, WAV, etc.)
                    </p>
                  )}
                </label>
              </div>
            </div>

            {/* Transcribe Button */}
            <Button
              onClick={() => handleSTT()}
              disabled={isProcessing || !selectedFile}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Transcribing...
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 mr-2" />
                  Transcribe Audio
                </>
              )}
            </Button>

            {/* Transcription Result */}
            {transcription && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Transcription</Label>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={handleCopyTranscription}>
                      {transcriptionCopied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleExportTranscription}>
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="rounded-lg bg-secondary/30 border border-border p-4">
                  <p className="text-sm whitespace-pre-wrap">{transcription}</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
