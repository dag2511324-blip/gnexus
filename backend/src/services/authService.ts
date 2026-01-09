import prisma from '../config/database';
import { RegisterInput, LoginInput } from '../utils/validation';
import {
    hashPassword,
    comparePassword,
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} from '../utils/auth';
import { AppError } from '../middleware/errorHandler';

/**
 * Register new user
 */
export const registerUser = async (data: RegisterInput) => {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [{ email: data.email }, { username: data.username }],
        },
    });

    if (existingUser) {
        if (existingUser.email === data.email) {
            throw new AppError(409, 'Email already registered');
        }
        throw new AppError(409, 'Username already taken');
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
        data: {
            email: data.email,
            username: data.username,
            password: hashedPassword,
            firstName: data.firstName,
            lastName: data.lastName,
        },
        select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            createdAt: true,
        },
    });

    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.session.create({
        data: {
            userId: user.id,
            refreshToken,
            expiresAt,
        },
    });

    return { user, accessToken, refreshToken };
};

/**
 * Login user
 */
export const loginUser = async (
    data: LoginInput,
    userAgent?: string,
    ipAddress?: string
) => {
    // Find user
    const user = await prisma.user.findUnique({
        where: { email: data.email },
    });

    if (!user || !user.isActive) {
        throw new AppError(401, 'Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await comparePassword(data.password, user.password);

    if (!isPasswordValid) {
        throw new AppError(401, 'Invalid credentials');
    }

    // Update last login
    await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.session.create({
        data: {
            userId: user.id,
            refreshToken,
            userAgent,
            ipAddress,
            expiresAt,
        },
    });

    return {
        user: {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar,
            defaultModel: user.defaultModel,
            theme: user.theme,
        },
        accessToken,
        refreshToken,
    };
};

/**
 * Refresh access token
 */
export const refreshAccessToken = async (refreshToken: string) => {
    // Verify token
    let decoded: { userId: string };
    try {
        decoded = verifyRefreshToken(refreshToken);
    } catch {
        throw new AppError(401, 'Invalid refresh token');
    }

    // Check if session exists
    const session = await prisma.session.findUnique({
        where: { refreshToken },
        include: { user: true },
    });

    if (!session || session.expiresAt < new Date() || !session.user.isActive) {
        // Delete expired session
        if (session) {
            await prisma.session.delete({ where: { id: session.id } });
        }
        throw new AppError(401, 'Invalid refresh token');
    }

    // Generate new access token
    const accessToken = generateAccessToken(session.userId);

    return {
        accessToken,
        user: {
            id: session.user.id,
            email: session.user.email,
            username: session.user.username,
        },
    };
};

/**
 * Logout user (invalidate refresh token)
 */
export const logoutUser = async (refreshToken: string) => {
    await prisma.session.deleteMany({
        where: { refreshToken },
    });
};

/**
 * Get user sessions
 */
export const getUserSessions = async (userId: string) => {
    return prisma.session.findMany({
        where: {
            userId,
            expiresAt: { gt: new Date() },
        },
        select: {
            id: true,
            userAgent: true,
            ipAddress: true,
            createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
    });
};

/**
 * Revoke session
 */
export const revokeSession = async (userId: string, sessionId: string) => {
    await prisma.session.deleteMany({
        where: {
            id: sessionId,
            userId, // Ensure user owns the session
        },
    });
};
