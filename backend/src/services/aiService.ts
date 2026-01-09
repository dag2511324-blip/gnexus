import { config } from '../config';

interface OpenRouterMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface OpenRouterResponse {
    id: string;
    choices: Array<{
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
    }>;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

/**
 * Send message to OpenRouter AI
 */
export const sendToAI = async (
    messages: OpenRouterMessage[],
    model: string
): Promise<{ content: string; tokens?: number; latency: number }> => {
    const startTime = Date.now();

    // Map G-Nexus model names to OpenRouter model IDs
    const modelMap: Record<string, string> = {
        coder: 'mistralai/devstral-2512:free',
        marketing: 'xiaomi/mimo-v2-flash:free',
        planner: 'allenai/olmo-3.1-32b-think:free',
        analyst: 'deepseek/deepseek-chat:free',
    };

    const openRouterModel = modelMap[model] || modelMap.planner;

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.openRouterApiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': config.frontendUrl,
                'X-Title': 'G-Nexus Chat',
            },
            body: JSON.stringify({
                model: openRouterModel,
                messages,
                temperature: 0.7,
                max_tokens: 2000,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'AI request failed');
        }

        const data: OpenRouterResponse = await response.json();
        const latency = Date.now() - startTime;

        return {
            content: data.choices[0]?.message?.content || 'No response',
            tokens: data.usage?.total_tokens,
            latency,
        };
    } catch (error) {
        console.error('OpenRouter API Error:', error);
        throw error;
    }
};

/**
 * Stream message from AI (SSE)
 */
export async function* streamFromAI(
    messages: OpenRouterMessage[],
    model: string
): AsyncGenerator<string, void, unknown> {
    const modelMap: Record<string, string> = {
        coder: 'mistralai/devstral-2512:free',
        marketing: 'xiaomi/mimo-v2-flash:free',
        planner: 'allenai/olmo-3.1-32b-think:free',
        analyst: 'deepseek/deepseek-chat:free',
    };

    const openRouterModel = modelMap[model] || modelMap.planner;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${config.openRouterApiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': config.frontendUrl,
            'X-Title': 'G-Nexus Chat',
        },
        body: JSON.stringify({
            model: openRouterModel,
            messages,
            temperature: 0.7,
            max_tokens: 2000,
            stream: true,
        }),
    });

    if (!response.ok) {
        throw new Error('AI streaming request failed');
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response stream');

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
                    if (data === '[DONE]') return;

                    try {
                        const parsed = JSON.parse(data);
                        const content = parsed.choices?.[0]?.delta?.content;
                        if (content) yield content;
                    } catch {
                        // Skip invalid JSON
                    }
                }
            }
        }
    } finally {
        reader.releaseLock();
    }
}
