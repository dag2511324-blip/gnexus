import { Request, Response } from 'express';
import { registerSchema, loginSchema } from '../utils/validation';
import * as authService from '../services/authService';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * Register new user
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
    // Validate input
    const data = registerSchema.parse(req.body);

    // Register user
    const result = await authService.registerUser(data);

    res.status(201).json({
        message: 'User registered successfully',
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
    });
});

/**
 * Login user
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
    // Validate input
    const data = loginSchema.parse(req.body);

    // Login user
    const result = await authService.loginUser(
        data,
        req.headers['user-agent'],
        req.ip
    );

    res.json({
        message: 'Login successful',
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
    });
});

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export const refresh = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        res.status(400).json({ error: 'Refresh token required' });
        return;
    }

    const result = await authService.refreshAccessToken(refreshToken);

    res.json({
        accessToken: result.accessToken,
        user: result.user,
    });
});

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (refreshToken) {
        await authService.logoutUser(refreshToken);
    }

    res.json({ message: 'Logged out successfully' });
});

/**
 * Get current user
 * GET /api/auth/me
 */
export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    // User is attached by auth middleware
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    res.json({ user: req.user });
});

/**
 * Get user sessions
 * GET /api/auth/sessions
 */
export const getSessions = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    const sessions = await authService.getUserSessions(req.user.id);

    res.json({ sessions });
});

/**
 * Revoke session
 * DELETE /api/auth/sessions/:sessionId
 */
export const revokeSession = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    const { sessionId } = req.params;

    await authService.revokeSession(req.user.id, sessionId);

    res.json({ message: 'Session revoked successfully' });
});
