import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { HfInference } from "https://esm.sh/@huggingface/inference@2.8.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HUGGINGFACE_API_KEY = Deno.env.get('HUGGINGFACE_API_KEY');

// VERIFIED WORKING models on HuggingFace Inference API (Free Tier)
const IMAGE_MODELS: Record<string, { id: string; maxWidth: number; maxHeight: number; provider?: string }> = {
  'flux-schnell': { 
    id: 'black-forest-labs/FLUX.1-schnell', 
    maxWidth: 1024, 
    maxHeight: 1024,
    provider: 'hf-inference'
  },
  'sdxl': { 
    id: 'stabilityai/stable-diffusion-xl-base-1.0', 
    maxWidth: 1024, 
    maxHeight: 1024,
    provider: 'hf-inference'
  },
  'sd-3.5-turbo': { 
    id: 'stabilityai/stable-diffusion-3.5-large-turbo', 
    maxWidth: 1024, 
    maxHeight: 1024,
    provider: 'hf-inference'
  },
};

// Fallback order when primary model fails
const MODEL_FALLBACK_ORDER = ['flux-schnell', 'sdxl', 'sd-3.5-turbo'];

const DEFAULT_MODEL = 'flux-schnell';

// Extended retry configuration - up to 5 minutes total
const RETRY_CONFIG = {
  maxRetries: 8,
  initialDelay: 10000,     // 10 seconds
  maxDelay: 60000,         // 1 minute max per retry
  totalTimeout: 300000,    // 5 minutes total
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function generateWithRetry(
  client: HfInference,
  modelId: string,
  prompt: string,
  negativePrompt: string,
  width: number,
  height: number,
  steps: number,
  guidance: number,
): Promise<Blob> {
  const startTime = Date.now();
  let lastError: Error | null = null;
  let retryDelay = RETRY_CONFIG.initialDelay;
  
  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    const elapsedMs = Date.now() - startTime;
    if (elapsedMs >= RETRY_CONFIG.totalTimeout) {
      throw new Error(`Generation timed out after ${Math.round(elapsedMs / 1000)} seconds`);
    }
    
    try {
      console.log(`[Image Gen] Attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries + 1} - Model: ${modelId}`);
      
      const result = await client.textToImage({
        model: modelId,
        inputs: prompt,
        parameters: {
          negative_prompt: negativePrompt,
          width: width,
          height: height,
          num_inference_steps: steps,
          guidance_scale: guidance,
        },
      });
      
      return result;
    } catch (error) {
      lastError = error as Error;
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[Image Gen] Attempt ${attempt + 1} failed:`, errorMessage);
      
      // Check for model loading (503) or rate limit (429)
      if (errorMessage.includes('503') || errorMessage.includes('loading')) {
        // Extract estimated_time if available
        let waitTime = retryDelay;
        const timeMatch = errorMessage.match(/estimated_time['":\s]+(\d+)/);
        if (timeMatch) {
          waitTime = Math.min(parseInt(timeMatch[1]) * 1000, RETRY_CONFIG.maxDelay);
        }
        
        console.log(`[Image Gen] Model loading, waiting ${waitTime/1000}s before retry...`);
        await delay(waitTime);
        retryDelay = Math.min(retryDelay * 1.5, RETRY_CONFIG.maxDelay);
        continue;
      }
      
      if (errorMessage.includes('429')) {
        console.log(`[Image Gen] Rate limited, waiting ${retryDelay/1000}s before retry...`);
        await delay(retryDelay);
        retryDelay = Math.min(retryDelay * 2, RETRY_CONFIG.maxDelay);
        continue;
      }
      
      // Non-retriable error - throw immediately
      throw error;
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
}

async function generateWithFallback(
  client: HfInference,
  preferredModel: string,
  prompt: string,
  negativePrompt: string,
  width: number,
  height: number,
  steps: number,
  guidance: number,
): Promise<{ blob: Blob; usedModel: string }> {
  const modelsToTry = [preferredModel, ...MODEL_FALLBACK_ORDER.filter(m => m !== preferredModel)];
  
  for (const modelKey of modelsToTry) {
    const modelConfig = IMAGE_MODELS[modelKey];
    if (!modelConfig) continue;
    
    const clampedWidth = Math.min(width, modelConfig.maxWidth);
    const clampedHeight = Math.min(height, modelConfig.maxHeight);
    
    try {
      console.log(`[Image Gen] Trying model: ${modelKey} (${modelConfig.id})`);
      const blob = await generateWithRetry(
        client,
        modelConfig.id,
        prompt,
        negativePrompt,
        clampedWidth,
        clampedHeight,
        steps,
        guidance,
      );
      return { blob, usedModel: modelConfig.id };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[Image Gen] Model ${modelKey} failed:`, errorMessage);
      
      // If it's a 404 or model not available, try next model
      if (errorMessage.includes('404') || errorMessage.includes('not available')) {
        console.log(`[Image Gen] Model not available, trying fallback...`);
        continue;
      }
      
      // For other errors, throw if this is the last model
      if (modelKey === modelsToTry[modelsToTry.length - 1]) {
        throw error;
      }
    }
  }
  
  throw new Error('All models failed. Please try again later.');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!HUGGINGFACE_API_KEY) {
      throw new Error('HUGGINGFACE_API_KEY is not configured. Please add your API key in Settings.');
    }

    const client = new HfInference(HUGGINGFACE_API_KEY);

    const { 
      prompt, 
      negativePrompt = 'low quality, blurry, distorted, ugly, deformed', 
      model = DEFAULT_MODEL,
      width = 1024,
      height = 1024,
      numInferenceSteps = 25,
      guidanceScale = 7.5,
    } = await req.json();

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    console.log(`[Image Gen] Request - Model: ${model}, Dimensions: ${width}x${height}`);
    console.log(`[Image Gen] Prompt: ${prompt.substring(0, 100)}...`);

    const { blob, usedModel } = await generateWithFallback(
      client,
      model,
      prompt,
      negativePrompt,
      width,
      height,
      numInferenceSteps,
      guidanceScale,
    );

    // Convert blob to base64
    const arrayBuffer = await blob.arrayBuffer();
    const base64Image = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    console.log(`[Image Gen] Success! Model: ${usedModel}, Size: ${arrayBuffer.byteLength} bytes`);

    return new Response(JSON.stringify({
      success: true,
      image: `data:image/png;base64,${base64Image}`,
      model: usedModel,
      prompt: prompt,
      dimensions: { width, height },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Image Gen] Error:', error);
    
    // Return user-friendly error messages
    let userMessage = errorMessage;
    let hint = 'Try using flux-schnell model for best results.';
    
    if (errorMessage.includes('timeout')) {
      userMessage = 'Generation timed out. The model may be under heavy load.';
      hint = 'Try again in a few minutes or use a different model.';
    } else if (errorMessage.includes('429')) {
      userMessage = 'Rate limit exceeded. Please wait before trying again.';
      hint = 'Wait 30-60 seconds before your next request.';
    }
    
    return new Response(JSON.stringify({
      error: userMessage,
      success: false,
      hint: hint,
      availableModels: Object.keys(IMAGE_MODELS),
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
