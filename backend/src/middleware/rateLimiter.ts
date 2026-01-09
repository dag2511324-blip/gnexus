import rateLimit from 'express-rate-limit';
import { config } from '../config';

// General API rate limiter
export const apiLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: {
        error: 'Too Many Requests',
        message: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict rate limit for authentication endpoints
export const authLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // 5 requests per minute
    message: {
        error: 'Too Many Requests',
        message: 'Too many authentication attempts, please try again later.',
    },
});

// Rate limit for chat endpoints (per user)
export const chatLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 messages per minute
    keyGenerator: (req) => {
        // Use user ID if authenticated, otherwise IP
        return req.user?.id || req.ip || 'unknown';
    },
    message: {
        error: 'Too Many Requests',
        message: 'Too many messages sent, please slow down.',
    },
});
