/**
 * Conversation Storage
 * LocalStorage-based conversation management
 */

import type { Message } from './chat-api';

export interface Conversation {
    id: string;
    title: string;
    model: string;
    messages: Message[];
    createdAt: string;
    updatedAt: string;
}

const STORAGE_KEY = 'gnexus_conversations';
const ACTIVE_CONVERSATION_KEY = 'gnexus_active_conversation';

/**
 * Get all conversations
 */
export function getConversations(): Conversation[] {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Failed to load conversations:', error);
        return [];
    }
}

/**
 * Get single conversation by ID
 */
export function getConversation(id: string): Conversation | null {
    const conversations = getConversations();
    return conversations.find(c => c.id === id) || null;
}

/**
 * Save conversation
 */
export function saveConversation(conversation: Conversation): void {
    const conversations = getConversations();
    const index = conversations.findIndex(c => c.id === conversation.id);

    conversation.updatedAt = new Date().toISOString();

    if (index >= 0) {
        conversations[index] = conversation;
    } else {
        conversations.push(conversation);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
}

/**
 * Delete conversation
 */
export function deleteConversation(id: string): void {
    const conversations = getConversations();
    const filtered = conversations.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

    // Clear active if deleted
    if (getActiveConversationId() === id) {
        setActiveConversationId(null);
    }
}

/**
 * Create new conversation
 */
export function createConversation(model: string, initialMessage?: Message): Conversation {
    const conversation: Conversation = {
        id: generateId(),
        title: 'New Conversation',
        model,
        messages: initialMessage ? [initialMessage] : [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    saveConversation(conversation);
    setActiveConversationId(conversation.id);

    return conversation;
}

/**
 * Update conversation title
 */
export function updateConversationTitle(id: string, title: string): void {
    const conversation = getConversation(id);
    if (conversation) {
        conversation.title = title;
        saveConversation(conversation);
    }
}

/**
 * Add message to conversation
 */
export function addMessage(conversationId: string, message: Message): void {
    const conversation = getConversation(conversationId);
    if (conversation) {
        conversation.messages.push(message);

        // Auto-generate title from first user message
        if (conversation.title === 'New Conversation' && message.role === 'user') {
            conversation.title = message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '');
        }

        saveConversation(conversation);
    }
}

/**
 * Get active conversation ID
 */
export function getActiveConversationId(): string | null {
    return localStorage.getItem(ACTIVE_CONVERSATION_KEY);
}

/**
 * Set active conversation ID
 */
export function setActiveConversationId(id: string | null): void {
    if (id) {
        localStorage.setItem(ACTIVE_CONVERSATION_KEY, id);
    } else {
        localStorage.removeItem(ACTIVE_CONVERSATION_KEY);
    }
}

/**
 * Export conversation as JSON
 */
export function exportConversation(id: string): void {
    const conversation = getConversation(id);
    if (!conversation) return;

    const dataStr = JSON.stringify(conversation, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `conversation-${conversation.id}.json`;
    link.click();

    URL.revokeObjectURL(url);
}

/**
 * Import conversation from JSON
 */
export function importConversation(file: File): Promise<Conversation> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const conversation = JSON.parse(e.target?.result as string) as Conversation;
                conversation.id = generateId(); // New ID to avoid conflicts
                saveConversation(conversation);
                resolve(conversation);
            } catch (error) {
                reject(new Error('Invalid conversation file'));
            }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}

/**
 * Generate unique ID
 */
function generateId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Clear all conversations
 */
export function clearAllConversations(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ACTIVE_CONVERSATION_KEY);
}
