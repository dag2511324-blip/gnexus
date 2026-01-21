// HuggingFace Multimodal Edge Function - VQA, Image-to-Text, Image+Text

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HUGGINGFACE_API_KEY = Deno.env.get('HUGGINGFACE_API_KEY');

const MULTIMODAL_MODELS: Record<string, Record<string, { id: string; description: string }>> = {
  'image-to-text': {
    'blip': { id: 'Salesforce/blip-image-captioning-large', description: 'BLIP Large Captioning' },
    'git': { id: 'microsoft/git-large-coco', description: 'GIT Large COCO' },
  },
  'visual-qa': {
    'vilt': { id: 'dandelin/vilt-b32-finetuned-vqa', description: 'ViLT VQA' },
    'blip-vqa': { id: 'Salesforce/blip-vqa-base', description: 'BLIP VQA' },
  },
  'document-qa': {
    'donut': { id: 'naver-clova-ix/donut-base-finetuned-docvqa', description: 'Donut DocVQA' },
  },
};

const DEFAULT_MODELS: Record<string, string> = {
  'image-to-text': 'blip',
  'visual-qa': 'vilt',
  'document-qa': 'donut',
};

const RETRY_CONFIG = { maxRetries: 5, initialDelay: 3000, maxDelay: 45000, totalTimeout: 300000 };

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function processWithRetry(
  task: string, modelId: string, imageData: Uint8Array, question?: string,
): Promise<unknown> {
  const startTime = Date.now();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < RETRY_CONFIG.maxRetries; attempt++) {
    if (Date.now() - startTime >= RETRY_CONFIG.totalTimeout) {
      throw new Error(`Timeout after ${RETRY_CONFIG.totalTimeout / 1000}s`);
    }

    try {
      console.log(`[Multimodal] Task: ${task}, Model: ${modelId}, Attempt: ${attempt + 1}`);
      const imageBlob = new Blob([imageData.slice().buffer]);
      const response = await fetch(`https://api-inference.huggingface.co/models/${modelId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': task === 'image-to-text' ? 'application/octet-stream' : 'application/json',
        },
        body: task === 'image-to-text'
          ? imageBlob
          : JSON.stringify({ inputs: { image: Array.from(imageData), question } }),
      });

      if (!response.ok) {
        if (response.status === 503) {
          const waitTime = Math.min(RETRY_CONFIG.initialDelay * Math.pow(2, attempt), RETRY_CONFIG.maxDelay);
          await delay(waitTime);
          continue;
        }
        throw new Error(await response.text());
      }
      return await response.json();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < RETRY_CONFIG.maxRetries - 1) {
        await delay(RETRY_CONFIG.initialDelay * Math.pow(2, attempt));
      }
    }
  }
  throw lastError || new Error('Max retries exceeded');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const task = body.task || 'image-to-text';
    const modelKey = body.model || DEFAULT_MODELS[task] || 'blip';

    let imageData: Uint8Array;
    if (body.image) {
      const base64Data = body.image.replace(/^data:image\/\w+;base64,/, '');
      imageData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    } else if (body.imageUrl) {
      imageData = new Uint8Array(await (await fetch(body.imageUrl)).arrayBuffer());
    } else {
      throw new Error('No image provided');
    }

    const taskModels = MULTIMODAL_MODELS[task];
    if (!taskModels) throw new Error(`Unknown task: ${task}`);
    const modelConfig = taskModels[modelKey];
    if (!modelConfig) throw new Error(`Unknown model: ${modelKey}`);

    const result = await processWithRetry(task, modelConfig.id, imageData, body.question);

    let text = '';
    if (Array.isArray(result) && result[0]?.generated_text) text = result[0].generated_text;
    else if (typeof result === 'object' && result !== null && 'generated_text' in result) text = (result as { generated_text: string }).generated_text;
    else if (Array.isArray(result) && result[0]?.answer) text = result[0].answer;
    else text = JSON.stringify(result);

    return new Response(JSON.stringify({
      success: true, task, model: modelConfig.id, result: text,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
