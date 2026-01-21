import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  messages: Message[];
  model?: string;
  stream?: boolean;
}

// Free models to fallback to
const FALLBACK_MODELS = [
  'meta-llama/llama-3.2-3b-instruct:free',
  'qwen/qwen-2.5-7b-instruct:free',
  'google/gemma-2-9b-it:free',
  'mistralai/mistral-7b-instruct:free',
  'deepseek/deepseek-chat:free',
];

async function callOpenRouter(apiKey: string, messages: Message[], model: string, stream: boolean) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://lovable.dev',
      'X-Title': 'G-CORE01 Design Orchestrator',
    },
    body: JSON.stringify({
      model,
      messages,
      stream,
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  return response;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('OPENROUTER_API_KEY');
    
    if (!apiKey) {
      console.error('OPENROUTER_API_KEY not configured');
      throw new Error('OpenRouter API key not configured');
    }

    const { messages, model = 'meta-llama/llama-3.2-3b-instruct:free', stream = false }: RequestBody = await req.json();

    console.log(`[G-CORE01] Request: model=${model}, messages=${messages.length}, stream=${stream}`);

    // Try the requested model first
    let currentModelIndex = FALLBACK_MODELS.indexOf(model);
    if (currentModelIndex === -1) currentModelIndex = 0;
    
    let attempts = 0;
    const maxAttempts = FALLBACK_MODELS.length;
    let lastError = '';

    while (attempts < maxAttempts) {
      const currentModel = FALLBACK_MODELS[currentModelIndex];
      console.log(`[G-CORE01] Attempt ${attempts + 1}: Using ${currentModel}`);

      try {
        const openRouterResponse = await callOpenRouter(apiKey, messages, currentModel, stream);

        if (openRouterResponse.ok) {
          if (stream) {
            console.log('[G-CORE01] Streaming response started');
            return new Response(openRouterResponse.body, {
              headers: {
                ...corsHeaders,
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
              },
            });
          } else {
            const data = await openRouterResponse.json();
            console.log('[G-CORE01] Response received successfully');
            
            return new Response(JSON.stringify(data), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }

        // Check for rate limiting or errors
        const errorText = await openRouterResponse.text();
        console.error(`[G-CORE01] Error with ${currentModel}: ${openRouterResponse.status} - ${errorText}`);
        lastError = errorText;

        // If rate limited (429) or server error (5xx), try next model
        if (openRouterResponse.status === 429 || openRouterResponse.status >= 500) {
          currentModelIndex = (currentModelIndex + 1) % FALLBACK_MODELS.length;
          attempts++;
          
          // Small delay before retry
          await new Promise(resolve => setTimeout(resolve, 500));
          continue;
        }

        // For other errors, throw immediately
        throw new Error(`OpenRouter API error: ${openRouterResponse.status} - ${errorText}`);
      } catch (fetchError) {
        console.error(`[G-CORE01] Fetch error with ${currentModel}:`, fetchError);
        lastError = fetchError instanceof Error ? fetchError.message : 'Unknown fetch error';
        currentModelIndex = (currentModelIndex + 1) % FALLBACK_MODELS.length;
        attempts++;
        
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // All models failed
    throw new Error(`All models failed. Last error: ${lastError}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[G-CORE01] Final error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
