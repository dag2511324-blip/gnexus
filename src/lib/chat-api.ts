/**
 * Chat API - OpenRouter Integration
 * Real AI chat with streaming support
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface ChatConfig {
    model: string;
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
}

export interface ModelInfo {
    id: string;
    name: string;
    provider: string;
    contextWindow: string;
    description: string;
}

export const AVAILABLE_MODELS: ModelInfo[] = [
    {
        id: 'openai/gpt-4-turbo',
        name: 'GPT-4 Turbo',
        provider: 'OpenAI',
        contextWindow: '128K',
        description: 'Most capable model for complex tasks',
    },
    {
        id: 'anthropic/claude-3.5-sonnet',
        name: 'Claude 3.5 Sonnet',
        provider: 'Anthropic',
        contextWindow: '200K',
        description: 'Best for long conversations and analysis',
    },
    {
        id: 'google/gemini-pro-1.5',
        name: 'Gemini 1.5 Pro',
        provider: 'Google',
        contextWindow: '1M',
        description: 'Massive context window',
    },
    {
        id: 'meta-llama/llama-3-70b-instruct',
        name: 'Llama 3 70B',
        provider: 'Meta',
        contextWindow: '8K',
        description: 'Fast and efficient open-source model',
    },
];

/**
 * Send chat message with streaming support
 */
export async function* streamChatResponse(
    messages: Message[],
    config: ChatConfig
): AsyncGenerator<string, void, unknown> {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

    if (!apiKey) {
        throw new Error('OpenRouter API key not configured. Please add VITE_OPENROUTER_API_KEY to your .env file');
    }

    const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'G-NEXUS Chat',
        },
        body: JSON.stringify({
            model: config.model,
            messages,
            temperature: config.temperature ?? 0.7,
            max_tokens: config.maxTokens ?? 2000,
            stream: true,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to get AI response');
    }

    const reader = response.body?.getReader();
    if (!reader) {
        throw new Error('No response stream available');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
        while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);

                    if (data === '[DONE]') {
                        return;
                    }

                    try {
                        const parsed = JSON.parse(data);
                        const content = parsed.choices?.[0]?.delta?.content;

                        if (content) {
                            yield content;
                        }
                    } catch (e) {
                        // Skip invalid JSON
                        continue;
                    }
                }
            }
        }
    } finally {
        reader.releaseLock();
    }
}

/**
 * Send non-streaming chat request
 */
export async function sendChatMessage(
    messages: Message[],
    config: ChatConfig
): Promise<string> {
    let fullResponse = '';

    for await (const chunk of streamChatResponse(messages, config)) {
        fullResponse += chunk;
    }

    return fullResponse;
}

/**
 * Count tokens (approximate)
 */
export function estimateTokens(text: string): number {
    // Rough estimate: ~4 characters per token
    return Math.ceil(text.length / 4);
}

/**
 * Truncate conversation to fit context window
 */
export function truncateMessages(
    messages: Message[],
    maxTokens: number
): Message[] {
    let totalTokens = 0;
    const result: Message[] = [];

    // Always keep system message if present
    const systemMessage = messages.find(m => m.role === 'system');
    if (systemMessage) {
        result.push(systemMessage);
        totalTokens += estimateTokens(systemMessage.content);
    }

    // Add messages from most recent backwards
    for (let i = messages.length - 1; i >= 0; i--) {
        const message = messages[i];
        if (message.role === 'system') continue;

        const tokens = estimateTokens(message.content);
        if (totalTokens + tokens > maxTokens) break;

        result.unshift(message);
        totalTokens += tokens;
    }

    return result;
}
