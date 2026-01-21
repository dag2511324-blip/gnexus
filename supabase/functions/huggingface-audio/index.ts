import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { HfInference } from "https://esm.sh/@huggingface/inference@2.8.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HUGGINGFACE_API_KEY = Deno.env.get('HUGGINGFACE_API_KEY');

// VERIFIED WORKING Speech-to-Text models
const SPEECH_TO_TEXT_MODELS: Record<string, { id: string; description: string }> = {
  'whisper-large': { 
    id: 'openai/whisper-large-v3',
    description: 'Highest accuracy, multilingual'
  },
  'whisper-turbo': { 
    id: 'openai/whisper-large-v3-turbo',
    description: 'Fast and accurate (recommended)'
  },
};

// VERIFIED WORKING Text-to-Speech models
const TEXT_TO_SPEECH_MODELS: Record<string, { id: string; description: string }> = {
  'mms-tts': { 
    id: 'facebook/mms-tts-eng',
    description: 'Meta MMS - Clear English speech (recommended)'
  },
  'parler-tts': { 
    id: 'parler-tts/parler-tts-mini-v1',
    description: 'Natural expressive TTS'
  },
  'melo-tts': { 
    id: 'myshell-ai/MeloTTS-English',
    description: 'High-quality English voice'
  },
};

const DEFAULT_STT_MODEL = 'whisper-turbo';
const DEFAULT_TTS_MODEL = 'mms-tts';

// Extended retry configuration - up to 3 minutes total
const RETRY_CONFIG = {
  maxRetries: 6,
  initialDelay: 10000,     // 10 seconds
  maxDelay: 45000,         // 45 seconds max per retry
  totalTimeout: 180000,    // 3 minutes total
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function speechToTextWithRetry(
  client: HfInference,
  modelId: string,
  audioData: Uint8Array,
): Promise<{ text: string }> {
  const startTime = Date.now();
  let lastError: Error | null = null;
  let retryDelay = RETRY_CONFIG.initialDelay;
  
  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    const elapsedMs = Date.now() - startTime;
    if (elapsedMs >= RETRY_CONFIG.totalTimeout) {
      throw new Error(`Transcription timed out after ${Math.round(elapsedMs / 1000)} seconds`);
    }
    
    try {
      console.log(`[STT] Attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries + 1} - Model: ${modelId}`);
      
      // Convert Uint8Array to ArrayBuffer for the SDK
      const audioBuffer = audioData.buffer.slice(audioData.byteOffset, audioData.byteOffset + audioData.byteLength) as ArrayBuffer;
      
      const result = await client.automaticSpeechRecognition({
        model: modelId,
        data: audioBuffer,
      });
      
      return result;
    } catch (error) {
      lastError = error as Error;
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[STT] Attempt ${attempt + 1} failed:`, errorMessage);
      
      if (errorMessage.includes('503') || errorMessage.includes('loading')) {
        let waitTime = retryDelay;
        const timeMatch = errorMessage.match(/estimated_time['":\s]+(\d+)/);
        if (timeMatch) {
          waitTime = Math.min(parseInt(timeMatch[1]) * 1000, RETRY_CONFIG.maxDelay);
        }
        
        console.log(`[STT] Model loading, waiting ${waitTime/1000}s before retry...`);
        await delay(waitTime);
        retryDelay = Math.min(retryDelay * 1.5, RETRY_CONFIG.maxDelay);
        continue;
      }
      
      if (errorMessage.includes('429')) {
        console.log(`[STT] Rate limited, waiting ${retryDelay/1000}s before retry...`);
        await delay(retryDelay);
        retryDelay = Math.min(retryDelay * 2, RETRY_CONFIG.maxDelay);
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
}

async function textToSpeechWithRetry(
  client: HfInference,
  modelId: string,
  text: string,
): Promise<Blob> {
  const startTime = Date.now();
  let lastError: Error | null = null;
  let retryDelay = RETRY_CONFIG.initialDelay;
  
  // TTS fallback order
  const modelsToTry = [modelId];
  if (modelId !== 'facebook/mms-tts-eng') modelsToTry.push('facebook/mms-tts-eng');
  if (modelId !== 'myshell-ai/MeloTTS-English') modelsToTry.push('myshell-ai/MeloTTS-English');
  
  for (const currentModel of modelsToTry) {
    retryDelay = RETRY_CONFIG.initialDelay;
    
    for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
      const elapsedMs = Date.now() - startTime;
      if (elapsedMs >= RETRY_CONFIG.totalTimeout) {
        throw new Error(`Speech synthesis timed out after ${Math.round(elapsedMs / 1000)} seconds`);
      }
      
      try {
        console.log(`[TTS] Attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries + 1} - Model: ${currentModel}`);
        
        const result = await client.textToSpeech({
          model: currentModel,
          inputs: text,
        });
        
        return result;
      } catch (error) {
        lastError = error as Error;
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[TTS] Attempt ${attempt + 1} failed:`, errorMessage);
        
        // Model not available - try next model
        if (errorMessage.includes('404') || errorMessage.includes('not available')) {
          console.log(`[TTS] Model ${currentModel} not available, trying fallback...`);
          break; // Break inner loop to try next model
        }
        
        if (errorMessage.includes('503') || errorMessage.includes('loading')) {
          let waitTime = retryDelay;
          const timeMatch = errorMessage.match(/estimated_time['":\s]+(\d+)/);
          if (timeMatch) {
            waitTime = Math.min(parseInt(timeMatch[1]) * 1000, RETRY_CONFIG.maxDelay);
          }
          
          console.log(`[TTS] Model loading, waiting ${waitTime/1000}s before retry...`);
          await delay(waitTime);
          retryDelay = Math.min(retryDelay * 1.5, RETRY_CONFIG.maxDelay);
          continue;
        }
        
        if (errorMessage.includes('429')) {
          console.log(`[TTS] Rate limited, waiting ${retryDelay/1000}s before retry...`);
          await delay(retryDelay);
          retryDelay = Math.min(retryDelay * 2, RETRY_CONFIG.maxDelay);
          continue;
        }
        
        throw error;
      }
    }
  }
  
  throw lastError || new Error('All TTS models failed. Please try again later.');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!HUGGINGFACE_API_KEY) {
      throw new Error('HUGGINGFACE_API_KEY is not configured');
    }

    const client = new HfInference(HUGGINGFACE_API_KEY);
    const contentType = req.headers.get('content-type') || '';
    
    // Handle speech-to-text (audio file upload)
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const audioFile = formData.get('audio') as File;
      const model = (formData.get('model') as string) || DEFAULT_STT_MODEL;
      
      if (!audioFile) {
        throw new Error('Audio file is required');
      }

      const modelConfig = SPEECH_TO_TEXT_MODELS[model] || SPEECH_TO_TEXT_MODELS[DEFAULT_STT_MODEL];
      const modelId = modelConfig.id;
      
      console.log(`[STT] Model: ${modelId}`);
      console.log(`[STT] File: ${audioFile.name}, Size: ${audioFile.size} bytes`);

      const audioBuffer = await audioFile.arrayBuffer();
      const audioData = new Uint8Array(audioBuffer);
      
      const result = await speechToTextWithRetry(client, modelId, audioData);

      console.log('[STT] Transcription successful');

      return new Response(JSON.stringify({
        success: true,
        text: result.text || '',
        model: modelId,
        mode: 'speech-to-text',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Handle text-to-speech (JSON body)
    const { text, model = DEFAULT_TTS_MODEL } = await req.json();
    
    if (!text) {
      throw new Error('Text is required for text-to-speech');
    }

    const modelConfig = TEXT_TO_SPEECH_MODELS[model] || TEXT_TO_SPEECH_MODELS[DEFAULT_TTS_MODEL];
    const modelId = modelConfig.id;
    
    console.log(`[TTS] Model: ${modelId}`);
    console.log(`[TTS] Text: ${text.substring(0, 50)}...`);

    const audioBlob = await textToSpeechWithRetry(client, modelId, text);

    // Convert blob to base64
    const audioBuffer = await audioBlob.arrayBuffer();
    const base64Audio = btoa(
      new Uint8Array(audioBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    console.log(`[TTS] Success! Size: ${audioBuffer.byteLength} bytes`);

    return new Response(JSON.stringify({
      success: true,
      audio: `data:audio/wav;base64,${base64Audio}`,
      model: modelId,
      mode: 'text-to-speech',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Audio] Error:', error);
    
    let hint = 'Try using whisper-turbo for transcription or mms-tts for speech synthesis.';
    if (errorMessage.includes('timeout')) {
      hint = 'The model is taking too long. Try again in a few minutes.';
    }
    
    return new Response(JSON.stringify({
      error: errorMessage,
      success: false,
      hint: hint,
      availableSTTModels: Object.keys(SPEECH_TO_TEXT_MODELS),
      availableTTSModels: Object.keys(TEXT_TO_SPEECH_MODELS),
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
