# Troubleshooting TypeScript/Lint Errors

## Current Errors You're Seeing

The TypeScript errors in `apps/playground` are **expected and normal** before dependencies are installed. Here's why and how to fix them:

## Why These Errors Appear

1. **Missing node_modules**: TypeScript can't find type definitions for `next`, `react`, etc.
2. **No dependencies installed**: npm packages haven't been installed yet
3. **IDE analyzing before build**: Your editor is checking files before the project is set up

## ✅ Solution: Install Dependencies

### Quick Fix (Automated)

Run the setup script from the `apis` directory:

```bash
cd apis
./setup.sh
```

This will:
- Start Docker containers (Redis + Postgres)
- Install all npm dependencies
- Create .env files
- Set up the entire project

### Manual Fix

If you prefer to do it step-by-step:

```bash
# 1. Start infrastructure
cd apis/infra
docker-compose up -d
cd ..

# 2. Install API dependencies
cd apps/api
cp .env.example .env
npm install
cd ../..

# 3. Install Playground dependencies
cd apps/playground
cp .env.example .env.local
npm install
cd ../..

# 4. Install Client dependencies
cd packages/rumad-client
npm install
cd ../..
```

## After Installing Dependencies

Once you run `npm install` in `apps/playground`, all these errors will disappear:

- ✅ `Cannot find module 'react'` - FIXED
- ✅ `Cannot find module 'next/head'` - FIXED
- ✅ `JSX element implicitly has type 'any'` - FIXED
- ✅ All other TypeScript errors - FIXED

## Verify Everything Works

Run the validation script:

```bash
cd apis
./validate.sh
```

This will check:
- ✓ Node.js and npm versions
- ✓ Docker is running
- ✓ Project structure is correct
- ✓ Configuration files exist
- ✓ Dependencies are installed
- ✓ Infrastructure is running

## Common Issues After Installation

### Issue 1: "Port already in use"

**Error**: `EADDRINUSE: address already in use :::3001`

**Solution**:
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or change port in apps/api/.env
PORT=3005
```

### Issue 2: "Cannot connect to Redis"

**Error**: `Error: connect ECONNREFUSED 127.0.0.1:6379`

**Solution**:
```bash
# Start Redis
cd apis/infra
docker-compose up -d redis

# Verify it's running
docker ps | grep redis
```

### Issue 3: "Module not found" after installation

**Solution**:
```bash
# Clear cache and reinstall
cd apps/playground  # or apps/api
rm -rf node_modules package-lock.json
npm install
```

### Issue 4: Next.js build errors

**Error**: `Error: Cannot find module 'next'`

**Solution**:
```bash
cd apps/playground
npm install next@latest react@latest react-dom@latest
```

### Issue 5: TypeScript still showing errors

**Solution**:
1. Restart your editor/IDE (VS Code: Cmd+Shift+P → "Reload Window")
2. Check TypeScript version: `npx tsc --version`
3. Rebuild TypeScript: `npx tsc --build --clean && npx tsc --build`

## Testing After Setup

### 1. Test API Server

```bash
cd apps/api
npm run dev
```

Expected output:
```
[timestamp] INFO: 🚀 RUMAD API Server running at http://0.0.0.0:3001
```

Test endpoint:
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{"status":"ok","timestamp":"2025-10-26T..."}
```

### 2. Test Playground

```bash
cd apps/playground
npm run dev
```

Expected output:
```
ready - started server on 0.0.0.0:3002, url: http://localhost:3002
```

Open browser: http://localhost:3002

### 3. Test API Integration

In the playground:
1. Select endpoint: `/v1/quotes`
2. Enter API key: `demo_key_12345`
3. Click "Send Request"
4. You should see a quote in the response

## Still Having Issues?

### Check Your Environment

```bash
# Node.js version (should be 20+)
node -v

# npm version
npm -v

# Docker status
docker ps

# Check if ports are free
lsof -ti:3001
lsof -ti:3002
lsof -ti:6379
lsof -ti:5432
```

### Enable Debug Mode

**API Server** - Add to `apps/api/.env`:
```env
LOG_LEVEL=debug
```

**Playground** - Check browser console for errors

**Client** - Enable debug:
```typescript
const client = createClient({
  apiKey: 'demo_key_12345',
  debug: true  // Logs all requests
});
```

### Get Detailed Logs

```bash
# API Server logs
cd apps/api
npm run dev 2>&1 | tee api.log

# Docker logs
cd apis/infra
docker-compose logs -f

# Specific container
docker logs rumad-redis
docker logs rumad-postgres
```

## Expected File Structure After Setup

```
apis/
├── apps/
│   ├── api/
│   │   ├── node_modules/     ← Should exist after npm install
│   │   ├── .env              ← Should exist (copied from .env.example)
│   │   └── ...
│   └── playground/
│       ├── node_modules/     ← Should exist after npm install
│       ├── .next/            ← Created during first run
│       ├── .env.local        ← Should exist (copied from .env.example)
│       └── ...
├── infra/
│   └── (docker volumes created automatically)
└── packages/
    └── rumad-client/
        ├── node_modules/     ← Should exist after npm install
        └── ...
```

## Quick Diagnostic Commands

```bash
# Check everything at once
cd apis && ./validate.sh

# Check specific parts
docker ps                           # Infrastructure
ls apps/api/node_modules            # API deps installed
ls apps/playground/node_modules     # Playground deps installed
cat apps/api/.env                   # API config exists
cat apps/playground/.env.local      # Playground config exists
```

## Last Resort: Clean Install

If nothing works, start fresh:

```bash
cd apis

# Stop and remove all containers
cd infra
docker-compose down -v
cd ..

# Remove all node_modules
rm -rf apps/api/node_modules
rm -rf apps/playground/node_modules
rm -rf packages/rumad-client/node_modules

# Remove lock files
rm -f apps/api/package-lock.json
rm -f apps/playground/package-lock.json
rm -f packages/rumad-client/package-lock.json

# Run setup again
./setup.sh
```

## Summary

**TL;DR**: The errors you see are normal before installation. Run:

```bash
cd apis
./setup.sh
```

Then start the servers:

```bash
# Terminal 1
cd apis/apps/api && npm run dev

# Terminal 2
cd apis/apps/playground && npm run dev
```

Everything should work! 🎉
