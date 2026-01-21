import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * IMPORTANT: Video generation models are NOT available on the free HuggingFace Inference API.
 * They require either:
 * - HuggingFace Pro subscription ($9/month)
 * - Dedicated Inference Endpoints
 * - Third-party providers (Replicate, Fal.ai, etc.)
 * 
 * This function returns a clear message directing users to use image generation instead.
 */

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, model } = await req.json();

    console.log(`[Video Gen] Request received - Model: ${model || 'default'}`);
    console.log(`[Video Gen] Prompt: ${prompt?.substring(0, 100) || 'none'}...`);
    console.log(`[Video Gen] Video generation is NOT available on free HuggingFace Inference API`);

    // Return informative response about video generation limitations
    return new Response(JSON.stringify({
      success: false,
      error: 'Video generation is not available on the free HuggingFace tier.',
      details: 'Video models like Text-to-Video MS and Zeroscope require HuggingFace Pro subscription or dedicated endpoints.',
      suggestion: 'Use Image Generation with FLUX.1 Schnell or SDXL for visual content. These models are fast, high-quality, and available on the free tier.',
      alternativeAction: 'image',
      alternatives: [
        {
          name: 'FLUX.1 Schnell',
          description: 'Fast 4-step image generation with excellent quality',
          action: 'Use Image Generation tool',
        },
        {
          name: 'SDXL',
          description: 'High-quality photorealistic images',
          action: 'Use Image Generation tool',
        },
        {
          name: 'Lovable AI Video',
          description: 'Built-in video generation (if available)',
          action: 'Use Lovable AI video generation',
        },
      ],
      upgradeOptions: [
        {
          name: 'HuggingFace Pro',
          price: '$9/month',
          link: 'https://huggingface.co/pricing',
          features: ['Video generation', 'Priority inference', 'More models'],
        },
        {
          name: 'Replicate',
          price: 'Pay per use',
          link: 'https://replicate.com',
          features: ['Stable Video Diffusion', 'AnimateDiff', 'Many video models'],
        },
        {
          name: 'Fal.ai',
          price: 'Pay per use',
          link: 'https://fal.ai',
          features: ['Fast video generation', 'Multiple models'],
        },
      ],
    }), {
      status: 503,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Video Gen] Error:', error);
    return new Response(JSON.stringify({
      error: errorMessage,
      success: false,
      hint: 'Video generation requires HuggingFace Pro. Use image generation instead.',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
