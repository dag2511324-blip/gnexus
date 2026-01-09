import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';

const app: Application = express();

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security headers
app.use(helmet());

// CORS configuration - Allow both dev server ports
app.use(
    cors({
        origin: [config.frontendUrl, 'http://localhost:8080', 'http://localhost:5173'],
        credentials: true,
    })
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================================
// ROUTES
// ============================================================================

import authRoutes from './routes/authRoutes';
import conversationRoutes from './routes/conversationRoutes';
import { errorHandler } from './middleware/errorHandler';

// Health check
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/conversations', conversationRoutes);

// Placeholder routes (to be implemented)
app.use('/api/user', (req, res) => res.json({ message: 'User routes coming soon' }));

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
    });
});

// Error handler (must be last)
app.use(errorHandler);

// ============================================================================
// START SERVER
// ============================================================================

const PORT = config.port;

app.listen(PORT, () => {
    console.log(`🚀 G-Nexus Chat Backend running on http://localhost:${PORT}`);
    console.log(`📝 Environment: ${config.nodeEnv}`);
    console.log(`🌐 Frontend URL: ${config.frontendUrl}`);
});

export default app;
