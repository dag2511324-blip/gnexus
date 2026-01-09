# Database Setup Guide - Supabase (Free)

## Quick Setup (5 Minutes)

### Step 1: Create Supabase Account

1. Go to **https://supabase.com**
2. Click "Start your project"
3. Sign in with GitHub (recommended) or email

### Step 2: Create New Project

1. Click "New Project"
2. Fill in details:
   - **Name**: `gnexus-chat` (or any name)
   - **Database Password**: Generate strong password (SAVE THIS!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free (no credit card required)

3. Click "Create new project"
4. Wait 2-3 minutes for database to be provisioned

### Step 3: Get Database Connection String

1. In your Supabase project dashboard, click **Settings** (gear icon)
2. Click **Database** in sidebar
3. Scroll to **Connection string**
4. Select **URI** tab
5. Copy the connection string that looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
6. **Replace `[YOUR-PASSWORD]` with the password you generated in Step 2**

### Step 4: Configure Backend

1. Open `backend/.env` file
2. Update `DATABASE_URL`:
   ```bash
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres"
   ```

3. Make sure other variables are set:
   ```bash
   JWT_SECRET="some-random-secret-key-here"
   JWT_REFRESH_SECRET="another-random-secret-key"
   OPENROUTER_API_KEY="sk-or-v1-..."  # From your OpenRouter account
   ```

### Step 5: Initialize Database

```bash
cd backend
npm run db:push
```

You should see output like:
```
🚀  Your database is now in sync with your Prisma schema. Done in 2.3s
```

### Step 6: Start Backend Server

```bash
npm run dev
```

You should see:
```
🚀 G-Nexus Chat Backend running on http://localhost:5000
📝 Environment: development
🌐 Frontend URL: http://localhost:5173
```

## ✅ **That's It! Database is Ready!**

---

## Alternative: Local PostgreSQL

If you prefer local PostgreSQL:

1. **Install PostgreSQL** (Windows/Mac/Linux)
   - Windows: https://www.postgresql.org/download/windows/
   - Mac: `brew install postgresql`
   - Linux: `sudo apt install postgresql`

2. **Create Database**
   ```bash
   createdb gnexus_chat
   ```

3. **Update .env**
   ```bash
   DATABASE_URL="postgresql://postgres:password@localhost:5432/gnexus_chat"
   ```

4. **Initialize**
   ```bash
   npm run db:push
   ```

---

## Troubleshooting

**Error: "P1001: Can't reach database server"**
- Check your internet connection
- Verify DATABASE_URL is correct
- Check Supabase project is active

**Error: "Authentication failed"**
- Double-check password in DATABASE_URL
- Make sure you replaced [YOUR-PASSWORD]

**Error: "Database doesn't exist"**
- Supabase creates `postgres` database by default
- Use that database name in connection string

**Error: "SSL required"**
- Add `?sslmode=require` to end of DATABASE_URL:
  ```
  postgresql://...postgres?sslmode=require
  ```

---

## Verify Database Setup

1. **Check Prisma Studio** (Visual database browser)
   ```bash
   npm run db:studio
   ```
   Opens http://localhost:5555

2. **Check tables exist**
   You should see:
   - users
   - sessions
   - conversations
   - messages
   - api_keys

---

## Next Steps

Once database is set up:

1. ✅ Backend running on port 5000
2. ✅ Frontend running on port 5173
3. ✅ Test registration at http://localhost:5173/register
4. ✅ Test login at http://localhost:5173/login
5. ✅ Access chat at http://localhost:5173/chat
