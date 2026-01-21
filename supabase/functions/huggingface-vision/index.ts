// HuggingFace Vision Edge Function - Classification, Detection, Depth, Segmentation

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HUGGINGFACE_API_KEY = Deno.env.get('HUGGINGFACE_API_KEY');

// Vision task models
const VISION_MODELS: Record<string, Record<string, { id: string; description: string }>> = {
  'image-classification': {
    'vit-large': { id: 'google/vit-large-patch16-224', description: 'Vision Transformer Large' },
    'resnet-50': { id: 'microsoft/resnet-50', description: 'ResNet-50' },
  },
  'object-detection': {
    'detr': { id: 'facebook/detr-resnet-50', description: 'DETR with ResNet-50' },
    'yolos': { id: 'hustvl/yolos-small', description: 'YOLOS Small' },
  },
  'depth-estimation': {
    'dpt-large': { id: 'Intel/dpt-large', description: 'DPT Large' },
  },
  'image-segmentation': {
    'segformer': { id: 'nvidia/segformer-b5-finetuned-ade-640-640', description: 'SegFormer B5' },
  },
};

const DEFAULT_MODELS: Record<string, string> = {
  'image-classification': 'vit-large',
  'object-detection': 'detr',
  'depth-estimation': 'dpt-large',
  'image-segmentation': 'segformer',
};

const RETRY_CONFIG = {
  maxRetries: 5,
  initialDelay: 2000,
  maxDelay: 30000,
  totalTimeout: 180000,
};

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function processWithRetry(
  task: string,
  modelId: string,
  imageData: Uint8Array,
): Promise<unknown> {
  const startTime = Date.now();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < RETRY_CONFIG.maxRetries; attempt++) {
    const elapsed = Date.now() - startTime;
    if (elapsed >= RETRY_CONFIG.totalTimeout) {
      throw new Error(`Timeout after ${RETRY_CONFIG.totalTimeout / 1000}s`);
    }

    try {
      console.log(`[Vision] Task: ${task}, Model: ${modelId}, Attempt: ${attempt + 1}`);
      const imageBlob = new Blob([imageData.slice().buffer]);
      const response = await fetch(`https://api-inference.huggingface.co/models/${modelId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/octet-stream',
        },
        body: imageBlob,
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 503) {
          const waitTime = Math.min(RETRY_CONFIG.initialDelay * Math.pow(2, attempt), RETRY_CONFIG.maxDelay);
          console.log(`[Vision] Model loading, waiting ${waitTime}ms...`);
          await delay(waitTime);
          continue;
        }
        throw new Error(`API error: ${errorText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('image')) {
        return await response.blob();
      }
      return await response.json();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.error(`[Vision] Attempt ${attempt + 1} failed:`, lastError.message);

      if (attempt < RETRY_CONFIG.maxRetries - 1) {
        const waitTime = Math.min(RETRY_CONFIG.initialDelay * Math.pow(2, attempt), RETRY_CONFIG.maxDelay);
        await delay(waitTime);
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const contentType = req.headers.get('content-type') || '';
    let task: string;
    let modelKey: string;
    let imageData: Uint8Array;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      task = formData.get('task') as string || 'image-classification';
      modelKey = formData.get('model') as string || DEFAULT_MODELS[task] || 'vit-large';
      const imageFile = formData.get('image') as File;
      if (!imageFile) throw new Error('No image provided');
      imageData = new Uint8Array(await imageFile.arrayBuffer());
    } else {
      const body = await req.json();
      task = body.task || 'image-classification';
      modelKey = body.model || DEFAULT_MODELS[task] || 'vit-large';
      if (body.image) {
        const base64Data = body.image.replace(/^data:image\/\w+;base64,/, '');
        imageData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      } else if (body.imageUrl) {
        const imageResponse = await fetch(body.imageUrl);
        imageData = new Uint8Array(await imageResponse.arrayBuffer());
      } else {
        throw new Error('No image provided');
      }
    }

    const taskModels = VISION_MODELS[task];
    if (!taskModels) throw new Error(`Unknown task: ${task}`);
    const modelConfig = taskModels[modelKey];
    if (!modelConfig) throw new Error(`Unknown model: ${modelKey}`);

    console.log(`[Vision] Processing ${task} with ${modelConfig.id}`);
    const result = await processWithRetry(task, modelConfig.id, imageData);

    if (result instanceof Blob) {
      const arrayBuffer = await result.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      return new Response(JSON.stringify({
        success: true, task, model: modelConfig.id,
        result: `data:image/png;base64,${base64}`, resultType: 'image',
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({
      success: true, task, model: modelConfig.id, result, resultType: 'json',
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    return new Response(JSON.stringify({
      success: false, error: error.message,
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
