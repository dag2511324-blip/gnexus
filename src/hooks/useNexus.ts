/**
 * useNexus Hook
 * 
 * React hook for interacting with G-Nexus AI agents.
 * Provides a unified interface for all AI operations with loading states,
 * error handling, and streaming support.
 */

import { useState, useCallback, useRef } from 'react';
import {
    generateText,
    generateCode,
    generateMarketingContent,
    generateImage,
    deepAnalysis,
    chatCompletion,
    streamText,
    auditAgentOutputs,
    speechToText,
    textToSpeech,
    executeAgentPipeline,
    AI_MODELS,
    type ModelKey,
    type ChatMessage,
    type AgentTask,
    type AIResponse,
    type TextGenerationParams,
    type ImageGenerationParams,
} from '@/lib/ai';

// =============================================================================
// TYPES
// =============================================================================

export interface UseNexusState {
    loading: boolean;
    streaming: boolean;
    output: string | null;
    error: string | null;
    lastModel: ModelKey | null;
    latency: number | null;
}

export interface UseNexusReturn extends UseNexusState {
    // Core Functions
    askAgent: (agent: ModelKey, prompt: string, params?: TextGenerationParams) => Promise<string | null>;
    clearOutput: () => void;

    // Specialized Functions
    askCoder: (prompt: string, language?: string) => Promise<string | null>;
    askMarketer: (product: string, contentType?: 'tweet' | 'blog' | 'ad' | 'email') => Promise<string | null>;
    askPlanner: (task: string, context?: string) => Promise<string | null>;
    askAnalyst: (content: string, analysisType?: 'security' | 'quality' | 'consistency' | 'general') => Promise<string | null>;

    // Image Generation
    generateVisual: (prompt: string, model?: 'flux' | 'playground' | 'sdxl', params?: ImageGenerationParams) => Promise<string | null>;

    // Voice Functions
    transcribeAudio: (audioBlob: Blob) => Promise<string | null>;
    synthesizeSpeech: (text: string) => Promise<string | null>;

    // Chat Functions
    chat: (messages: ChatMessage[], model?: ModelKey) => Promise<string | null>;
    streamChat: (prompt: string, model?: ModelKey, onChunk?: (chunk: string) => void) => Promise<string | null>;

    // Multi-Agent
    runPipeline: (tasks: AgentTask[], onProgress?: (task: AgentTask) => void) => Promise<AgentTask[]>;
    auditOutputs: (outputs: { agent: ModelKey; content: string }[]) => Promise<string | null>;

    // State
    isReady: boolean;
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

export function useNexus(): UseNexusReturn {
    const [state, setState] = useState<UseNexusState>({
        loading: false,
        streaming: false,
        output: null,
        error: null,
        lastModel: null,
        latency: null,
    });

    const abortControllerRef = useRef<AbortController | null>(null);

    // Helper to update state
    const setLoading = useCallback((loading: boolean, streaming = false) => {
        setState(prev => ({ ...prev, loading, streaming, error: null }));
    }, []);

    const setResult = useCallback((response: AIResponse<string>, model: ModelKey) => {
        setState(prev => ({
            ...prev,
            loading: false,
            streaming: false,
            output: response.success ? response.data || null : null,
            error: response.success ? null : response.error || 'Unknown error',
            lastModel: model,
            latency: response.latency || null,
        }));
    }, []);

    const clearOutput = useCallback(() => {
        setState({
            loading: false,
            streaming: false,
            output: null,
            error: null,
            lastModel: null,
            latency: null,
        });
    }, []);

    // =============================================================================
    // CORE FUNCTIONS
    // =============================================================================

    /**
     * Ask any agent with a prompt
     */
    const askAgent = useCallback(async (
        agent: ModelKey,
        prompt: string,
        params?: TextGenerationParams
    ): Promise<string | null> => {
        setLoading(true);

        try {
            const response = await generateText(agent, prompt, params);
            setResult(response, agent);
            return response.success ? response.data || null : null;
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : 'Request failed',
            }));
            return null;
        }
    }, [setLoading, setResult]);

    // =============================================================================
    // SPECIALIZED AGENT FUNCTIONS
    // =============================================================================

    /**
     * Ask the IQuest Coder for code generation
     */
    const askCoder = useCallback(async (
        prompt: string,
        language: string = 'python'
    ): Promise<string | null> => {
        setLoading(true);

        try {
            const response = await generateCode(prompt, language);
            setResult(response, 'coder');
            return response.success ? response.data || null : null;
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : 'Code generation failed',
            }));
            return null;
        }
    }, [setLoading, setResult]);

    /**
     * Ask the Qwen Marketer for marketing content
     */
    const askMarketer = useCallback(async (
        product: string,
        contentType: 'tweet' | 'blog' | 'ad' | 'email' = 'tweet'
    ): Promise<string | null> => {
        setLoading(true);

        try {
            const response = await generateMarketingContent(product, contentType);
            setResult(response, 'marketing');
            return response.success ? response.data || null : null;
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : 'Marketing generation failed',
            }));
            return null;
        }
    }, [setLoading, setResult]);

    /**
     * Ask the Llama Planner for strategic planning
     */
    const askPlanner = useCallback(async (
        task: string,
        context?: string
    ): Promise<string | null> => {
        const prompt = context
            ? `Context: ${context}\n\nTask: ${task}\n\nProvide a detailed plan:`
            : `Task: ${task}\n\nProvide a detailed, step-by-step plan:`;

        return askAgent('planner', prompt, {
            max_new_tokens: 2048,
            temperature: 0.7,
        });
    }, [askAgent]);

    /**
     * Ask the DeepSeek Analyst for deep analysis
     */
    const askAnalyst = useCallback(async (
        content: string,
        analysisType: 'security' | 'quality' | 'consistency' | 'general' = 'general'
    ): Promise<string | null> => {
        setLoading(true);

        try {
            const response = await deepAnalysis(content, analysisType);
            setResult(response, 'analyst');
            return response.success ? response.data || null : null;
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : 'Analysis failed',
            }));
            return null;
        }
    }, [setLoading, setResult]);

    // =============================================================================
    // IMAGE GENERATION
    // =============================================================================

    /**
     * Generate images using Flux, Playground, or SDXL
     */
    const generateVisual = useCallback(async (
        prompt: string,
        model: 'flux' | 'playground' | 'sdxl' = 'sdxl',
        params?: ImageGenerationParams
    ): Promise<string | null> => {
        setLoading(true);

        try {
            const response = await generateImage(prompt, model, params);
            setResult(response, model);
            return response.success ? response.data || null : null;
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : 'Image generation failed',
            }));
            return null;
        }
    }, [setLoading, setResult]);

    // =============================================================================
    // VOICE FUNCTIONS
    // =============================================================================

    /**
     * Transcribe audio to text
     */
    const transcribeAudio = useCallback(async (
        audioBlob: Blob
    ): Promise<string | null> => {
        setLoading(true);

        try {
            const response = await speechToText(audioBlob);
            setResult(response, 'stt');
            return response.success ? response.data || null : null;
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : 'Transcription failed',
            }));
            return null;
        }
    }, [setLoading, setResult]);

    /**
     * Synthesize speech from text
     */
    const synthesizeSpeech = useCallback(async (
        text: string
    ): Promise<string | null> => {
        setLoading(true);

        try {
            const response = await textToSpeech(text);
            setResult(response, 'tts');
            return response.success ? response.data || null : null;
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : 'Speech synthesis failed',
            }));
            return null;
        }
    }, [setLoading, setResult]);

    // =============================================================================
    // CHAT FUNCTIONS
    // =============================================================================

    /**
     * Chat with conversation history
     */
    const chat = useCallback(async (
        messages: ChatMessage[],
        model: ModelKey = 'planner'
    ): Promise<string | null> => {
        setLoading(true);

        try {
            const formattedMessages = messages.map(m => ({
                role: m.role,
                content: m.content,
            }));

            const response = await chatCompletion(formattedMessages, model);
            setResult(response, model);
            return response.success ? response.data || null : null;
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : 'Chat failed',
            }));
            return null;
        }
    }, [setLoading, setResult]);

    /**
     * Stream chat response
     */
    const streamChat = useCallback(async (
        prompt: string,
        model: ModelKey = 'planner',
        onChunk?: (chunk: string) => void
    ): Promise<string | null> => {
        setLoading(true, true);
        setState(prev => ({ ...prev, output: '' }));

        try {
            let fullText = '';

            const handleChunk = (chunk: string) => {
                fullText += chunk;
                setState(prev => ({ ...prev, output: fullText }));
                onChunk?.(chunk);
            };

            const response = await streamText(model, prompt, handleChunk);

            setState(prev => ({
                ...prev,
                loading: false,
                streaming: false,
                output: response.success ? response.data || fullText : null,
                error: response.success ? null : response.error || 'Stream failed',
                lastModel: model,
            }));

            return response.success ? response.data || fullText : null;
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                streaming: false,
                error: error instanceof Error ? error.message : 'Stream failed',
            }));
            return null;
        }
    }, [setLoading]);

    // =============================================================================
    // MULTI-AGENT
    // =============================================================================

    /**
     * Run a pipeline of agent tasks
     */
    const runPipeline = useCallback(async (
        tasks: AgentTask[],
        onProgress?: (task: AgentTask) => void
    ): Promise<AgentTask[]> => {
        setLoading(true);

        try {
            const results = await executeAgentPipeline(tasks, onProgress);

            const lastTask = results[results.length - 1];
            if (lastTask) {
                setState(prev => ({
                    ...prev,
                    loading: false,
                    output: lastTask.result || null,
                    lastModel: lastTask.agent,
                    error: lastTask.status === 'failed' ? lastTask.result || 'Pipeline failed' : null,
                }));
            }

            return results;
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : 'Pipeline failed',
            }));
            return [];
        }
    }, [setLoading]);

    /**
     * Audit outputs from multiple agents
     */
    const auditOutputs = useCallback(async (
        outputs: { agent: ModelKey; content: string }[]
    ): Promise<string | null> => {
        setLoading(true);

        try {
            const response = await auditAgentOutputs(outputs);
            setResult(response, 'analyst');
            return response.success ? response.data || null : null;
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : 'Audit failed',
            }));
            return null;
        }
    }, [setLoading, setResult]);

    // =============================================================================
    // RETURN
    // =============================================================================

    return {
        ...state,
        isReady: !state.loading,

        // Core
        askAgent,
        clearOutput,

        // Specialized
        askCoder,
        askMarketer,
        askPlanner,
        askAnalyst,

        // Image
        generateVisual,

        // Voice
        transcribeAudio,
        synthesizeSpeech,

        // Chat
        chat,
        streamChat,

        // Multi-Agent
        runPipeline,
        auditOutputs,
    };
}

// =============================================================================
// ADDITIONAL HOOKS
// =============================================================================

/**
 * Hook for chat conversations with message history and backend persistence
 */
export function useNexusChat(initialModel: ModelKey = 'planner') {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [activeModel, setActiveModel] = useState<ModelKey>(initialModel);
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
    const [conversations, setConversations] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [savingMessage, setSavingMessage] = useState(false);
    const nexus = useNexus();

    // Import conversation API (dynamic to avoid circular deps)
    const conversationAPI = useCallback(async () => {
        return await import('@/lib/api/conversations');
    }, []);

    /**
     * Fetch user's conversation history
     */
    const fetchConversationHistory = useCallback(async (params?: any) => {
        setLoadingHistory(true);
        try {
            const api = await conversationAPI();
            const response = await api.fetchConversations(params);
            setConversations(response.conversations);
            return response;
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
            return null;
        } finally {
            setLoadingHistory(false);
        }
    }, [conversationAPI]);

    /**
     * Create a new conversation
     */
    const createNewConversation = useCallback(async (title?: string, model?: ModelKey) => {
        try {
            const api = await conversationAPI();
            const conversation = await api.createConversation({
                title: title || 'New Conversation',
                model: model || activeModel,
            });
            setCurrentConversationId(conversation.id);
            setMessages([]);
            setConversations(prev => [conversation, ...prev]);
            return conversation.id;
        } catch (error) {
            console.error('Failed to create conversation:', error);
            return null;
        }
    }, [conversationAPI, activeModel]);

    /**
     * Load an existing conversation
     */
    const loadConversation = useCallback(async (id: string) => {
        setLoadingHistory(true);
        try {
            const api = await conversationAPI();
            const conversation = await api.getConversation(id);

            // Convert backend messages to ChatMessage format
            const chatMessages: ChatMessage[] = conversation.messages.map(msg => ({
                id: msg.id,
                role: msg.role,
                content: msg.content,
                timestamp: new Date(msg.createdAt),
                model: msg.model as ModelKey | undefined,
                status: 'sent' as const,
            }));

            setMessages(chatMessages);
            setCurrentConversationId(id);
            setActiveModel(conversation.model as ModelKey);
            return chatMessages;
        } catch (error) {
            console.error('Failed to load conversation:', error);
            return null;
        } finally {
            setLoadingHistory(false);
        }
    }, [conversationAPI]);

    /**
     * Save a message to the backend
     */
    const saveMessageToBackend = useCallback(async (
        conversationId: string,
        role: 'user' | 'assistant' | 'system',
        content: string,
        model?: string
    ) => {
        try {
            const api = await conversationAPI();
            await api.addMessageToConversation(conversationId, {
                role,
                content,
                model,
            });
        } catch (error) {
            console.error('Failed to save message:', error);
        }
    }, [conversationAPI]);

    /**
     * Send a message (with auto-save to backend)
     */
    const sendMessage = useCallback(async (content: string) => {
        const userMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            role: 'user',
            content,
            timestamp: new Date(),
            status: 'sent',
        };

        setMessages(prev => [...prev, userMessage]);

        // Create conversation if this is the first message
        let convId = currentConversationId;
        if (!convId) {
            const api = await conversationAPI();
            const title = api.generateConversationTitle(content);
            convId = await createNewConversation(title, activeModel);
            if (!convId) {
                console.error('Failed to create conversation');
                return null;
            }
        }

        // Save user message to backend
        setSavingMessage(true);
        await saveMessageToBackend(convId, 'user', content);
        setSavingMessage(false);

        // Add system message for first interaction to set AI identity
        const systemMessage: ChatMessage = {
            id: 'system-prompt',
            role: 'system',
            content: `You are G AI, developed by Dagmawi Amare, CEO of Gnexus. When introducing yourself or greeting users, say "I'm G AI by Dagmawi Amare, CEO of Gnexus. Ready to assist with your tasks!" Be helpful, professional, and provide high-quality responses.`,
            timestamp: new Date(),
            status: 'sent',
        };

        // Include system message if this is the first user message
        const conversationMessages = messages.length === 0
            ? [systemMessage, userMessage]
            : [...messages, userMessage];

        const response = await nexus.chat(conversationMessages, activeModel);

        if (response) {
            const assistantMessage: ChatMessage = {
                id: `msg-${Date.now()}`,
                role: 'assistant',
                content: response,
                timestamp: new Date(),
                model: activeModel,
                status: 'sent',
            };
            setMessages(prev => [...prev, assistantMessage]);

            // Save assistant message to backend
            setSavingMessage(true);
            await saveMessageToBackend(convId, 'assistant', response, activeModel);
            setSavingMessage(false);
        }

        return response;
    }, [messages, activeModel, currentConversationId, nexus, conversationAPI, createNewConversation, saveMessageToBackend]);

    /**
     * Delete the current conversation
     */
    const deleteCurrentConversation = useCallback(async () => {
        if (!currentConversationId) return;

        try {
            const api = await conversationAPI();
            await api.deleteConversation(currentConversationId);
            setConversations(prev => prev.filter(c => c.id !== currentConversationId));
            setCurrentConversationId(null);
            setMessages([]);
        } catch (error) {
            console.error('Failed to delete conversation:', error);
        }
    }, [currentConversationId, conversationAPI]);

    /**
     * Star a conversation
     */
    const starConversation = useCallback(async (id: string, isStarred: boolean) => {
        try {
            const api = await conversationAPI();
            const updated = await api.toggleStarConversation(id, isStarred);
            setConversations(prev => prev.map(c => c.id === id ? updated : c));
        } catch (error) {
            console.error('Failed to star conversation:', error);
        }
    }, [conversationAPI]);

    /**
     * Archive a conversation
     */
    const archiveConversation = useCallback(async (id: string, isArchived: boolean) => {
        try {
            const api = await conversationAPI();
            const updated = await api.toggleArchiveConversation(id, isArchived);
            setConversations(prev => prev.map(c => c.id === id ? updated : c));
        } catch (error) {
            console.error('Failed to archive conversation:', error);
        }
    }, [conversationAPI]);

    /**
     * Rename a conversation
     */
    const renameConversation = useCallback(async (id: string, title: string) => {
        try {
            const api = await conversationAPI();
            const updated = await api.renameConversation(id, title);
            setConversations(prev => prev.map(c => c.id === id ? updated : c));
        } catch (error) {
            console.error('Failed to rename conversation:', error);
        }
    }, [conversationAPI]);

    const clearMessages = useCallback(() => {
        setMessages([]);
        setCurrentConversationId(null);
    }, []);

    return {
        messages,
        activeModel,
        setActiveModel,
        sendMessage,
        clearMessages,

        // Backend integration
        currentConversationId,
        conversations,
        loadingHistory,
        savingMessage,

        // Conversation management
        fetchConversationHistory,
        createNewConversation,
        loadConversation,
        deleteCurrentConversation,
        starConversation,
        archiveConversation,
        renameConversation,

        ...nexus,
    };
}


/**
 * Hook for agent selection and task dispatch
 */
export function useAgentDispatcher() {
    const [selectedAgent, setSelectedAgent] = useState<ModelKey | null>(null);
    const [taskHistory, setTaskHistory] = useState<AgentTask[]>([]);
    const nexus = useNexus();

    const dispatch = useCallback(async (prompt: string) => {
        if (!selectedAgent) {
            return null;
        }

        const task: AgentTask = {
            id: `task-${Date.now()}`,
            agent: selectedAgent,
            prompt,
            status: 'pending',
        };

        setTaskHistory(prev => [...prev, task]);

        // Route to appropriate function based on model category
        const modelInfo = AI_MODELS[selectedAgent];
        let response: string | null = null;

        if (modelInfo.category === 'image') {
            // Image generation models - single model execution
            response = await nexus.generateVisual(prompt, selectedAgent as 'flux' | 'playground' | 'sdxl');
        } else {
            // 🚀 SERVICE-SPECIFIC MULTI-AGENT PIPELINE ORCHESTRATION
            // Import pipeline router dynamically
            const { getPipelineForService, hasCustomPipeline } = await import('@/lib/AgentPipelineRouter');

            if (hasCustomPipeline(selectedAgent)) {
                try {
                    const pipeline = getPipelineForService(selectedAgent);
                    if (!pipeline) throw new Error('Pipeline not found');

                    // Execute each node in the pipeline sequentially
                    const nodeOutputs: Record<string, string> = {};
                    const nodeResults: string[] = [];

                    for (const node of pipeline.nodes) {
                        console.log(`[Pipeline] Executing ${node.title} with ${node.model}...`);

                        // Generate prompt for this node with context from previous nodes
                        const nodePrompt = node.promptTemplate(prompt, nodeOutputs);

                        // Execute with the specified model
                        const nodeResult = await nexus.askAgent(node.model, nodePrompt);

                        if (!nodeResult) {
                            throw new Error(`${node.title} failed`);
                        }

                        // Store result for next nodes
                        nodeOutputs[node.id] = nodeResult;

                        // Format result for final output
                        nodeResults.push(`[NODE ${pipeline.nodes.indexOf(node) + 1}: ${node.title}] ${node.emoji}
*Model:* ${AI_MODELS[node.model].name}
*Process:*
${nodeResult}
`);
                    }

                    // Compile final structured output
                    response = nodeResults.join('\n');

                } catch (error) {
                    console.error('[Service Pipeline Error]:', error);
                    // Fallback to simple single-model execution
                    const fallbackPrompt = `Process this request with high quality: ${prompt}`;
                    response = await nexus.askAgent(selectedAgent, fallbackPrompt);
                }
            } else {
                // No custom pipeline - use simple execution
                response = await nexus.askAgent(selectedAgent, prompt);
            }
        }

        const completedTask: AgentTask = {
            ...task,
            status: response ? 'completed' : 'failed',
            result: response || nexus.error || 'Task failed',
            endTime: new Date(),
        };

        setTaskHistory(prev =>
            prev.map(t => t.id === task.id ? completedTask : t)
        );

        return response;
    }, [selectedAgent, nexus]);

    const selectAgent = useCallback((agent: ModelKey) => {
        setSelectedAgent(agent);
    }, []);

    const clearHistory = useCallback(() => {
        setTaskHistory([]);
    }, []);

    return {
        selectedAgent,
        selectAgent,
        taskHistory,
        dispatch,
        clearHistory,
        agentInfo: selectedAgent ? AI_MODELS[selectedAgent] : null,
        ...nexus,
    };
}

export default useNexus;
