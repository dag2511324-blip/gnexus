import { Request, Response } from 'express';
import {
    createConversationSchema,
    sendMessageSchema,
    updateConversationSchema,
} from '../utils/validation';
import * as conversationService from '../services/conversationService';
import * as aiService from '../services/aiService';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * Get user's conversations
 * GET /api/conversations
 */
export const getConversations = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const archived = req.query.archived === 'true';
    const starred = req.query.starred === 'true' ? true : req.query.starred === 'false' ? false : undefined;
    const search = req.query.search as string;

    const result = await conversationService.getUserConversations(
        req.user.id,
        page,
        limit,
        archived,
        starred,
        search
    );

    res.json(result);
});

/**
 * Get single conversation with messages
 * GET /api/conversations/:id
 */
export const getConversation = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    const conversation = await conversationService.getConversation(
        req.params.id,
        req.user.id
    );

    res.json(conversation);
});

/**
 * Create new conversation
 * POST /api/conversations
 */
export const createConversation = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    const data = createConversationSchema.parse(req.body);

    const conversation = await conversationService.createConversation(
        req.user.id,
        data
    );

    res.status(201).json(conversation);
});

/**
 * Update conversation
 * PATCH /api/conversations/:id
 */
export const updateConversation = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    const data = updateConversationSchema.parse(req.body);

    const conversation = await conversationService.updateConversation(
        req.params.id,
        req.user.id,
        data
    );

    res.json(conversation);
});

/**
 * Delete conversation
 * DELETE /api/conversations/:id
 */
export const deleteConversation = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    await conversationService.deleteConversation(req.params.id, req.user.id);

    res.json({ message: 'Conversation deleted successfully' });
});

/**
 * Send message and get AI response
 * POST /api/conversations/:id/messages
 */
export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    const data = sendMessageSchema.parse(req.body);
    const conversationId = req.params.id;

    // Add user message
    const userMessage = await conversationService.addMessage(
        conversationId,
        req.user.id,
        'user',
        data.content
    );

    // Get conversation messages for context
    const messages = await conversationService.getConversationMessages(
        conversationId,
        req.user.id
    );

    // Prepare messages for AI
    const aiMessages = messages.map((m) => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
    }));

    // Get conversation to know which model to use
    const conversation = await conversationService.getConversation(
        conversationId,
        req.user.id
    );

    const model = data.model || conversation.model;

    // Get AI response
    const aiResponse = await aiService.sendToAI(aiMessages, model);

    // Save AI message
    const assistantMessage = await conversationService.addMessage(
        conversationId,
        req.user.id,
        'assistant',
        aiResponse.content,
        model,
        {
            tokens: aiResponse.tokens,
            latency: aiResponse.latency,
        }
    );

    res.json({
        userMessage,
        assistantMessage,
    });
});

/**
 * Stream AI response (SSE)
 * POST /api/conversations/:id/messages/stream
 */
export const streamMessage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    const data = sendMessageSchema.parse(req.body);
    const conversationId = req.params.id;

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Add user message
    const userMessage = await conversationService.addMessage(
        conversationId,
        req.user.id,
        'user',
        data.content
    );

    // Send user message event
    res.write(`data: ${JSON.stringify({ type: 'user_message', message: userMessage })}\n\n`);

    // Get messages for context
    const messages = await conversationService.getConversationMessages(
        conversationId,
        req.user.id
    );

    const aiMessages = messages.map((m) => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
    }));

    const conversation = await conversationService.getConversation(
        conversationId,
        req.user.id
    );

    const model = data.model || conversation.model;

    let fullContent = '';

    // Stream AI response
    for await (const chunk of aiService.streamFromAI(aiMessages, model)) {
        fullContent += chunk;
        res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
    }

    // Save complete AI message
    const assistantMessage = await conversationService.addMessage(
        conversationId,
        req.user.id,
        'assistant',
        fullContent,
        model
    );

    // Send completion event
    res.write(`data: ${JSON.stringify({ type: 'complete', message: assistantMessage })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
});
