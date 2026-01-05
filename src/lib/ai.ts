/**
 * G-NEXUS AI Service Layer
 * Hugging Face Inference API Integration
 * 
 * This module provides a unified interface for all AI models in the G-Nexus ecosystem.
 * It handles text generation, image generation, speech-to-text, and text-to-speech.
 */
import { OpenRouter } from '@openrouter/sdk';

// =============================================================================
// CONFIGURATION
// =============================================================================

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const SITE_URL = 'https://g-nexus.ethiopia';
const SITE_NAME = 'G-Nexus Ethiopia';

// HF Constants for remaining image/voice models
const HF_API_URL = '/api/hf';
const HF_TOKEN = import.meta.env.VITE_HF_TOKEN;

// Model Registry - All available AI models in G-Nexus
// Updated to use OpenRouter platform with generic names as requested
export const AI_MODELS = {
    // Text Generation Models
    coder: {
        id: 'mistralai/devstral-2512:free',
        name: 'Nexus Code Engine',
        description: 'Advanced Coding & Optimization',
        color: '#22c55e', // Neon Green
        icon: 'terminal',
        category: 'code' as const,
    },
    marketing: {
        id: 'xiaomi/mimo-v2-flash:free',
        name: 'Nexus Growth Architect',
        description: 'Creative Content & Strategy',
        color: '#a855f7', // Neon Purple
        icon: 'megaphone',
        category: 'text' as const,
    },
    planner: {
        id: 'allenai/olmo-3.1-32b-think:free',
        name: 'Nexus Strategic Planner',
        description: 'Reasoning & Task Planning',
        color: '#06b6d4', // Cyan
        icon: 'lightbulb',
        category: 'chat' as const,
    },
    analyst: {
        id: 'nex-agi/deepseek-v3.1-nex-n1:free',
        name: 'Nexus Neural Auditor',
        description: 'Security & Logic Synthesis',
        color: '#3b82f6', // Neon Blue
        icon: 'brain',
        category: 'analysis' as const,
    },

    // Image Generation Models (Staying on HF for now as not specified for OR)
    flux: {
        id: 'diffusers/FLUX.2-dev-bnb-4bit',
        name: 'Nexus Vision Flux',
        description: 'Hyper-realistic Visuals',
        color: '#f97316', // Neon Orange
        icon: 'eye',
        category: 'image' as const,
    },
    playground: {
        id: 'playgroundai/playground-v2.5-1024px-aesthetic',
        name: 'Nexus Aesthetic Canvas',
        description: 'Artistic Visual Creation',
        color: '#ec4899', // Pink
        icon: 'palette',
        category: 'image' as const,
    },
    sdxl: {
        id: 'stabilityai/stable-diffusion-xl-base-1.0',
        name: 'Nexus SDXL Studio',
        description: 'Versatile Image Synthesis',
        color: '#8b5cf6', // Violet
        icon: 'image',
        category: 'image' as const,
    },

    // Voice Models
    stt: {
        id: 'kyutai/stt-1b-en_fr',
        name: 'Nexus Vocal Scribe',
        description: 'Speech to Text Processing',
        color: '#14b8a6', // Teal
        icon: 'mic',
        category: 'voice' as const,
    },
    tts: {
        id: 'myshell-ai/OpenVoiceV2',
        name: 'Nexus Vocal Synthesizer',
        description: 'Text to Speech Engine',
        color: '#f59e0b', // Amber
        icon: 'volume',
        category: 'voice' as const,
    },

    // Agentic Model
    agentic: {
        id: 'nvidia/nemotron-3-nano-30b-a3b:free',
        name: 'Nexus Autonomous Agent',
        description: 'GUI Control & Automation',
        color: '#ef4444', // Red
        icon: 'bot',
        category: 'agent' as const,
    },
} as const;

export type ModelKey = keyof typeof AI_MODELS;
export type ModelCategory = 'code' | 'text' | 'chat' | 'analysis' | 'image' | 'voice' | 'agent';

// =============================================================================
// API TYPES
// =============================================================================

export interface TextGenerationParams {
    max_new_tokens?: number;
    temperature?: number;
    top_p?: number;
    top_k?: number;
    repetition_penalty?: number;
    return_full_text?: boolean;
    stop_sequences?: string[];
}

export interface ImageGenerationParams {
    guidance_scale?: number;
    num_inference_steps?: number;
    width?: number;
    height?: number;
    negative_prompt?: string;
}

export interface AIResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    model?: string;
    latency?: number;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    model?: ModelKey;
    status: 'sending' | 'sent' | 'error';
    metadata?: {
        tokens?: number;
        latency?: number;
    };
}

export interface AgentTask {
    id: string;
    agent: ModelKey;
    prompt: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    result?: string;
    startTime?: Date;
    endTime?: Date;
}

// =============================================================================
// CORE API FUNCTIONS
// =============================================================================

/**
 * Make a request to the Hugging Face Inference API
 */
async function hfRequest<T>(
    modelId: string,
    payload: object,
    options: RequestInit = {}
): Promise<AIResponse<T>> {
    const startTime = Date.now();

    try {
        console.log(`[AI] Making request to: ${HF_API_URL}/${modelId}`);
        // Log token presence (safe)
        console.log(`[AI] Token present: ${!!HF_TOKEN}`);

        const response = await fetch(`${HF_API_URL}/${modelId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HF_TOKEN}`,
                'Content-Type': 'application/json',
                ...options.headers,
            },
            body: JSON.stringify(payload),
            ...options,
        });

        console.log(`[AI] Response status: ${response.status}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[AI] API Error (${response.status}): ${errorText}`);

            // Handle model loading state
            if (response.status === 503) {
                return {
                    success: false,
                    error: 'Model is loading (503). Please try again in 10-20 seconds.',
                    model: modelId,
                };
            }

            return {
                success: false,
                error: `API Error (${response.status}): ${errorText.substring(0, 150)}${errorText.length > 150 ? '...' : ''}`,
                model: modelId,
            };
        }

        const contentType = response.headers.get('Content-Type') || '';

        // Handle image responses
        if (contentType.includes('image')) {
            const blob = await response.blob();
            const base64 = await blobToBase64(blob);
            return {
                success: true,
                data: base64 as T,
                model: modelId,
                latency: Date.now() - startTime,
            };
        }

        // Handle JSON responses
        const data = await response.json();
        return {
            success: true,
            data: data as T,
            model: modelId,
            latency: Date.now() - startTime,
        };
    } catch (error) {
        console.error('[AI] Fetch error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            model: modelId,
        };
    }
}

/**
 * Convert a Blob to Base64 string
 */
function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// =============================================================================
// TEXT GENERATION
// =============================================================================

/**
 * Initialize OpenRouter Client
 */
const openRouter = new OpenRouter({
    apiKey: OPENROUTER_API_KEY,
    defaultHeaders: {
        'HTTP-Referer': SITE_URL,
        'X-Title': SITE_NAME,
    },
});

/**
 * Generate text using OpenRouter
 */
export async function generateText(
    agentType: ModelKey,
    prompt: string,
    params: TextGenerationParams = {}
): Promise<AIResponse<string>> {
    const model = AI_MODELS[agentType];
    const startTime = Date.now();

    if (!model) {
        return {
            success: false,
            error: `Invalid model ID: ${agentType}`,
        };
    }

    // Check if this is an OR model or HF model
    const isOpenRouterModel = [
        'mistralai/devstral-2512:free',
        'xiaomi/mimo-v2-flash:free',
        'allenai/olmo-3.1-32b-think:free',
        'nex-agi/deepseek-v3.1-nex-n1:free',
        'nvidia/nemotron-3-nano-30b-a3b:free'
    ].includes(model.id);

    if (!isOpenRouterModel) {
        // Fallback to HF for image/voice (though generateText is mostly for text)
        // If it's a category like 'code', 'text', 'chat', 'analysis', 'agent', it SHOULD be OR now.
        if (['image', 'voice'].includes(model.category)) {
            return {
                success: false,
                error: `Model category ${model.category} should use specialized functions (generateImage/speechToText).`,
            };
        }
    }

    try {
        const completion = await openRouter.chat.send({
            model: model.id,
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            stream: false,
            // Map params to OR chat completion if needed, though sdk might have limited mapping here
            // For now, we use defaults or extend as needed
        });

        const generatedText = completion.choices[0]?.message?.content || '';

        return {
            success: true,
            data: generatedText,
            model: model.id,
            latency: Date.now() - startTime,
        };
    } catch (error) {
        console.error('[AI] OpenRouter error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            model: model.id,
        };
    }
}

/**
 * Chat completion with conversation history
 */
export async function chatCompletion(
    messages: Array<{ role: string; content: string }>,
    model: ModelKey = 'planner',
    params: TextGenerationParams = {}
): Promise<AIResponse<string>> {
    // Format messages for the model
    const formattedPrompt = messages
        .map(msg => {
            if (msg.role === 'system') return `System: ${msg.content}`;
            if (msg.role === 'user') return `User: ${msg.content}`;
            return `Assistant: ${msg.content}`;
        })
        .join('\n\n') + '\n\nAssistant:';

    return generateText(model, formattedPrompt, params);
}

// =============================================================================
// CODE GENERATION
// =============================================================================

/**
 * Generate code using IQuest-Coder
 */
export async function generateCode(
    prompt: string,
    language: string = 'python',
    context?: string
): Promise<AIResponse<string>> {
    const systemPrompt = `You are an expert ${language} programmer. Generate clean, well-documented code.
${context ? `Context: ${context}` : ''}

Task: ${prompt}

Respond with only the code, properly formatted:`;

    return generateText('coder', systemPrompt, {
        max_new_tokens: 2048,
        temperature: 0.3, // Lower temperature for more deterministic code
        repetition_penalty: 1.05,
    });
}

/**
 * Complete code based on partial input
 */
export async function completeCode(
    partialCode: string,
    language: string = 'python'
): Promise<AIResponse<string>> {
    const prompt = `Complete the following ${language} code:\n\n${partialCode}`;

    return generateText('coder', prompt, {
        max_new_tokens: 512,
        temperature: 0.2,
        stop_sequences: ['\n\n\n', '```'],
    });
}

// =============================================================================
// MARKETING CONTENT
// =============================================================================

/**
 * Generate marketing content using Qwen-Marketing
 */
export async function generateMarketingContent(
    product: string,
    contentType: 'tweet' | 'blog' | 'ad' | 'email' = 'tweet'
): Promise<AIResponse<string>> {
    const prompts = {
        tweet: `Write a viral, engaging tweet for: ${product}. Include relevant emojis and hashtags.`,
        blog: `Write an engaging blog post introduction for: ${product}. Make it compelling and SEO-friendly.`,
        ad: `Write compelling ad copy for: ${product}. Focus on benefits and include a call-to-action.`,
        email: `Write a marketing email for: ${product}. Include a catchy subject line and persuasive body.`,
    };

    return generateText('marketing', prompts[contentType], {
        max_new_tokens: contentType === 'blog' ? 1024 : 512,
        temperature: 0.8,
    });
}

// =============================================================================
// IMAGE GENERATION
// =============================================================================

/**
 * Generate images using Flux, Playground, or SDXL
 */
export async function generateImage(
    prompt: string,
    model: 'flux' | 'playground' | 'sdxl' = 'sdxl',
    params: ImageGenerationParams = {}
): Promise<AIResponse<string>> {
    const modelInfo = AI_MODELS[model];

    const defaultParams: ImageGenerationParams = {
        guidance_scale: 7.5,
        num_inference_steps: 30,
        width: 1024,
        height: 1024,
    };

    const response = await hfRequest<string>(
        modelInfo.id,
        {
            inputs: prompt,
            parameters: { ...defaultParams, ...params },
        }
    );

    return response;
}

// =============================================================================
// DEEP ANALYSIS
// =============================================================================

/**
 * Analyze and audit content using DeepSeek
 */
export async function deepAnalysis(
    content: string,
    analysisType: 'security' | 'quality' | 'consistency' | 'general' = 'general'
): Promise<AIResponse<string>> {
    const prompts = {
        security: `Perform a security audit of the following content. Identify vulnerabilities, risks, and provide recommendations:\n\n${content}`,
        quality: `Analyze the quality of the following content. Evaluate clarity, structure, and effectiveness:\n\n${content}`,
        consistency: `Check the following content for consistency. Identify contradictions or inconsistencies:\n\n${content}`,
        general: `Provide a comprehensive analysis of the following content:\n\n${content}`,
    };

    return generateText('analyst', prompts[analysisType], {
        max_new_tokens: 2048,
        temperature: 0.5,
    });
}

/**
 * Audit multiple outputs from different agents
 */
export async function auditAgentOutputs(
    outputs: { agent: ModelKey; content: string }[]
): Promise<AIResponse<string>> {
    const formattedOutputs = outputs
        .map(o => `[${AI_MODELS[o.agent].name}]:\n${o.content}`)
        .join('\n\n---\n\n');

    const prompt = `MULTI-AGENT AUDIT REPORT

Analyze the following outputs from different AI agents for:
1. Consistency between outputs
2. Quality of each output
3. Potential conflicts or contradictions
4. Recommendations for improvement

Outputs:
${formattedOutputs}

Provide a structured analysis:`;

    return generateText('analyst', prompt, {
        max_new_tokens: 2048,
        temperature: 0.4,
    });
}

// =============================================================================
// VOICE INTERFACE (PLACEHOLDER - Requires specific endpoints)
// =============================================================================

/**
 * Speech to Text using Kyutai STT
 * Note: This requires audio data as input
 */
export async function speechToText(
    audioBlob: Blob
): Promise<AIResponse<string>> {
    const formData = new FormData();
    formData.append('audio', audioBlob);

    try {
        const response = await fetch(`${HF_API_URL}/${AI_MODELS.stt.id}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HF_TOKEN}`,
            },
            body: formData,
        });

        if (!response.ok) {
            return {
                success: false,
                error: 'Speech recognition failed',
            };
        }

        const data = await response.json();
        return {
            success: true,
            data: data.text || data,
        };
    } catch (error) {
        return {
            success: false,
            error: 'Speech recognition not available',
        };
    }
}

/**
 * Text to Speech using OpenVoice
 * Note: Returns audio data
 */
export async function textToSpeech(
    text: string,
    voice?: string
): Promise<AIResponse<string>> {
    try {
        const response = await fetch(`${HF_API_URL}/${AI_MODELS.tts.id}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HF_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ inputs: text, voice }),
        });

        if (!response.ok) {
            return {
                success: false,
                error: 'Text to speech failed',
            };
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        return {
            success: true,
            data: audioUrl,
        };
    } catch (error) {
        return {
            success: false,
            error: 'Text to speech not available',
        };
    }
}

// =============================================================================
// STREAMING SUPPORT
// =============================================================================

/**
 * Stream text generation response
 */
export async function streamText(
    agentType: ModelKey,
    prompt: string,
    onChunk: (chunk: string) => void,
    params: TextGenerationParams = {}
): Promise<AIResponse<string>> {
    const model = AI_MODELS[agentType];

    try {
        const stream = await openRouter.chat.send({
            model: model.id,
            messages: [{ role: 'user', content: prompt }],
            stream: true,
        });

        let fullText = '';
        if (stream) {
            for await (const chunk of stream) {
                const text = chunk.choices[0]?.delta?.content || '';
                fullText += text;
                onChunk(text);
            }
        }

        return {
            success: true,
            data: fullText,
            model: model.id,
        };
    } catch (error) {
        console.error('[AI] OpenRouter stream error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Stream error',
        };
    }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get all models of a specific category
 */
export function getModelsByCategory(category: ModelCategory): typeof AI_MODELS[ModelKey][] {
    return Object.values(AI_MODELS).filter(model => model.category === category);
}

/**
 * Get model info by key
 */
export function getModelInfo(key: ModelKey) {
    return AI_MODELS[key];
}

/**
 * Check if a model is available
 */
export async function checkModelStatus(modelKey: ModelKey): Promise<boolean> {
    const model = AI_MODELS[modelKey];

    try {
        const response = await fetch(`${HF_API_URL}/${model.id}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HF_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ inputs: 'test' }),
        });

        return response.ok || response.status === 503; // 503 means loading
    } catch {
        return false;
    }
}

/**
 * Format code blocks in markdown
 */
export function formatCodeInMarkdown(text: string): string {
    // Detect code blocks and wrap them properly
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    return text.replace(codeBlockRegex, (_, lang, code) => {
        return `\`\`\`${lang || 'plaintext'}\n${code.trim()}\n\`\`\``;
    });
}

/**
 * Parse streaming response
 */
export function parseStreamingResponse(chunk: string): string {
    try {
        // Handle Server-Sent Events format
        if (chunk.startsWith('data:')) {
            const data = JSON.parse(chunk.slice(5));
            return data.token?.text || data.generated_text || '';
        }
        return chunk;
    } catch {
        return chunk;
    }
}

// =============================================================================
// AGENT ORCHESTRATION
// =============================================================================

/**
 * Execute a multi-agent pipeline
 */
export async function executeAgentPipeline(
    tasks: AgentTask[],
    onProgress?: (task: AgentTask) => void
): Promise<AgentTask[]> {
    const results: AgentTask[] = [];

    for (const task of tasks) {
        const updatedTask: AgentTask = {
            ...task,
            status: 'processing',
            startTime: new Date(),
        };
        onProgress?.(updatedTask);

        const response = await generateText(task.agent, task.prompt);

        const completedTask: AgentTask = {
            ...updatedTask,
            status: response.success ? 'completed' : 'failed',
            result: response.success ? response.data : response.error,
            endTime: new Date(),
        };

        results.push(completedTask);
        onProgress?.(completedTask);
    }

    return results;
}

export default {
    generateText,
    generateCode,
    completeCode,
    generateMarketingContent,
    generateImage,
    deepAnalysis,
    auditAgentOutputs,
    speechToText,
    textToSpeech,
    streamText,
    chatCompletion,
    executeAgentPipeline,
    checkModelStatus,
    getModelsByCategory,
    getModelInfo,
    AI_MODELS,
};
