import { supabase } from '@/integrations/supabase/client';

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

export interface ConversationsResponse {
    conversations: Conversation[];
    pagination: {
        total: number;
        page: number;
        pages: number;
    };
}

/**
 * Fetch conversations from Supabase chat_conversations table
 */
export async function fetchConversations(): Promise<ConversationsResponse | null> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.warn('No authenticated user found');
            return null;
        }

        const { data, error } = await supabase
            .from('chat_conversations')
            .select('*')
            .order('last_message_at', { ascending: false });

        if (error) {
            console.error('Error fetching conversations:', error);
            return null;
        }

        const conversations: Conversation[] = (data || []).map(conv => ({
            id: conv.id,
            title: conv.session_id || 'Untitled Conversation',
            model: 'gpt-4', // Default model
            isStarred: false,
            isArchived: conv.status === 'archived',
            tags: [],
            createdAt: conv.created_at,
            updatedAt: conv.last_message_at || conv.created_at,
            messageCount: undefined
        }));

        return {
            conversations,
            pagination: {
                total: conversations.length,
                page: 1,
                pages: 1
            }
        };
    } catch (error) {
        console.error('Failed to fetch conversations:', error);
        return null;
    }
}

/**
 * Get conversation count for user stats
 */
export async function getConversationCount(): Promise<number> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return 0;

        const { count, error } = await supabase
            .from('chat_conversations')
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error('Error getting conversation count:', error);
            return 0;
        }

        return count || 0;
    } catch (error) {
        console.error('Failed to get conversation count:', error);
        return 0;
    }
}
