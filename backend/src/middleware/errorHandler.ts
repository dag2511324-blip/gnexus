import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public isOperational = true
    ) {
        super(message);
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    console.error('Error:', err);

    // Zod validation error
    if (err instanceof ZodError) {
        res.status(400).json({
            error: 'Validation Error',
            message: 'Invalid request data',
            details: err.errors.map((e) => ({
                path: e.path.join('.'),
                message: e.message,
            })),
        });
        return;
    }

    // Custom app error
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            error: err.message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        });
        return;
    }

    // Prisma errors
    if (err.constructor.name === 'PrismaClientKnownRequestError') {
        const prismaError = err as any;

        // Unique constraint violation
        if (prismaError.code === 'P2002') {
            res.status(409).json({
                error: 'Conflict',
                message: `${prismaError.meta?.target?.[0] || 'Field'} already exists`,
            });
            return;
        }

        // Record not found
        if (prismaError.code === 'P2025') {
            res.status(404).json({
                error: 'Not Found',
                message: 'Resource not found',
            });
            return;
        }
    }

    // Default error
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

// Async handler wrapper
export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
