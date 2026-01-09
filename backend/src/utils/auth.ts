import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config';

const SALT_ROUNDS = 12;

/**
 * Hash password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare password with hash
 */
export const comparePassword = async (
    password: string,
    hash: string
): Promise<boolean> => {
    return bcrypt.compare(password, hash);
};

/**
 * Generate JWT access token
 */
export const generateAccessToken = (userId: string): string => {
    return jwt.sign({ userId }, config.jwt.secret, {
        expiresIn: config.jwt.accessExpiry,
    });
};

/**
 * Generate JWT refresh token
 */
export const generateRefreshToken = (userId: string): string => {
    return jwt.sign({ userId }, config.jwt.refreshSecret, {
        expiresIn: config.jwt.refreshExpiry,
    });
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): { userId: string } => {
    return jwt.verify(token, config.jwt.refreshSecret) as { userId: string };
};

/**
 * Generate random string for tokens
 */
export const generateRandomToken = (length: number = 32): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};
