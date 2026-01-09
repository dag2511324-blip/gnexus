import prisma from '../config/database';
import { CreateConversationInput, SendMessageInput, UpdateConversationInput } from '../utils/validation';
import { AppError } from '../middleware/errorHandler';

/**
 * Get user's conversations with pagination
 */
export const getUserConversations = async (
    userId: string,
    page = 1,
    limit = 20,
    archived = false,
    starred?: boolean,
    search?: string
) => {
    const skip = (page - 1) * limit;

    const where: any = {
        userId,
        isArchived: archived,
    };

    if (starred !== undefined) {
        where.isStarred = starred;
    }

    if (search) {
        where.title = {
            contains: search,
            mode: 'insensitive',
        };
    }

    const [conversations, total] = await Promise.all([
        prisma.conversation.findMany({
            where,
            select: {
                id: true,
                title: true,
                model: true,
                isStarred: true,
                isArchived: true,
                tags: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: { messages: true },
                },
            },
            orderBy: { updatedAt: 'desc' },
            skip,
            take: limit,
        }),
        prisma.conversation.count({ where }),
    ]);

    return {
        conversations: conversations.map((c) => ({
            ...c,
            messageCount: c._count.messages,
        })),
        pagination: {
            total,
            page,
            pages: Math.ceil(total / limit),
        },
    };
};

/**
 * Get single conversation with messages
 */
export const getConversation = async (conversationId: string, userId: string) => {
    const conversation = await prisma.conversation.findFirst({
        where: {
            id: conversationId,
            userId,
        },
        include: {
            messages: {
                orderBy: { createdAt: 'asc' },
                select: {
                    id: true,
                    role: true,
                    content: true,
                    model: true,
                    tokens: true,
                    latency: true,
                    attachments: true,
                    createdAt: true,
                },
            },
        },
    });

    if (!conversation) {
        throw new AppError(404, 'Conversation not found');
    }

    return conversation;
};

/**
 * Create new conversation
 */
export const createConversation = async (
    userId: string,
    data: CreateConversationInput
) => {
    const conversation = await prisma.conversation.create({
        data: {
            userId,
            title: data.title,
            model: data.model,
        },
        select: {
            id: true,
            title: true,
            model: true,
            createdAt: true,
        },
    });

    return conversation;
};

/**
 * Update conversation
 */
export const updateConversation = async (
    conversationId: string,
    userId: string,
    data: UpdateConversationInput
) => {
    // Verify ownership
    const conversation = await prisma.conversation.findFirst({
        where: { id: conversationId, userId },
    });

    if (!conversation) {
        throw new AppError(404, 'Conversation not found');
    }

    const updated = await prisma.conversation.update({
        where: { id: conversationId },
        data,
        select: {
            id: true,
            title: true,
            isStarred: true,
            isArchived: true,
            tags: true,
            updatedAt: true,
        },
    });

    return updated;
};

/**
 * Delete conversation
 */
export const deleteConversation = async (conversationId: string, userId: string) => {
    // Verify ownership
    const conversation = await prisma.conversation.findFirst({
        where: { id: conversationId, userId },
    });

    if (!conversation) {
        throw new AppError(404, 'Conversation not found');
    }

    await prisma.conversation.delete({
        where: { id: conversationId },
    });
};

/**
 * Add message to conversation
 */
export const addMessage = async (
    conversationId: string,
    userId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    model?: string,
    metadata?: {
        tokens?: number;
        latency?: number;
        attachments?: any[];
    }
) => {
    // Verify conversation ownership
    const conversation = await prisma.conversation.findFirst({
        where: { id: conversationId, userId },
    });

    if (!conversation) {
        throw new AppError(404, 'Conversation not found');
    }

    const message = await prisma.message.create({
        data: {
            conversationId,
            role,
            content,
            model,
            tokens: metadata?.tokens,
            latency: metadata?.latency,
            attachments: metadata?.attachments || [],
        },
        select: {
            id: true,
            role: true,
            content: true,
            model: true,
            tokens: true,
            latency: true,
            createdAt: true,
        },
    });

    // Update conversation's updatedAt
    await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
    });

    return message;
};

/**
 * Get conversation messages
 */
export const getConversationMessages = async (
    conversationId: string,
    userId: string
) => {
    // Verify ownership
    const conversation = await prisma.conversation.findFirst({
        where: { id: conversationId, userId },
    });

    if (!conversation) {
        throw new AppError(404, 'Conversation not found');
    }

    const messages = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
        select: {
            id: true,
            role: true,
            content: true,
            model: true,
            tokens: true,
            latency: true,
            attachments: true,
            createdAt: true,
        },
    });

    return messages;
};
