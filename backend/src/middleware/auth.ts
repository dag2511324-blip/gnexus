import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import prisma from '../config/database';

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                username: string;
            };
        }
    }
}

/**
 * Authentication middleware - verifies JWT token
 */
export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Unauthorized', message: 'No token provided' });
            return;
        }

        const token = authHeader.split(' ')[1];
        let decoded: any;
        let userId: string;

        try {
            // First try verify with local secret
            decoded = jwt.verify(token, config.jwt.secret);
            userId = (decoded as any).userId;
        } catch (localError) {
            // If local verification fails, check if it's a Supabase token
            // note: In prod, we should verify with SUPABASE_JWT_SECRET
            try {
                // We decode to check the issuer/claims
                const unverifiedDecode = jwt.decode(token);
                if (unverifiedDecode && typeof unverifiedDecode === 'object' && unverifiedDecode.aud === 'authenticated') {
                    // It looks like a Supabase token
                    decoded = unverifiedDecode;
                    userId = decoded.sub; // Supabase uses 'sub' for user ID

                    // Verify properly if secret exists
                    if (process.env.SUPABASE_JWT_SECRET) {
                        jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
                    } else {
                        // console.warn('Accepting Supabase token without signature verification (dev mode)');
                    }
                } else {
                    throw localError; // Throw original error if not supabase-like
                }
            } catch (sbError) {
                // Both failed
                throw localError;
            }
        }

        if (!userId) {
            console.warn('[Auth Middleware] No userId found in token. Decoded payload:', decoded);
            res.status(401).json({ error: 'Unauthorized', message: 'Invalid token payload' });
            return;
        }

        // Get user from database OR create if Supabase user doesn't exist locally
        let user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                username: true,
                isActive: true,
            },
        });

        if (!user && decoded.aud === 'authenticated') {
            // JIT Create/Upsert for Supabase users
            const email = decoded.email;
            // Use metadata for other fields if available
            const metadata = decoded.user_metadata || {};
            const username = metadata.username || email?.split('@')[0] || `user_${userId.substring(0, 8)}`;

            user = await prisma.user.upsert({
                where: { id: userId },
                create: {
                    id: userId,
                    email: email,
                    username: username,
                    password: 'supabase-auth-placeholder', // Dummy password
                    firstName: metadata.first_name || metadata.full_name?.split(' ')[0] || '',
                    lastName: metadata.last_name || metadata.full_name?.split(' ').slice(1).join(' ') || '',
                    avatar: metadata.avatar_url || '',
                    isActive: true,
                    emailVerified: true
                },
                update: {
                    // Update metadata on login
                    email: email,
                    username: username,
                    avatar: metadata.avatar_url,
                },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    isActive: true,
                }
            });
        }

        if (!user || !user.isActive) {
            res.status(401).json({ error: 'Unauthorized', message: 'Invalid token or inactive user' });
            return;
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error: any) {
        console.error('[Auth Middleware] Authentication error:', {
            message: error.message,
            stack: error.stack,
            token: req.headers.authorization?.substring(0, 30) + '...'
        });
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ error: 'Unauthorized', message: 'Invalid token' });
        } else if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({ error: 'Unauthorized', message: 'Token expired' });
        } else {
            console.error('Auth middleware error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

/**
 * Optional authentication - doesn't fail if no token provided
 */
export const optionalAuth = async (
    req: Request,
    _res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            let userId: string | undefined;

            try {
                // First try verify with local secret
                const decoded = jwt.verify(token, config.jwt.secret) as any;
                userId = decoded.userId;
            } catch (localError) {
                // If local verification fails, check if it's a Supabase token
                try {
                    const unverifiedDecode = jwt.decode(token);
                    if (unverifiedDecode && typeof unverifiedDecode === 'object' && unverifiedDecode.aud === 'authenticated') {
                        userId = unverifiedDecode.sub;
                    }
                } catch (sbError) {
                    // Ignore
                }
            }

            if (userId) {
                const user = await prisma.user.findUnique({
                    where: { id: userId },
                    select: {
                        id: true,
                        email: true,
                        username: true,
                        isActive: true,
                    },
                });

                if (user && user.isActive) {
                    req.user = user;
                }
            }
        }

        next();
    } catch {
        // Silently fail - auth is optional
        next();
    }
};
