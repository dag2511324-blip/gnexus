# G-Nexus Chat Backend

Advanced AI chat backend with user authentication for the G-Nexus platform.

## Features

✅ **User Authentication** - JWT-based auth with refresh tokens  
✅ **Session Management** - Track and manage user sessions  
✅ **Conversation Persistence** - Store all chats in PostgreSQL  
✅ **Rate Limiting** - Protect against abuse  
✅ **Type Safety** - Full TypeScript coverage  
✅ **Validation** - Zod schemas for request validation  
✅ **Security** - Bcrypt password hashing, helmet, CORS  

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT
- **Validation**: Zod
- **Security**: bcrypt, helmet, rate-limit

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for access tokens
- `JWT_REFRESH_SECRET` - Secret for refresh tokens
- `OPENROUTER_API_KEY` - Your OpenRouter API key

### 3. Setup Database

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL locally
# Then create database
createdb gnexus_chat

# Run migrations
npm run db:push
```

**Option B: Cloud Database (Recommended)**

Use a free tier from:
- [Supabase](https://supabase.com) - Free tier available
- [Railway](https://railway.app) - $5 free credit
- [Neon](https://neon.tech) - Serverless Postgres

Get your connection string and add to `.env`.

### 4. Generate Prisma Client

```bash
npm run db:generate
```

### 5. Start Development Server

```bash
npm run dev
```

Server will start on `http://localhost:5000`

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/auth/sessions` | List user sessions |
| DELETE | `/api/auth/sessions/:id` | Revoke session |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health status |

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── index.ts     # Environment config
│   │   └── database.ts  # Prisma client
│   ├── controllers/     # Request handlers
│   │   └── authController.ts
│   ├── middleware/      # Express middleware
│   │   ├── auth.ts      # JWT authentication
│   │   ├── rateLimiter.ts
│   │   └── errorHandler.ts
│   ├── routes/          # API routes
│   │   └── authRoutes.ts
│   ├── services/        # Business logic
│   │   └── authService.ts
│   ├── utils/           # Helper functions
│   │   ├── auth.ts      # Auth utilities
│   │   └── validation.ts # Zod schemas
│   └── index.ts         # Server entry point
├── prisma/
│   └── schema.prisma    # Database schema
├── .env.example
├── package.json
└── tsconfig.json
```

## Database Schema

### Users
- Authentication credentials
- Profile information
- Preferences (theme, default model)

### Sessions
- Refresh token storage
- Device tracking (user agent, IP)
- Expiration management

### Conversations
- Chat history
- Model association
- Star/archive functionality
- Tags

### Messages
- Conversation messages
- Role (user/assistant/system)
- Model metadata
- Token usage tracking

### API Keys
- User's custom API keys
- Encrypted storage
- Provider tracking

## Development

### Run Tests
```bash
npm test
```

### Database Commands
```bash
# Push schema changes (dev)
npm run db:push

# Create migration
npm run db:migrate

# Open Prisma Studio (DB browser)
npm run db:studio
```

### Lint
```bash
npm run lint
npm run lint:fix
```

## Security

🔒 **Passwords**: Bcrypt with 12 salt rounds  
🔒 **Tokens**: JWT RS256  
🔒 **Rate Limiting**: 5 req/min for auth, 30 req/min for API  
🔒 **Headers**: Helmet security headers  
🔒 **CORS**: Configured for frontend origin  

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:5173 |
| `DATABASE_URL` | PostgreSQL connection | - (required) |
| `JWT_SECRET` | Access token secret | - (required) |
| `JWT_REFRESH_SECRET` | Refresh token secret | - (required) |
| `JWT_ACCESS_EXPIRY` | Access token expiry | 15m |
| `JWT_REFRESH_EXPIRY` | Refresh token expiry | 7d |
| `OPENROUTER_API_KEY` | OpenRouter API key | - (required) |

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "username": "testuser"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

### Get Current User
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Deployment

See [implementation_plan.md](../implementation_plan.md) for deployment guide.

## License

MIT - Dagmawi Amare, G-Nexus
