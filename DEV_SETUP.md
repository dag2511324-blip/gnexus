# 🚀 G-Nexus Development Setup

## Quick Start

### Option 1: Run Both Servers Together (Recommended)

```bash
npm run dev:full
```

This will start both the frontend (port 8080) and backend (port 5000) concurrently.

### Option 2: Run Servers Separately

**Terminal 1 - Backend:**
```bash
npm run dev:backend
# OR
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## Access Points

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:5000
- **API via Proxy**: http://localhost:8080/api/*

## How It Works

The frontend (Vite) runs on port **8080** and automatically proxies all `/api/*` requests to the backend on port **5000**. This means:

- You access the app at `http://localhost:8080`
- OAuth redirects use `http://localhost:8080/chat`
- API calls go to `http://localhost:8080/api/auth`, etc.
- Vite forwards these to `http://localhost:5000/api/auth` behind the scenes

## Configuration Files

- **Frontend Port**: `vite.config.ts` (line 11: `port: 8080`)
- **Backend Port**: `backend/src/config/index.ts` (defaults to 5000)
- **Proxy Config**: `vite.config.ts` (lines 12-26)

## Troubleshooting

### Port Already in Use

If port 8080 or 5000 is busy:
```bash
# Windows
netstat -ano | findstr :8080
netstat -ano | findstr :5000

# Kill process by PID
taskkill /PID <PID> /F
```

### CORS Errors

Make sure backend allows requests from port 8080. Check `backend/src/index.ts` line 18.

### OAuth Not Working

1. Ensure both servers are running
2. Verify Supabase redirect URL includes: `http://localhost:8080/chat`
3. Check browser console for errors
