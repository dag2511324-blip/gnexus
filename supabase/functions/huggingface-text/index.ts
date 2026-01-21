import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { HfInference } from "https://esm.sh/@huggingface/inference@2.8.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HUGGINGFACE_API_KEY = Deno.env.get('HUGGINGFACE_API_KEY');

// VERIFIED WORKING text models on free HuggingFace Inference API
// Using smaller models that are more reliable on free tier
const TEXT_MODELS: Record<string, { id: string; description: string; contextLength: number; format: string }> = {
  'mistral': { 
    id: 'mistralai/Mistral-7B-Instruct-v0.3',
    description: 'Fast and efficient instruction model',
    contextLength: 8192,
    format: 'mistral'
  },
  'phi': { 
    id: 'microsoft/Phi-3-mini-4k-instruct',
    description: 'Compact but powerful (recommended)',
    contextLength: 4096,
    format: 'phi'
  },
  'gemma': { 
    id: 'google/gemma-2-2b-it',
    description: 'Google lightweight model',
    contextLength: 8192,
    format: 'gemma'
  },
  'qwen-small': { 
    id: 'Qwen/Qwen2.5-1.5B-Instruct',
    description: 'Small Qwen model - fast',
    contextLength: 4096,
    format: 'qwen'
  },
  'llama-small': { 
    id: 'meta-llama/Llama-3.2-1B-Instruct',
    description: 'Small Llama - very fast',
    contextLength: 4096,
    format: 'llama'
  },
};

// Code-specific models
const CODE_MODELS: Record<string, { id: string; description: string; contextLength: number; format: string }> = {
  'qwen-coder': { 
    id: 'Qwen/Qwen2.5-Coder-1.5B-Instruct',
    description: 'Small but capable code model',
    contextLength: 8192,
    format: 'qwen'
  },
  'starcoder': { 
    id: 'bigcode/starcoder2-3b',
    description: 'Multi-language code model',
    contextLength: 8192,
    format: 'starcoder'
  },
};

const ALL_MODELS = { ...TEXT_MODELS, ...CODE_MODELS };
const DEFAULT_MODEL = 'phi';

// Fallback order when primary model fails
const MODEL_FALLBACK_ORDER = ['phi', 'gemma', 'llama-small', 'mistral'];

// Extended retry configuration - up to 2 minutes total
const RETRY_CONFIG = {
  maxRetries: 5,
  initialDelay: 8000,      // 8 seconds
  maxDelay: 30000,         // 30 seconds max per retry
  totalTimeout: 120000,    // 2 minutes total
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function formatPrompt(modelFormat: string, prompt: string, systemPrompt?: string): string {
  switch (modelFormat) {
    case 'mistral':
      return systemPrompt 
        ? `[INST] ${systemPrompt}\n\n${prompt} [/INST]`
        : `[INST] ${prompt} [/INST]`;
    
    case 'qwen':
      return systemPrompt
        ? `<|im_start|>system\n${systemPrompt}<|im_end|>\n<|im_start|>user\n${prompt}<|im_end|>\n<|im_start|>assistant\n`
        : `<|im_start|>user\n${prompt}<|im_end|>\n<|im_start|>assistant\n`;
    
    case 'phi':
      return systemPrompt
        ? `<|system|>\n${systemPrompt}<|end|>\n<|user|>\n${prompt}<|end|>\n<|assistant|>\n`
        : `<|user|>\n${prompt}<|end|>\n<|assistant|>\n`;
    
    case 'gemma':
      return systemPrompt
        ? `<start_of_turn>user\n${systemPrompt}\n\n${prompt}<end_of_turn>\n<start_of_turn>model\n`
        : `<start_of_turn>user\n${prompt}<end_of_turn>\n<start_of_turn>model\n`;
    
    case 'llama':
      return systemPrompt
        ? `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n${systemPrompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n${prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n`
        : `<|begin_of_text|><|start_header_id|>user<|end_header_id|>\n${prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n`;
    
    case 'starcoder':
      return systemPrompt
        ? `### System:\n${systemPrompt}\n\n### User:\n${prompt}\n\n### Assistant:\n`
        : `### User:\n${prompt}\n\n### Assistant:\n`;
    
    default:
      return prompt;
  }
}

async function generateTextWithRetry(
  client: HfInference,
  modelId: string,
  formattedPrompt: string,
  maxTokens: number,
  temperature: number,
): Promise<string> {
  const startTime = Date.now();
  let lastError: Error | null = null;
  let retryDelay = RETRY_CONFIG.initialDelay;
  
  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    const elapsedMs = Date.now() - startTime;
    if (elapsedMs >= RETRY_CONFIG.totalTimeout) {
      throw new Error(`Text generation timed out after ${Math.round(elapsedMs / 1000)} seconds`);
    }
    
    try {
      console.log(`[Text Gen] Attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries + 1} - Model: ${modelId}`);
      
      const result = await client.textGeneration({
        model: modelId,
        inputs: formattedPrompt,
        parameters: {
          max_new_tokens: maxTokens,
          temperature: temperature,
          return_full_text: false,
          do_sample: temperature > 0,
          top_p: 0.95,
          repetition_penalty: 1.1,
        },
      });
      
      return result.generated_text;
    } catch (error) {
      lastError = error as Error;
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[Text Gen] Attempt ${attempt + 1} failed:`, errorMessage);
      
      if (errorMessage.includes('503') || errorMessage.includes('loading')) {
        let waitTime = retryDelay;
        const timeMatch = errorMessage.match(/estimated_time['":\s]+(\d+)/);
        if (timeMatch) {
          waitTime = Math.min(parseInt(timeMatch[1]) * 1000, RETRY_CONFIG.maxDelay);
        }
        
        console.log(`[Text Gen] Model loading, waiting ${waitTime/1000}s before retry...`);
        await delay(waitTime);
        retryDelay = Math.min(retryDelay * 1.5, RETRY_CONFIG.maxDelay);
        continue;
      }
      
      if (errorMessage.includes('429')) {
        console.log(`[Text Gen] Rate limited, waiting ${retryDelay/1000}s before retry...`);
        await delay(retryDelay);
        retryDelay = Math.min(retryDelay * 2, RETRY_CONFIG.maxDelay);
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
}

async function generateWithFallback(
  client: HfInference,
  preferredModel: string,
  prompt: string,
  systemPrompt: string | undefined,
  maxTokens: number,
  temperature: number,
): Promise<{ text: string; usedModel: string }> {
  const modelsToTry = [preferredModel, ...MODEL_FALLBACK_ORDER.filter(m => m !== preferredModel)];
  
  for (const modelKey of modelsToTry) {
    const modelConfig = ALL_MODELS[modelKey];
    if (!modelConfig) continue;
    
    const formattedPrompt = formatPrompt(modelConfig.format, prompt, systemPrompt);
    const clampedTokens = Math.min(maxTokens, modelConfig.contextLength / 2);
    
    try {
      console.log(`[Text Gen] Trying model: ${modelKey} (${modelConfig.id})`);
      const text = await generateTextWithRetry(
        client,
        modelConfig.id,
        formattedPrompt,
        clampedTokens,
        temperature,
      );
      return { text, usedModel: modelConfig.id };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[Text Gen] Model ${modelKey} failed:`, errorMessage);
      
      // Model not available - try next
      if (errorMessage.includes('404') || errorMessage.includes('not available')) {
        console.log(`[Text Gen] Model not available, trying fallback...`);
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
      throw new Error('HUGGINGFACE_API_KEY is not configured');
    }

    const client = new HfInference(HUGGINGFACE_API_KEY);

    const { 
      prompt, 
      model = DEFAULT_MODEL, 
      maxTokens = 512, 
      temperature = 0.7, 
      systemPrompt 
    } = await req.json();

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    console.log(`[Text Gen] Request - Model: ${model}, MaxTokens: ${maxTokens}`);
    console.log(`[Text Gen] Prompt: ${prompt.substring(0, 100)}...`);

    const { text, usedModel } = await generateWithFallback(
      client,
      model,
      prompt,
      systemPrompt,
      maxTokens,
      temperature,
    );

    console.log(`[Text Gen] Success! Model: ${usedModel}, Length: ${text.length} chars`);

    return new Response(JSON.stringify({
      success: true,
      text: text.trim(),
      model: usedModel,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Text Gen] Error:', error);
    
    let hint = 'Try using phi or gemma models for best results on free tier.';
    if (errorMessage.includes('timeout')) {
      hint = 'The model is taking too long. Try a smaller model like phi or llama-small.';
    }
    
    return new Response(JSON.stringify({
      error: errorMessage,
      success: false,
      hint: hint,
      availableModels: Object.keys(ALL_MODELS),
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
