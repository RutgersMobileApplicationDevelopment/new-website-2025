# Getting Started with RUMAD APIs

This guide will help you get the RUMAD API platform up and running in under 5 minutes.

## Prerequisites

Before you begin, ensure you have:

- ✅ **Node.js 20+** - [Download here](https://nodejs.org/)
- ✅ **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop)
- ✅ **Git** - [Download here](https://git-scm.com/)

## Quick Setup (Automated)

The easiest way to get started is to use our setup script:

```bash
cd apis
./setup.sh
```

This will:
1. Start Redis and Postgres containers
2. Install dependencies for all packages
3. Create `.env` files from examples
4. Set up the entire platform

## Manual Setup

If you prefer to set things up manually:

### 1. Start Infrastructure

```bash
cd apis/infra
docker-compose up -d
```

### 2. Setup API Server

```bash
cd apis/apps/api
cp .env.example .env
npm install
```

### 3. Setup Playground

```bash
cd apis/apps/playground
cp .env.example .env.local
npm install
```

### 4. Setup Client Library

```bash
cd apis/packages/rumad-client
npm install
```

## Running the Platform

### Option 1: Run All Together

From the `apis/` directory:

```bash
# Terminal 1: Start API server
cd apps/api
npm run dev

# Terminal 2: Start Playground
cd apps/playground
npm run dev
```

### Option 2: Use npm-run-all (if installed)

```bash
cd apis
npm install  # Install root dependencies including npm-run-all
npm run dev  # Starts both API and Playground
```

## Verify Installation

### 1. Check Infrastructure

```bash
docker ps
```

You should see `rumad-redis` and `rumad-postgres` running.

### 2. Test API Server

```bash
curl -H 'x-api-key: demo_key_12345' http://localhost:3001/health
```

Expected response:
```json
{"status":"ok","timestamp":"2025-10-26T..."}
```

### 3. Test an Endpoint

```bash
curl -H 'x-api-key: demo_key_12345' http://localhost:3001/v1/quotes
```

Expected response:
```json
{
  "ok": true,
  "data": {
    "quote": {
      "text": "Programs must be written for people to read...",
      "author": "Harold Abelson & Gerald Jay Sussman"
    }
  },
  "meta": {
    "cached": false,
    "ttl": 6,
    "source": "rumad-quotes"
  }
}
```

### 4. Open Playground

Navigate to: [http://localhost:3002](http://localhost:3002)

You should see the RUMAD API Playground interface.

## Next Steps

### Explore the Playground

1. **Request Builder** (`/`) - Test different endpoints interactively
2. **Headers Guide** (`/headers`) - Learn about API headers
3. **API Docs** (`/docs`) - View complete OpenAPI documentation

### Try Different Endpoints

#### Get Weather Data

```bash
curl -H 'x-api-key: demo_key_12345' \
  'http://localhost:3001/v1/weather?city=New%20York'
```

#### Get Crypto Prices

```bash
curl -H 'x-api-key: demo_key_12345' \
  'http://localhost:3001/v1/crypto/prices?tickers=BTC,ETH,SOL'
```

#### Get News

```bash
curl -H 'x-api-key: demo_key_12345' \
  'http://localhost:3001/v1/news?topic=technology&limit=5'
```

#### Get Dashboard (Aggregated Data)

```bash
curl -H 'x-api-key: demo_key_12345' \
  http://localhost:3001/v1/dashboard
```

### Use the TypeScript Client

Create a test file `test-client.ts`:

```typescript
import { createClient } from '@rumad/client';

const client = createClient({
  apiKey: 'demo_key_12345',
  baseUrl: 'http://localhost:3001',
  debug: true
});

async function main() {
  // Get a quote
  const { response, metrics } = await client.getQuote();
  console.log('Quote:', response.data?.quote.text);
  console.log('Metrics:', metrics);

  // Check rate limits
  const limits = client.getRateLimitInfo();
  console.log('Rate limits:', limits);

  // Get crypto prices
  const crypto = await client.getCryptoPrices(['BTC', 'ETH']);
  console.log('BTC Price:', crypto.response.data?.prices.BTC);
}

main().catch(console.error);
```

Run it:

```bash
npx tsx test-client.ts
```

## Understanding the Platform

### API Server (Port 3001)

- Built with **Fastify** for high performance
- Uses **Redis** for caching
- Uses **Postgres** for API key storage and analytics
- Implements rate limiting per API key
- Returns educational headers

### Playground (Port 3002)

- Built with **Next.js** and **React**
- Interactive request builder
- Real-time quota visualization
- Integrated Swagger UI
- Educational guides

### Client Library

- TypeScript/JavaScript client
- Automatic retry with exponential backoff
- Built-in rate limit handling
- Request metrics and timing

## Configuration

### API Server Environment Variables

Edit `apps/api/.env`:

```env
PORT=3001
REDIS_URL=redis://localhost:6379
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000,http://localhost:3002

# Optional: Add NewsAPI key for real news data
# Get free key from https://newsapi.org
NEWSAPI_KEY=your_key_here
```

### Playground Environment Variables

Edit `apps/playground/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Demo API Keys

The platform comes with three demo API keys:

| Key | Tier | Scopes |
|-----|------|--------|
| `demo_key_12345` | Free | quotes, weather, crypto |
| `test_key_67890` | Basic | quotes, weather, crypto, news |
| `admin_key_abcde` | Pro | All endpoints |

These are seeded in the database via `infra/migrations/001_init.sql`.

## Common Issues

### Redis Connection Error

**Problem:** API server can't connect to Redis

**Solution:**
```bash
# Check if Redis is running
docker ps | grep redis

# If not running, start infrastructure
cd apis/infra
docker-compose up -d
```

### Port Already in Use

**Problem:** Port 3001 or 3002 is already in use

**Solution:**
```bash
# Change ports in .env files
# API: Change PORT in apps/api/.env
# Playground: Change dev script port in apps/playground/package.json
```

### Dependencies Installation Failed

**Problem:** npm install fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

## Stopping the Platform

### Stop API and Playground

Just press `Ctrl+C` in the terminals running them.

### Stop Infrastructure

```bash
cd apis/infra
docker-compose down
```

### Stop Everything Including Data

```bash
cd apis/infra
docker-compose down -v  # -v removes volumes (deletes data)
```

## Learning Resources

### Educational Features to Explore

1. **Rate Limiting**
   - Make rapid requests to see 429 errors
   - Check `X-RateLimit-*` headers
   - Implement retry logic

2. **Caching**
   - Make the same request twice
   - Observe `X-Cache: HIT` vs `MISS`
   - Check `X-Upstream-Latency-ms`

3. **Partial Failures**
   - Use `/v1/dashboard` endpoint
   - See how it handles upstream failures
   - Check `meta.partial` and `meta.errors`

### Code Examples

Check `apps/playground/components/RequestBuilder.tsx` to see:
- How to make API requests
- How to handle rate limits
- How to parse response headers

## Production Deployment

See the main README for deployment instructions:
- API Server: Fly.io, Railway, or Render
- Playground: Vercel or Netlify
- Redis: Upstash (free tier available)
- Postgres: Any managed Postgres service

## Getting Help

- **Issues**: Open an issue on GitHub
- **Questions**: Check the `/headers` guide in the playground
- **Documentation**: Visit `/docs` for complete API reference

## What's Next?

1. **Add Authentication**: Implement JWT token generation in `/v1/auth/token`
2. **Add More Endpoints**: Wrap additional public APIs
3. **Analytics Dashboard**: Build visualizations using request_logs table
4. **Custom Rate Limits**: Implement per-tier rate limiting
5. **Webhooks**: Add webhook support for async operations

Happy coding! 🚀
