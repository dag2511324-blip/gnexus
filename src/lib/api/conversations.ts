/**
 * Conversations API Client
 * 
 * Client library for interacting with the backend conversation endpoints.
 * Handles all CRUD operations for conversations and messages.
 */

import axios from 'axios';

// =============================================================================
// TYPES
// =============================================================================

export interface Conversation {
    id: string;
    title: string;
    model: string;
    isStarred: boolean;
    isArchived: boolean;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    messageCount?: number;
}

export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    model?: string;
    tokens?: number;
    latency?: number;
    attachments?: any[];
    createdAt: string;
}

export interface ConversationDetail extends Conversation {
    messages: Message[];
}

export interface ConversationsResponse {
    conversations: Conversation[];
    pagination: {
        total: number;
        page: number;
        pages: number;
    };
}

export interface CreateConversationInput {
    title: string;
    model: string;
}

export interface UpdateConversationInput {
    title?: string;
    isStarred?: boolean;
    isArchived?: boolean;
    tags?: string[];
}

export interface AddMessageInput {
    role: 'user' | 'assistant' | 'system';
    content: string;
    model?: string;
    tokens?: number;
    latency?: number;
    attachments?: any[];
}

// =============================================================================
// API CLIENT
// =============================================================================

const API_BASE = '/api/conversations';

// Get authentication token from localStorage
const getAuthToken = (): string | null => {
    // Check multiple possible keys
    const explicitToken = localStorage.getItem('accessToken') ||
        localStorage.getItem('token') ||
        localStorage.getItem('auth_token');

    if (explicitToken) return explicitToken;

    // Supabase stores its session in localStorage under a key like 'sb-<project-id>-auth-token'
    // We can iterate through localStorage to find any supabase auth token
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
            const authDataString = localStorage.getItem(key);
            if (authDataString) {
                try {
                    const authData = JSON.parse(authDataString);
                    if (authData && authData.access_token) {
                        return authData.access_token;
                    }
                } catch (e) {
                    console.error('Failed to parse Supabase auth token:', e);
                }
            }
        }
    }

    return null;
};

// Create axios instance with auth headers
const createAuthHeaders = () => {
    const token = getAuthToken();
    if (!token) {
        console.warn('[Conversations API] No auth token found in localStorage');
        return {};
    }
    return { Authorization: `Bearer ${token}` };
};

/**
 * Fetch user's conversations with optional filters
 */
export async function fetchConversations(params?: {
    page?: number;
    limit?: number;
    archived?: boolean;
    starred?: boolean;
    search?: string;
}): Promise<ConversationsResponse> {
    const response = await axios.get<ConversationsResponse>(API_BASE, {
        params,
        headers: createAuthHeaders(),
    });
    return response.data;
}

/**
 * Get a single conversation with all its messages
 */
export async function getConversation(id: string): Promise<ConversationDetail> {
    const response = await axios.get<ConversationDetail>(`${API_BASE}/${id}`, {
        headers: createAuthHeaders(),
    });
    return response.data;
}

/**
 * Create a new conversation
 */
export async function createConversation(
    data: CreateConversationInput
): Promise<Conversation> {
    const response = await axios.post<Conversation>(API_BASE, data, {
        headers: createAuthHeaders(),
    });
    return response.data;
}

/**
 * Update conversation properties
 */
export async function updateConversation(
    id: string,
    updates: UpdateConversationInput
): Promise<Conversation> {
    const response = await axios.put<Conversation>(`${API_BASE}/${id}`, updates, {
        headers: createAuthHeaders(),
    });
    return response.data;
}

/**
 * Delete a conversation
 */
export async function deleteConversation(id: string): Promise<void> {
    await axios.delete(`${API_BASE}/${id}`, {
        headers: createAuthHeaders(),
    });
}

/**
 * Add a message to a conversation
 */
export async function addMessageToConversation(
    conversationId: string,
    message: AddMessageInput
): Promise<Message> {
    const response = await axios.post<Message>(
        `${API_BASE}/${conversationId}/messages`,
        message,
        {
            headers: createAuthHeaders(),
        }
    );
    return response.data;
}

/**
 * Get messages for a conversation
 */
export async function getConversationMessages(
    conversationId: string
): Promise<Message[]> {
    const response = await axios.get<Message[]>(
        `${API_BASE}/${conversationId}/messages`,
        {
            headers: createAuthHeaders(),
        }
    );
    return response.data;
}

/**
 * Star/unstar a conversation
 */
export async function toggleStarConversation(
    id: string,
    isStarred: boolean
): Promise<Conversation> {
    return updateConversation(id, { isStarred });
}

/**
 * Archive/unarchive a conversation
 */
export async function toggleArchiveConversation(
    id: string,
    isArchived: boolean
): Promise<Conversation> {
    return updateConversation(id, { isArchived });
}

/**
 * Rename a conversation
 */
export async function renameConversation(
    id: string,
    title: string
): Promise<Conversation> {
    return updateConversation(id, { title });
}

// =============================================================================
// UTILITIES
// =============================================================================

/**
 * Generate conversation title from first user message
 */
export function generateConversationTitle(firstMessage: string): string {
    // Take first 50 chars or until first newline
    const title = firstMessage.split('\n')[0].slice(0, 50);
    return title.length < firstMessage.length ? `${title}...` : title;
}

/**
 * Export conversation as JSON
 */
export function exportConversationAsJSON(conversation: ConversationDetail): string {
    return JSON.stringify(conversation, null, 2);
}

/**
 * Export conversation as Markdown
 */
export function exportConversationAsMarkdown(conversation: ConversationDetail): string {
    let markdown = `# ${conversation.title}\n\n`;
    markdown += `**Model**: ${conversation.model}\n`;
    markdown += `**Created**: ${new Date(conversation.createdAt).toLocaleString()}\n`;
    markdown += `**Updated**: ${new Date(conversation.updatedAt).toLocaleString()}\n\n`;
    markdown += `---\n\n`;

    for (const message of conversation.messages) {
        const role = message.role.toUpperCase();
        const timestamp = new Date(message.createdAt).toLocaleTimeString();

        markdown += `## ${role} (${timestamp})\n\n`;
        markdown += `${message.content}\n\n`;

        if (message.model) {
            markdown += `*Model: ${message.model}*\n\n`;
        }
    }

    return markdown;
}

/**
 * Download text content as file
 */
export function downloadAsFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
