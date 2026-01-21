// Comprehensive AI Model Registry - All Task Categories with Best 3 Models

import { TaskType, TaskCategory } from './tasks';

export type Modality = 'video' | 'image' | 'audio' | 'text' | 'code';
export type LicenseType = 'Apache 2.0' | 'MIT' | 'Llama 3' | 'Commercial' | 'OpenRAIL' | 'CC-BY-NC';
export type ModelAvailability = 'available' | 'loading' | 'pro-only' | 'unavailable';

export interface ModelParameter {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'select';
  label: string;
  default: number | string | boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  description?: string;
}

export interface AIModelFull {
  id: string;
  name: string;
  description: string;
  modality: Modality;
  taskType?: TaskType;
  provider: string;
  license: LicenseType;
  huggingfaceId: string;
  advantage: string;
  recommended?: boolean;
  rank?: number; // 1 = Best, 2 = Second, 3 = Third
  available?: ModelAvailability;
  parameters: ModelParameter[];
  capabilities: string[];
  maxTokens?: number;
  supportsStreaming?: boolean;
  estimatedTime?: string;
  color: string;
}

// ============= VIDEO MODELS (Pro Only) =============
export const VIDEO_MODELS: AIModelFull[] = [
  {
    id: 'pyramid-flow-sd3',
    name: 'Pyramid Flow SD3',
    description: 'Latest SOTA text-to-video (2025)',
    modality: 'video',
    taskType: 'text-to-video',
    provider: 'Pyramid Flow',
    license: 'MIT',
    huggingfaceId: 'pyramid-flow/pyramid-flow-sd3',
    advantage: '🏆 #1 - Best quality, MIT licensed',
    rank: 1,
    available: 'pro-only',
    estimatedTime: '60-180s (Pro)',
    color: 'from-purple-500/50 to-pink-500/50',
    capabilities: ['text-to-video', 'high-quality', '768p', '24fps'],
    parameters: [
      { name: 'numFrames', type: 'number', label: 'Frames', default: 24, min: 8, max: 48, step: 8 },
      { name: 'fps', type: 'number', label: 'FPS', default: 24, min: 8, max: 30, step: 1 },
    ],
  },
  {
    id: 'wan-2.2',
    name: 'Wan 2.2',
    description: 'Fast video generation with MoE',
    modality: 'video',
    taskType: 'text-to-video',
    provider: 'Wan AI',
    license: 'Apache 2.0',
    huggingfaceId: 'Wan-AI/Wan2.2-T2V-14B',
    advantage: '🥈 #2 - Fastest, production-ready',
    rank: 2,
    available: 'pro-only',
    estimatedTime: '45-120s (Pro)',
    color: 'from-violet-500/50 to-purple-500/50',
    capabilities: ['text-to-video', 'fast', 'moe-architecture'],
    parameters: [
      { name: 'numFrames', type: 'number', label: 'Frames', default: 16, min: 8, max: 24, step: 4 },
    ],
  },
  {
    id: 'animatediff',
    name: 'AnimateDiff',
    description: 'Stylized animation and motion',
    modality: 'video',
    taskType: 'text-to-video',
    provider: 'LayerDiffusion',
    license: 'Apache 2.0',
    huggingfaceId: 'guoyww/animatediff',
    advantage: '🥉 #3 - Best for stylized animation',
    rank: 3,
    available: 'pro-only',
    estimatedTime: '60-180s (Pro)',
    color: 'from-rose-500/50 to-orange-500/50',
    capabilities: ['animation', 'stylized', 'motion-lora'],
    parameters: [
      { name: 'numFrames', type: 'number', label: 'Frames', default: 16, min: 8, max: 24, step: 4 },
      { name: 'motionStrength', type: 'number', label: 'Motion', default: 0.5, min: 0.1, max: 1, step: 0.1 },
    ],
  },
];

// ============= IMAGE MODELS (Verified Working) =============
export const IMAGE_MODELS: AIModelFull[] = [
  {
    id: 'flux-schnell',
    name: 'FLUX.1 Schnell',
    description: 'Fastest FLUX with excellent typography',
    modality: 'image',
    taskType: 'text-to-image',
    provider: 'Black Forest Labs',
    license: 'Apache 2.0',
    huggingfaceId: 'black-forest-labs/FLUX.1-schnell',
    advantage: '🏆 #1 VERIFIED - Best for logos and text',
    rank: 1,
    recommended: true,
    available: 'available',
    estimatedTime: '5-30s',
    color: 'from-blue-500 to-cyan-500',
    capabilities: ['typography', 'logos', 'fast-generation', 'high-quality'],
    parameters: [
      { name: 'width', type: 'number', label: 'Width', default: 1024, min: 512, max: 1024, step: 64 },
      { name: 'height', type: 'number', label: 'Height', default: 1024, min: 512, max: 1024, step: 64 },
      { name: 'numInferenceSteps', type: 'number', label: 'Steps', default: 4, min: 1, max: 8 },
      { name: 'guidanceScale', type: 'number', label: 'Guidance', default: 0, min: 0, max: 5, step: 0.5 },
    ],
  },
  {
    id: 'sdxl',
    name: 'SDXL 1.0',
    description: 'Stable Diffusion XL - high quality',
    modality: 'image',
    taskType: 'text-to-image',
    provider: 'Stability AI',
    license: 'OpenRAIL',
    huggingfaceId: 'stabilityai/stable-diffusion-xl-base-1.0',
    advantage: '🥈 #2 VERIFIED - Excellent quality and versatility',
    rank: 2,
    recommended: true,
    available: 'available',
    estimatedTime: '10-60s',
    color: 'from-indigo-500 to-blue-500',
    capabilities: ['photorealistic', 'artistic', 'detailed', 'versatile'],
    parameters: [
      { name: 'width', type: 'number', label: 'Width', default: 1024, min: 512, max: 1024, step: 64 },
      { name: 'height', type: 'number', label: 'Height', default: 1024, min: 512, max: 1024, step: 64 },
      { name: 'numInferenceSteps', type: 'number', label: 'Steps', default: 30, min: 10, max: 50 },
      { name: 'guidanceScale', type: 'number', label: 'Guidance', default: 7.5, min: 1, max: 15, step: 0.5 },
    ],
  },
  {
    id: 'sd-3.5-turbo',
    name: 'SD 3.5 Turbo',
    description: 'Latest SD 3.5 fast model',
    modality: 'image',
    taskType: 'text-to-image',
    provider: 'Stability AI',
    license: 'OpenRAIL',
    huggingfaceId: 'stabilityai/stable-diffusion-3.5-large-turbo',
    advantage: '🥉 #3 Available - Fast with high quality',
    rank: 3,
    available: 'available',
    estimatedTime: '10-45s',
    color: 'from-teal-500 to-sky-500',
    capabilities: ['fast', 'high-quality', 'versatile'],
    parameters: [
      { name: 'width', type: 'number', label: 'Width', default: 1024, min: 512, max: 1024, step: 64 },
      { name: 'height', type: 'number', label: 'Height', default: 1024, min: 512, max: 1024, step: 64 },
      { name: 'numInferenceSteps', type: 'number', label: 'Steps', default: 4, min: 1, max: 8 },
      { name: 'guidanceScale', type: 'number', label: 'Guidance', default: 0, min: 0, max: 5, step: 0.5 },
    ],
  },
];

// ============= AUDIO MODELS (Verified Working) =============
export const AUDIO_MODELS: AIModelFull[] = [
  // STT Models
  {
    id: 'whisper-large',
    name: 'Whisper Large V3',
    description: 'Highest accuracy transcription',
    modality: 'audio',
    taskType: 'speech-to-text',
    provider: 'OpenAI',
    license: 'MIT',
    huggingfaceId: 'openai/whisper-large-v3',
    advantage: '🏆 #1 VERIFIED - Best accuracy for STT',
    rank: 1,
    recommended: true,
    available: 'available',
    estimatedTime: '15-60s',
    color: 'from-emerald-500 to-teal-500',
    capabilities: ['speech-to-text', 'multilingual', 'high-accuracy', 'noisy-audio'],
    parameters: [],
  },
  {
    id: 'whisper-turbo',
    name: 'Whisper Turbo',
    description: 'Fast Whisper variant',
    modality: 'audio',
    taskType: 'speech-to-text',
    provider: 'OpenAI',
    license: 'MIT',
    huggingfaceId: 'openai/whisper-large-v3-turbo',
    advantage: '🥈 #2 VERIFIED - 8x faster than large-v3',
    rank: 2,
    recommended: true,
    available: 'available',
    estimatedTime: '5-30s',
    color: 'from-green-500 to-emerald-500',
    capabilities: ['speech-to-text', 'multilingual', 'fast', 'accurate'],
    parameters: [],
  },
  // TTS Models
  {
    id: 'mms-tts',
    name: 'MMS English TTS',
    description: "Meta's natural speech synthesis",
    modality: 'audio',
    taskType: 'text-to-speech',
    provider: 'Meta',
    license: 'CC-BY-NC',
    huggingfaceId: 'facebook/mms-tts-eng',
    advantage: '🏆 #1 VERIFIED - Best natural TTS',
    rank: 1,
    recommended: true,
    available: 'available',
    estimatedTime: '3-15s',
    color: 'from-lime-500 to-green-500',
    capabilities: ['text-to-speech', 'natural-voice', 'english'],
    parameters: [],
  },
  {
    id: 'parler-tts',
    name: 'Parler TTS',
    description: 'Expressive text-to-speech',
    modality: 'audio',
    taskType: 'text-to-speech',
    provider: 'Parler',
    license: 'Apache 2.0',
    huggingfaceId: 'parler-tts/parler-tts-mini-v1',
    advantage: '🥈 #2 Available - Expressive and natural',
    rank: 2,
    available: 'available',
    estimatedTime: '5-20s',
    color: 'from-cyan-500 to-lime-500',
    capabilities: ['text-to-speech', 'expressive', 'natural'],
    parameters: [],
  },
  {
    id: 'bark',
    name: 'Bark',
    description: 'High-quality expressive TTS',
    modality: 'audio',
    taskType: 'text-to-speech',
    provider: 'Suno',
    license: 'MIT',
    huggingfaceId: 'suno/bark-small',
    advantage: '🥉 #3 Available - Emotions and non-speech sounds',
    rank: 3,
    available: 'loading',
    estimatedTime: '10-45s',
    color: 'from-amber-500 to-yellow-500',
    capabilities: ['text-to-speech', 'emotions', 'multilingual', 'non-speech'],
    parameters: [],
  },
];

// ============= TEXT MODELS (Verified Working) =============
export const TEXT_MODELS: AIModelFull[] = [
  {
    id: 'llama-3.2',
    name: 'LLaMA 3.2 (1B)',
    description: 'Fast and capable general purpose',
    modality: 'text',
    taskType: 'text-generation',
    provider: 'Meta',
    license: 'Llama 3',
    huggingfaceId: 'meta-llama/Llama-3.2-1B-Instruct',
    advantage: '🏆 #1 Available - Best for general tasks',
    rank: 1,
    recommended: true,
    available: 'available',
    maxTokens: 4096,
    supportsStreaming: true,
    estimatedTime: '1-10s',
    color: 'from-blue-500 to-indigo-500',
    capabilities: ['fast', 'efficient', 'instruction-following', 'reasoning'],
    parameters: [
      { name: 'maxTokens', type: 'number', label: 'Max Tokens', default: 512, min: 64, max: 2048, step: 64 },
      { name: 'temperature', type: 'number', label: 'Temperature', default: 0.7, min: 0, max: 2, step: 0.1 },
    ],
  },
  {
    id: 'mistral',
    name: 'Mistral 7B',
    description: 'Fast and efficient instruction model',
    modality: 'text',
    taskType: 'text-generation',
    provider: 'Mistral AI',
    license: 'Apache 2.0',
    huggingfaceId: 'mistralai/Mistral-7B-Instruct-v0.3',
    advantage: '🥈 #2 Available - Best instruction following',
    rank: 2,
    recommended: true,
    available: 'loading',
    maxTokens: 8192,
    supportsStreaming: true,
    estimatedTime: '5-60s (cold start up to 2 min)',
    color: 'from-amber-500 to-orange-500',
    capabilities: ['fast', 'efficient', 'instruction-following', 'creative-writing'],
    parameters: [
      { name: 'maxTokens', type: 'number', label: 'Max Tokens', default: 512, min: 64, max: 4096, step: 64 },
      { name: 'temperature', type: 'number', label: 'Temperature', default: 0.7, min: 0, max: 2, step: 0.1 },
    ],
  },
  {
    id: 'qwen-2.5',
    name: 'Qwen 2.5 (7B)',
    description: 'Multilingual and coding capable',
    modality: 'text',
    taskType: 'text-generation',
    provider: 'Alibaba',
    license: 'Apache 2.0',
    huggingfaceId: 'Qwen/Qwen2.5-7B-Instruct',
    advantage: '🥉 #3 Available - Best multilingual support',
    rank: 3,
    available: 'loading',
    maxTokens: 8192,
    supportsStreaming: true,
    estimatedTime: '5-60s',
    color: 'from-purple-500 to-violet-500',
    capabilities: ['multilingual', 'coding', 'reasoning', 'instruction-following'],
    parameters: [
      { name: 'maxTokens', type: 'number', label: 'Max Tokens', default: 512, min: 64, max: 4096, step: 64 },
      { name: 'temperature', type: 'number', label: 'Temperature', default: 0.7, min: 0, max: 2, step: 0.1 },
    ],
  },
  {
    id: 'phi',
    name: 'Phi-3 Mini',
    description: 'Compact but powerful reasoning',
    modality: 'text',
    taskType: 'text-generation',
    provider: 'Microsoft',
    license: 'MIT',
    huggingfaceId: 'microsoft/Phi-3-mini-4k-instruct',
    advantage: '✅ VERIFIED - Tiny model with big capabilities',
    available: 'available',
    maxTokens: 4096,
    supportsStreaming: true,
    estimatedTime: '2-15s',
    color: 'from-pink-500 to-rose-500',
    capabilities: ['compact', 'fast', 'reasoning', 'efficient'],
    parameters: [
      { name: 'maxTokens', type: 'number', label: 'Max Tokens', default: 512, min: 64, max: 2048, step: 64 },
      { name: 'temperature', type: 'number', label: 'Temperature', default: 0.7, min: 0, max: 2, step: 0.1 },
    ],
  },
  {
    id: 'gemma',
    name: 'Gemma 2 (2B)',
    description: 'Google lightweight model',
    modality: 'text',
    taskType: 'text-generation',
    provider: 'Google',
    license: 'Apache 2.0',
    huggingfaceId: 'google/gemma-2-2b-it',
    advantage: '✅ Available - Fast and efficient',
    available: 'available',
    maxTokens: 8192,
    supportsStreaming: true,
    estimatedTime: '2-20s',
    color: 'from-red-500 to-pink-500',
    capabilities: ['balanced', 'efficient', 'instruction-following'],
    parameters: [
      { name: 'maxTokens', type: 'number', label: 'Max Tokens', default: 512, min: 64, max: 4096, step: 64 },
      { name: 'temperature', type: 'number', label: 'Temperature', default: 0.7, min: 0, max: 2, step: 0.1 },
    ],
  },
];

// ============= CODE MODELS (Verified Working) =============
export const CODE_MODELS: AIModelFull[] = [
  {
    id: 'qwen-coder',
    name: 'Qwen Coder (1.5B)',
    description: 'Fast and capable code model',
    modality: 'code',
    taskType: 'code-generation',
    provider: 'Alibaba',
    license: 'Apache 2.0',
    huggingfaceId: 'Qwen/Qwen2.5-Coder-1.5B-Instruct',
    advantage: '🏆 #1 Available - Best fast code generation',
    rank: 1,
    recommended: true,
    available: 'available',
    maxTokens: 8192,
    supportsStreaming: true,
    estimatedTime: '3-20s',
    color: 'from-violet-500 to-indigo-500',
    capabilities: ['code-generation', 'debugging', 'refactoring', 'multi-language'],
    parameters: [
      { name: 'maxTokens', type: 'number', label: 'Max Tokens', default: 1024, min: 128, max: 4096, step: 128 },
      { name: 'temperature', type: 'number', label: 'Temperature', default: 0.3, min: 0, max: 1, step: 0.1 },
    ],
  },
  {
    id: 'starcoder',
    name: 'StarCoder2 (3B)',
    description: 'Multi-language code model',
    modality: 'code',
    taskType: 'code-generation',
    provider: 'BigCode',
    license: 'OpenRAIL',
    huggingfaceId: 'bigcode/starcoder2-3b',
    advantage: '🥈 #2 Available - Excellent multi-language',
    rank: 2,
    available: 'available',
    maxTokens: 8192,
    supportsStreaming: true,
    estimatedTime: '5-30s',
    color: 'from-indigo-500 to-violet-500',
    capabilities: ['code-generation', 'multi-language', 'completion'],
    parameters: [
      { name: 'maxTokens', type: 'number', label: 'Max Tokens', default: 1024, min: 128, max: 4096, step: 128 },
      { name: 'temperature', type: 'number', label: 'Temperature', default: 0.3, min: 0, max: 1, step: 0.1 },
    ],
  },
  {
    id: 'codellama',
    name: 'CodeLlama (7B)',
    description: 'Meta code-focused LLM',
    modality: 'code',
    taskType: 'code-generation',
    provider: 'Meta',
    license: 'Llama 3',
    huggingfaceId: 'codellama/CodeLlama-7b-Instruct-hf',
    advantage: '🥉 #3 Available - Best for complex code',
    rank: 3,
    available: 'loading',
    maxTokens: 4096,
    supportsStreaming: true,
    estimatedTime: '10-60s',
    color: 'from-blue-500 to-violet-500',
    capabilities: ['code-generation', 'complex-code', 'debugging'],
    parameters: [
      { name: 'maxTokens', type: 'number', label: 'Max Tokens', default: 1024, min: 128, max: 4096, step: 128 },
      { name: 'temperature', type: 'number', label: 'Temperature', default: 0.3, min: 0, max: 1, step: 0.1 },
    ],
  },
];

// ============= VISION MODELS (Classification, Detection, etc.) =============
export const VISION_MODELS: AIModelFull[] = [
  {
    id: 'vit-large',
    name: 'ViT Large',
    description: 'Vision Transformer for classification',
    modality: 'image',
    taskType: 'image-classification',
    provider: 'Google',
    license: 'Apache 2.0',
    huggingfaceId: 'google/vit-large-patch16-224',
    advantage: '🏆 #1 - Best image classification',
    rank: 1,
    recommended: true,
    available: 'available',
    estimatedTime: '2-10s',
    color: 'from-sky-500 to-blue-500',
    capabilities: ['image-classification', 'high-accuracy'],
    parameters: [],
  },
  {
    id: 'detr',
    name: 'DETR',
    description: 'End-to-end object detection',
    modality: 'image',
    taskType: 'object-detection',
    provider: 'Meta',
    license: 'Apache 2.0',
    huggingfaceId: 'facebook/detr-resnet-50',
    advantage: '🏆 #1 - Best object detection',
    rank: 1,
    recommended: true,
    available: 'available',
    estimatedTime: '3-15s',
    color: 'from-orange-500 to-red-500',
    capabilities: ['object-detection', 'localization', 'transformer-based'],
    parameters: [],
  },
  {
    id: 'dpt-large',
    name: 'DPT Large',
    description: 'Dense prediction transformer',
    modality: 'image',
    taskType: 'depth-estimation',
    provider: 'Intel',
    license: 'MIT',
    huggingfaceId: 'Intel/dpt-large',
    advantage: '🏆 #1 - Best depth estimation',
    rank: 1,
    recommended: true,
    available: 'available',
    estimatedTime: '5-20s',
    color: 'from-purple-500 to-blue-500',
    capabilities: ['depth-estimation', 'high-resolution'],
    parameters: [],
  },
  {
    id: 'segformer',
    name: 'SegFormer B5',
    description: 'Semantic segmentation',
    modality: 'image',
    taskType: 'image-segmentation',
    provider: 'NVIDIA',
    license: 'MIT',
    huggingfaceId: 'nvidia/segformer-b5-finetuned-ade-640-640',
    advantage: '🏆 #1 - Best segmentation',
    rank: 1,
    recommended: true,
    available: 'available',
    estimatedTime: '5-25s',
    color: 'from-teal-500 to-green-500',
    capabilities: ['image-segmentation', 'semantic'],
    parameters: [],
  },
];

// ============= MULTIMODAL MODELS =============
export const MULTIMODAL_MODELS: AIModelFull[] = [
  {
    id: 'llava',
    name: 'LLaVA 1.5',
    description: 'Visual instruction-following',
    modality: 'image',
    taskType: 'image-text-to-text',
    provider: 'LLaVA',
    license: 'Apache 2.0',
    huggingfaceId: 'llava-hf/llava-1.5-7b-hf',
    advantage: '🏆 #1 - Best visual understanding',
    rank: 1,
    recommended: true,
    available: 'loading',
    estimatedTime: '10-45s',
    color: 'from-pink-500 to-purple-500',
    capabilities: ['visual-qa', 'image-description', 'instruction-following'],
    parameters: [
      { name: 'maxTokens', type: 'number', label: 'Max Tokens', default: 256, min: 64, max: 1024, step: 64 },
    ],
  },
  {
    id: 'blip2',
    name: 'BLIP-2',
    description: 'Image-text understanding',
    modality: 'image',
    taskType: 'image-text-to-text',
    provider: 'Salesforce',
    license: 'MIT',
    huggingfaceId: 'Salesforce/blip2-opt-2.7b',
    advantage: '🥈 #2 - Excellent captioning',
    rank: 2,
    available: 'loading',
    estimatedTime: '8-30s',
    color: 'from-violet-500 to-pink-500',
    capabilities: ['image-captioning', 'visual-qa'],
    parameters: [],
  },
  {
    id: 'vilt',
    name: 'ViLT VQA',
    description: 'Fast visual question answering',
    modality: 'image',
    taskType: 'visual-qa',
    provider: 'KAIST',
    license: 'Apache 2.0',
    huggingfaceId: 'dandelin/vilt-b32-finetuned-vqa',
    advantage: '🏆 #1 - Best for Visual QA',
    rank: 1,
    recommended: true,
    available: 'available',
    estimatedTime: '3-15s',
    color: 'from-cyan-500 to-blue-500',
    capabilities: ['visual-qa', 'fast'],
    parameters: [],
  },
  {
    id: 'blip-caption',
    name: 'BLIP Caption',
    description: 'Image captioning',
    modality: 'image',
    taskType: 'image-to-text',
    provider: 'Salesforce',
    license: 'MIT',
    huggingfaceId: 'Salesforce/blip-image-captioning-large',
    advantage: '🏆 #1 - Best image captioning',
    rank: 1,
    recommended: true,
    available: 'available',
    estimatedTime: '3-15s',
    color: 'from-green-500 to-teal-500',
    capabilities: ['image-captioning', 'description'],
    parameters: [],
  },
];

// All models combined
export const ALL_MODELS: AIModelFull[] = [
  ...VIDEO_MODELS,
  ...IMAGE_MODELS,
  ...AUDIO_MODELS,
  ...TEXT_MODELS,
  ...CODE_MODELS,
  ...VISION_MODELS,
  ...MULTIMODAL_MODELS,
];

// Best models by task type
export const BEST_MODELS_BY_TASK: Record<string, AIModelFull[]> = {
  'text-to-image': IMAGE_MODELS.filter(m => m.rank).sort((a, b) => (a.rank || 99) - (b.rank || 99)),
  'text-to-video': VIDEO_MODELS.filter(m => m.rank).sort((a, b) => (a.rank || 99) - (b.rank || 99)),
  'text-to-speech': AUDIO_MODELS.filter(m => m.taskType === 'text-to-speech' && m.rank).sort((a, b) => (a.rank || 99) - (b.rank || 99)),
  'speech-to-text': AUDIO_MODELS.filter(m => m.taskType === 'speech-to-text' && m.rank).sort((a, b) => (a.rank || 99) - (b.rank || 99)),
  'text-generation': TEXT_MODELS.filter(m => m.rank).sort((a, b) => (a.rank || 99) - (b.rank || 99)),
  'code-generation': CODE_MODELS.filter(m => m.rank).sort((a, b) => (a.rank || 99) - (b.rank || 99)),
  'image-classification': VISION_MODELS.filter(m => m.taskType === 'image-classification' && m.rank),
  'object-detection': VISION_MODELS.filter(m => m.taskType === 'object-detection' && m.rank),
  'depth-estimation': VISION_MODELS.filter(m => m.taskType === 'depth-estimation' && m.rank),
  'image-segmentation': VISION_MODELS.filter(m => m.taskType === 'image-segmentation' && m.rank),
  'image-text-to-text': MULTIMODAL_MODELS.filter(m => m.taskType === 'image-text-to-text' && m.rank),
  'visual-qa': MULTIMODAL_MODELS.filter(m => m.taskType === 'visual-qa' && m.rank),
  'image-to-text': MULTIMODAL_MODELS.filter(m => m.taskType === 'image-to-text' && m.rank),
};

// Helper functions
export function getModelsByModality(modality: Modality): AIModelFull[] {
  return ALL_MODELS.filter(m => m.modality === modality);
}

export function getModelsByTaskType(taskType: TaskType): AIModelFull[] {
  return ALL_MODELS.filter(m => m.taskType === taskType);
}

export function getBestModelsForTask(taskType: TaskType): AIModelFull[] {
  return BEST_MODELS_BY_TASK[taskType] || [];
}

export function getAvailableModels(): AIModelFull[] {
  return ALL_MODELS.filter(m => m.available === 'available' || m.available === 'loading');
}

export function getRecommendedModels(): AIModelFull[] {
  return ALL_MODELS.filter(m => m.recommended && m.available !== 'pro-only');
}

export function getModelById(id: string): AIModelFull | undefined {
  return ALL_MODELS.find(m => m.id === id);
}

export function getModalityColor(modality: Modality): string {
  const colors: Record<Modality, string> = {
    video: 'from-purple-500 to-pink-500',
    image: 'from-blue-500 to-cyan-500',
    audio: 'from-green-500 to-emerald-500',
    text: 'from-orange-500 to-red-500',
    code: 'from-violet-500 to-indigo-500',
  };
  return colors[modality];
}

export function getModalityIcon(modality: Modality): string {
  const icons: Record<Modality, string> = {
    video: 'Video',
    image: 'Image',
    audio: 'Music',
    text: 'FileText',
    code: 'Code',
  };
  return icons[modality];
}

export function isModelAvailable(model: AIModelFull): boolean {
  return model.available === 'available' || model.available === 'loading';
}

export function getRankBadge(rank: number | undefined): string {
  if (!rank) return '';
  switch (rank) {
    case 1: return '🏆';
    case 2: return '🥈';
    case 3: return '🥉';
    default: return '';
  }
}
