# Quick Start Guide - G-Nexus Chat Backend

## Getting Started in 5 Minutes

### Step 1: Install Dependencies (30 seconds)

```bash
cd backend
npm install
```

### Step 2: Setup Database (2 minutes)

**Easy Option - Use Supabase (Free)**

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy your database URL from Settings → Database
4. It looks like: `postgresql://postgres:[password]@[host]:5432/postgres`

### Step 3: Configure Environment (1 minute)

Create `backend/.env`:

```bash
DATABASE_URL="your-supabase-connection-string"
JWT_SECRET="my-super-secret-key-123"
JWT_REFRESH_SECRET="my-refresh-secret-456"
OPENROUTER_API_KEY="sk-or-v1-your-key"
```

### Step 4: Initialize Database (1 minute)

```bash
npm run db:push
```

This creates all tables in your database.

### Step 5: Start Server (instant)

```bash
npm run dev
```

Server runs on `http://localhost:5000`

### Step 6: Test It!

**Register a user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@gnexus.com",
    "password": "Test123!",
    "username": "testuser"
  }'
```

You should get back:
```json
{
  "message": "User registered successfully",
  "user": { ... },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

✅ **Done!** Your backend is running.

## Next Steps

1. **Frontend Integration** - Update frontend to use this backend
2. **Add More Features** - Implement chat endpoints
3. **Deploy** - Deploy to Railway or Render

## Troubleshooting

**Problem**: `npm install` fails  
**Solution**: Make sure you have Node.js 20+ installed

**Problem**: Database connection fails  
**Solution**: Check your `DATABASE_URL` is correct

**Problem**: TypeScript errors  
**Solution**: Run `npm run db:generate` to create Prisma types

## Production Checklist

Before deploying:
- [ ] Change `JWT_SECRET` and `JWT_REFRESH_SECRET` to random strings
- [ ] Set `NODE_ENV=production`
- [ ] Use a production database
- [ ] Enable HTTPS
- [ ] Setup monitoring (Sentry, etc.)
- [ ] Configure CORS for your domain
