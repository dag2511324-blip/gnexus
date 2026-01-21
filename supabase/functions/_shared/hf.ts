// Shared HuggingFace utilities for Edge Functions

const HUGGINGFACE_API_KEY = Deno.env.get('HUGGINGFACE_API_KEY');

export const HF_API_KEY = HUGGINGFACE_API_KEY;
export const HF_BASE_URL = 'https://api-inference.huggingface.co/models';

export interface JsonResponseInit extends ResponseInit {
  headers?: Record<string, string>;
}

export function json(data: unknown, init: JsonResponseInit = {}): Response {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json', ...init.headers },
    ...init,
  });
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Expected wait times for different model categories (in seconds)
export const EXPECTED_WAIT_TIMES: Record<string, { min: number; max: number }> = {
  // Image generation
  'flux-schnell': { min: 5, max: 30 },
  'sdxl': { min: 10, max: 60 },
  'sd-3.5-turbo': { min: 10, max: 45 },

  // Speech-to-text
  'whisper-large': { min: 15, max: 60 },
  'whisper-turbo': { min: 5, max: 30 },

  // Text-to-speech
  'mms-tts': { min: 3, max: 15 },
  'parler-tts': { min: 5, max: 30 },
  'bark': { min: 10, max: 45 },

  // Text generation
  'llama': { min: 3, max: 20 },
  'mistral': { min: 3, max: 20 },
  'phi': { min: 2, max: 15 },
  'qwen': { min: 3, max: 20 },
  'gemma': { min: 3, max: 20 },

  // Vision
  'vit': { min: 2, max: 10 },
  'detr': { min: 3, max: 15 },
  'dpt': { min: 5, max: 20 },
  'segformer': { min: 5, max: 25 },

  // Multimodal
  'blip': { min: 3, max: 20 },
  'vilt': { min: 3, max: 15 },
  'llava': { min: 10, max: 45 },

  // Default
  'default': { min: 5, max: 30 },
};

export function getExpectedWait(modelKey: string): { min: number; max: number } {
  return EXPECTED_WAIT_TIMES[modelKey] || EXPECTED_WAIT_TIMES['default'];
}

// Retry configuration factory
export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  totalTimeout: number;
}

export const RETRY_CONFIGS: Record<string, RetryConfig> = {
  image: {
    maxRetries: 8,
    initialDelay: 10000,
    maxDelay: 60000,
    totalTimeout: 300000, // 5 minutes
  },
  audio: {
    maxRetries: 6,
    initialDelay: 10000,
    maxDelay: 45000,
    totalTimeout: 180000, // 3 minutes
  },
  text: {
    maxRetries: 5,
    initialDelay: 8000,
    maxDelay: 30000,
    totalTimeout: 120000, // 2 minutes
  },
  vision: {
    maxRetries: 5,
    initialDelay: 5000,
    maxDelay: 30000,
    totalTimeout: 120000, // 2 minutes
  },
  multimodal: {
    maxRetries: 5,
    initialDelay: 8000,
    maxDelay: 45000,
    totalTimeout: 180000, // 3 minutes
  },
  video: {
    maxRetries: 10,
    initialDelay: 15000,
    maxDelay: 120000,
    totalTimeout: 600000, // 10 minutes
  },
};

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Parse estimated time from HuggingFace error messages
export function parseEstimatedTime(errorMessage: string, fallbackDelay: number): number {
  const timeMatch = errorMessage.match(/estimated_time['":\s]+(\d+)/);
  if (timeMatch) {
    return Math.min(parseInt(timeMatch[1]) * 1000, 60000);
  }
  return fallbackDelay;
}

// Standard error response
export function errorResponse(
  message: string,
  status: number = 500,
  extras: Record<string, unknown> = {}
): Response {
  return json({
    success: false,
    error: message,
    ...extras,
  }, { status, headers: corsHeaders });
}

// Standard success response
export function successResponse(data: Record<string, unknown>): Response {
  return json({
    success: true,
    ...data,
  }, { headers: corsHeaders });
}
