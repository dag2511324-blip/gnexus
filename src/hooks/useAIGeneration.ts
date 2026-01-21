import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Modality, AIModelFull, getModelById } from '@/lib/models';
import { useGenerationHistory } from './useGenerationHistory';
import { useToast } from '@/hooks/use-toast';
import type { GenerationStatus } from '@/components/ai-studio/GenerationProgress';

interface GenerationParams {
  prompt: string;
  negativePrompt?: string;
  model: string;
  // Image params
  width?: number;
  height?: number;
  numInferenceSteps?: number;
  guidanceScale?: number;
  // Video params
  numFrames?: number;
  // Text/Code params
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

interface GenerationResult {
  success: boolean;
  data?: string;
  error?: string;
  model?: string;
  format?: string;
}

export interface GenerationState {
  status: GenerationStatus;
  progress: number;
  retryAttempt: number;
  maxRetries: number;
  estimatedWaitTime: number;
  statusMessage: string;
}

export function useAIGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generationState, setGenerationState] = useState<GenerationState>({
    status: 'idle',
    progress: 0,
    retryAttempt: 0,
    maxRetries: 3,
    estimatedWaitTime: 0,
    statusMessage: '',
  });
  const { toast } = useToast();
  const { addToHistory, updateHistoryItem } = useGenerationHistory({ autoLoad: false });

  const updateState = useCallback((partial: Partial<GenerationState>) => {
    setGenerationState(prev => ({ ...prev, ...partial }));
    if (partial.progress !== undefined) {
      setProgress(partial.progress);
    }
  }, []);
  
  const generateWithRetry = useCallback(async (
    endpoint: string,
    params: GenerationParams,
    maxRetries = 3
  ): Promise<GenerationResult> => {
    let lastError = '';
    
    updateState({ 
      status: 'initializing', 
      progress: 5, 
      retryAttempt: 0, 
      maxRetries,
      statusMessage: 'Starting generation...' 
    });
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        updateState({ 
          status: 'connecting', 
          progress: 10, 
          retryAttempt: attempt,
          statusMessage: 'Connecting to API...' 
        });
        
        const { data, error } = await supabase.functions.invoke(endpoint, {
          body: params,
        });
        
        if (error) throw error;
        
        if (data.loading) {
          // Model is loading, wait and retry
          const waitTime = data.estimatedTime || 30;
          updateState({ 
            status: 'model-loading', 
            progress: 15 + (attempt * 5), 
            retryAttempt: attempt,
            estimatedWaitTime: waitTime,
            statusMessage: `Model is warming up (attempt ${attempt + 1}/${maxRetries})...` 
          });
          
          toast({
            title: 'Model Loading',
            description: `Please wait ~${waitTime}s while the model loads...`,
          });
          await new Promise(resolve => setTimeout(resolve, Math.min(waitTime * 1000, 30000)));
          continue;
        }
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        updateState({ 
          status: 'processing', 
          progress: 90, 
          statusMessage: 'Processing result...' 
        });
        
        return {
          success: true,
          data: data.image || data.video || data.audio || data.text,
          model: data.model,
          format: data.format,
        };
      } catch (err) {
        lastError = err instanceof Error ? err.message : 'Generation failed';
        console.error(`Attempt ${attempt + 1} failed:`, err);
        
        if (attempt < maxRetries - 1) {
          updateState({ 
            status: 'model-loading', 
            progress: 15 + (attempt * 5), 
            retryAttempt: attempt + 1,
            estimatedWaitTime: 5 * (attempt + 1),
            statusMessage: `Retrying (attempt ${attempt + 2}/${maxRetries})...` 
          });
          await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
        }
      }
    }
    
    updateState({ 
      status: 'error', 
      progress: 0, 
      statusMessage: lastError 
    });
    
    return { success: false, error: lastError };
  }, [toast, updateState]);
  
  const generateImage = useCallback(async (params: GenerationParams) => {
    setIsGenerating(true);
    updateState({ status: 'initializing', progress: 5, statusMessage: 'Starting image generation...' });
    const startTime = Date.now();
    
    const model = getModelById(params.model);
    
    // Add to history as processing
    const historyItem = await addToHistory({
      modality: 'image',
      modelId: params.model,
      modelName: model?.name || params.model,
      prompt: params.prompt,
      parameters: { ...params } as Record<string, unknown>,
      resultUrl: null,
      resultType: null,
      status: 'processing',
      errorMessage: null,
      durationMs: null,
    });
    
    try {
      updateState({ status: 'generating', progress: 30, statusMessage: 'Generating image...' });
      
      const result = await generateWithRetry('huggingface-image', {
        prompt: params.prompt,
        negativePrompt: params.negativePrompt,
        model: params.model,
        width: params.width || 1024,
        height: params.height || 1024,
        numInferenceSteps: params.numInferenceSteps || 30,
        guidanceScale: params.guidanceScale || 7.5,
      });
      
      const duration = Date.now() - startTime;
      
      if (historyItem) {
        await updateHistoryItem(historyItem.id, {
          resultUrl: result.data || null,
          resultType: 'image/png',
          status: result.success ? 'completed' : 'failed',
          errorMessage: result.error || null,
          durationMs: duration,
        });
      }
      
      updateState({ status: 'complete', progress: 100, statusMessage: 'Image generated!' });
      return result;
    } finally {
      setIsGenerating(false);
      setTimeout(() => updateState({ status: 'idle', progress: 0, statusMessage: '' }), 2000);
    }
  }, [addToHistory, updateHistoryItem, generateWithRetry, updateState]);
  
  const generateVideo = useCallback(async (params: GenerationParams) => {
    setIsGenerating(true);
    updateState({ status: 'initializing', progress: 5, maxRetries: 5, statusMessage: 'Starting video generation...' });
    const startTime = Date.now();
    
    const model = getModelById(params.model);
    
    const historyItem = await addToHistory({
      modality: 'video',
      modelId: params.model,
      modelName: model?.name || params.model,
      prompt: params.prompt,
      parameters: { ...params } as Record<string, unknown>,
      resultUrl: null,
      resultType: null,
      status: 'processing',
      errorMessage: null,
      durationMs: null,
    });
    
    try {
      updateState({ status: 'generating', progress: 20, statusMessage: 'Generating video frames...' });
      
      const result = await generateWithRetry('huggingface-video', {
        prompt: params.prompt,
        negativePrompt: params.negativePrompt,
        model: params.model,
        numFrames: params.numFrames || 16,
        numInferenceSteps: params.numInferenceSteps || 25,
      }, 5); // More retries for video
      
      const duration = Date.now() - startTime;
      
      if (historyItem) {
        await updateHistoryItem(historyItem.id, {
          resultUrl: result.data || null,
          resultType: result.format === 'gif' ? 'image/gif' : 'video/mp4',
          status: result.success ? 'completed' : 'failed',
          errorMessage: result.error || null,
          durationMs: duration,
        });
      }
      
      updateState({ status: 'complete', progress: 100, statusMessage: 'Video generated!' });
      return result;
    } finally {
      setIsGenerating(false);
      setTimeout(() => updateState({ status: 'idle', progress: 0, statusMessage: '' }), 2000);
    }
  }, [addToHistory, updateHistoryItem, generateWithRetry, updateState]);
  
  const generateAudio = useCallback(async (params: GenerationParams & { mode?: 'tts' | 'stt' }) => {
    setIsGenerating(true);
    updateState({ status: 'initializing', progress: 5, statusMessage: 'Starting audio generation...' });
    const startTime = Date.now();
    
    const model = getModelById(params.model);
    
    const historyItem = await addToHistory({
      modality: 'audio',
      modelId: params.model,
      modelName: model?.name || params.model,
      prompt: params.prompt,
      parameters: { ...params } as Record<string, unknown>,
      resultUrl: null,
      resultType: null,
      status: 'processing',
      errorMessage: null,
      durationMs: null,
    });
    
    try {
      updateState({ status: 'generating', progress: 30, statusMessage: 'Synthesizing speech...' });
      
      const { data, error } = await supabase.functions.invoke('huggingface-audio', {
        body: { text: params.prompt, model: params.model },
      });
      
      let result = { success: false, data: undefined as string | undefined, error: '' };
      
      if (error) {
        result.error = error.message;
      } else if (data?.loading) {
        updateState({ 
          status: 'model-loading', 
          progress: 25, 
          estimatedWaitTime: data.estimatedTime || 10,
          statusMessage: 'Model is loading...' 
        });
        toast({
          title: 'Model Loading',
          description: 'Please wait while the model loads...',
        });
        await new Promise(resolve => setTimeout(resolve, 10000));
        // Retry once
        updateState({ status: 'generating', progress: 50, retryAttempt: 1, statusMessage: 'Retrying...' });
        const { data: retryData, error: retryError } = await supabase.functions.invoke('huggingface-audio', {
          body: { text: params.prompt, model: params.model },
        });
        if (retryError) {
          result.error = retryError.message;
        } else if (retryData?.success) {
          result = { success: true, data: retryData.audio, error: '' };
        } else {
          result.error = retryData?.error || 'Generation failed';
        }
      } else if (data?.success) {
        result = { success: true, data: data.audio, error: '' };
      } else {
        result.error = data?.error || 'Generation failed';
      }
      
      const duration = Date.now() - startTime;
      
      if (historyItem) {
        await updateHistoryItem(historyItem.id, {
          resultUrl: result.data || null,
          resultType: 'audio/wav',
          status: result.success ? 'completed' : 'failed',
          errorMessage: result.error || null,
          durationMs: duration,
        });
      }
      
      updateState({ status: result.success ? 'complete' : 'error', progress: 100, statusMessage: result.success ? 'Audio generated!' : result.error });
      return result;
    } finally {
      setIsGenerating(false);
      setTimeout(() => updateState({ status: 'idle', progress: 0, statusMessage: '' }), 2000);
    }
  }, [addToHistory, updateHistoryItem, toast, updateState]);
  
  const generateText = useCallback(async (params: GenerationParams) => {
    setIsGenerating(true);
    updateState({ status: 'initializing', progress: 5, statusMessage: 'Starting text generation...' });
    const startTime = Date.now();
    
    const model = getModelById(params.model);
    
    const historyItem = await addToHistory({
      modality: 'text',
      modelId: params.model,
      modelName: model?.name || params.model,
      prompt: params.prompt,
      parameters: { ...params } as Record<string, unknown>,
      resultUrl: null,
      resultType: null,
      status: 'processing',
      errorMessage: null,
      durationMs: null,
    });
    
    try {
      updateState({ status: 'generating', progress: 30, statusMessage: 'Generating text...' });
      
      const result = await generateWithRetry('huggingface-text', {
        prompt: params.prompt,
        systemPrompt: params.systemPrompt,
        model: params.model,
        maxTokens: params.maxTokens || 512,
        temperature: params.temperature || 0.7,
      });
      
      const duration = Date.now() - startTime;
      
      if (historyItem) {
        await updateHistoryItem(historyItem.id, {
          resultUrl: result.data || null,
          resultType: 'text/plain',
          status: result.success ? 'completed' : 'failed',
          errorMessage: result.error || null,
          durationMs: duration,
        });
      }
      
      updateState({ status: 'complete', progress: 100, statusMessage: 'Text generated!' });
      return result;
    } finally {
      setIsGenerating(false);
      setTimeout(() => updateState({ status: 'idle', progress: 0, statusMessage: '' }), 2000);
    }
  }, [addToHistory, updateHistoryItem, generateWithRetry, updateState]);
  
  const generateCode = useCallback(async (params: GenerationParams) => {
    // Code generation uses the same text endpoint
    return generateText({
      ...params,
      systemPrompt: params.systemPrompt || 'You are an expert programmer. Write clean, well-commented code.',
    });
  }, [generateText]);
  
  const generate = useCallback(async (modality: Modality, params: GenerationParams) => {
    switch (modality) {
      case 'image':
        return generateImage(params);
      case 'video':
        return generateVideo(params);
      case 'audio':
        return generateAudio(params);
      case 'text':
        return generateText(params);
      case 'code':
        return generateCode(params);
      default:
        throw new Error(`Unsupported modality: ${modality}`);
    }
  }, [generateImage, generateVideo, generateAudio, generateText, generateCode]);
  
  return {
    generate,
    generateImage,
    generateVideo,
    generateAudio,
    generateText,
    generateCode,
    isGenerating,
    progress,
    generationState,
  };
}
