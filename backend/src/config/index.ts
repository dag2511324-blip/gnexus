import 'dotenv/config';

export const config = {
    // Server
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:8080',

    // Database
    databaseUrl: process.env.DATABASE_URL || '',

    // JWT
    jwt: {
        secret: process.env.JWT_SECRET || 'change-this-secret',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'change-this-refresh-secret',
        accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
        refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
    },

    // OpenRouter
    openRouterApiKey: process.env.OPENROUTER_API_KEY || '',

    // Email
    smtp: {
        host: process.env.SMTP_HOST || '',
        port: parseInt(process.env.SMTP_PORT || '587'),
        user: process.env.SMTP_USER || '',
        password: process.env.SMTP_PASSWORD || '',
    },

    // Rate Limiting
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '30'),
    },
};
