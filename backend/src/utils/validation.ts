import { z } from 'zod';

// User registration schema
export const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    username: z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(30, 'Username must be at most 30 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
});

// User login schema
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

// Conversation creation schema
export const createConversationSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    model: z.string().min(1, 'Model is required'),
});

// Message sending schema
export const sendMessageSchema = z.object({
    content: z.string().min(1, 'Message content is required'),
    model: z.string().optional(),
    stream: z.boolean().optional(),
});

// Update conversation schema
export const updateConversationSchema = z.object({
    title: z.string().max(200, 'Title too long').optional(),
    isStarred: z.boolean().optional(),
    isArchived: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type UpdateConversationInput = z.infer<typeof updateConversationSchema>;
