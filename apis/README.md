# RUMAD APIs

> Educational API Platform for Rutgers Mobile Application Development

A production-ready API aggregation platform that wraps public APIs with teaching-friendly features like caching, rate limiting, and educational headers. Perfect for learning API best practices.

## 🎯 Features

- **Public API Aggregation**: Weather (Open-Meteo), Crypto (CoinGecko), News (NewsAPI), and more
- **Built-in Caching**: Redis-backed caching with `X-Cache` headers
- **Rate Limiting**: Per-user rate limits with educational headers
- **Educational Headers**: 
  - `X-RateLimit-*` for quota management
  - `X-Cache` for cache status (HIT/MISS)
  - `X-Upstream-Latency-ms` for performance monitoring
  - `X-Request-ID` for request tracing
- **Interactive Playground**: Next.js web app for testing endpoints
- **TypeScript Client**: Retry logic with exponential backoff
- **OpenAPI Documentation**: Complete API reference with Swagger UI

## 🏗️ Project Structure

```
apis/
├── apps/
│   ├── api/              # Fastify API server (Node.js)
│   │   ├── src/
│   │   │   └── server.ts
│   │   ├── openapi.yaml
│   │   └── package.json
│   └── playground/       # Next.js interactive playground
│       ├── pages/
│       ├── components/
│       └── package.json
├── infra/
│   ├── docker-compose.yml
│   └── migrations/
└── packages/
    └── rumad-client/     # TypeScript client library
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose (for Redis/Postgres)

### 1. Start Infrastructure

```bash
cd apis/infra
docker-compose up -d
```

This starts:
- Redis on `localhost:6379` (caching)
- Postgres on `localhost:5432` (API keys, usage tracking)

### 2. Start API Server

```bash
cd apps/api
cp .env.example .env
npm install
npm run dev
```

API runs on `http://localhost:3001`

### 3. Start Playground

```bash
cd apps/playground
npm install
npm run dev
```

Playground runs on `http://localhost:3002`

### 4. Test It Out

```bash
# Get a quote (use demo key)
curl -H 'x-api-key: demo_key_12345' http://localhost:3001/v1/quotes

# Get weather
curl -H 'x-api-key: demo_key_12345' http://localhost:3001/v1/weather

# Get crypto prices
curl -H 'x-api-key: demo_key_12345' 'http://localhost:3001/v1/crypto/prices?tickers=BTC,ETH'
```

## 📚 API Endpoints

| Endpoint | Description | Cache TTL |
|----------|-------------|-----------|
| `GET /v1/quotes` | Random programming quotes | 6s |
| `GET /v1/weather` | Current weather (NYC default) | 30s |
| `GET /v1/crypto/prices?tickers=BTC,ETH` | Cryptocurrency prices | 30s |
| `GET /v1/news?topic=tech` | Latest news articles | 5min |
| `GET /v1/dashboard` | Aggregated data | 30s |
| `POST /v1/validate/email` | Email validation | - |
| `POST /v1/auth/token` | Get JWT token | - |

### Demo API Keys

- `demo_key_12345` - Free tier (all basic endpoints)
- `test_key_67890` - Basic tier (includes news)
- `admin_key_abcde` - Pro tier (all endpoints)

## 🛠️ Using the TypeScript Client

```typescript
import { createClient } from '@rumad/client';

const client = createClient({
  apiKey: 'demo_key_12345',
  baseUrl: 'http://localhost:3001', // or production URL
  maxRetries: 3,
  debug: true
});

// Get a quote
const { response, metrics } = await client.getQuote();
console.log(response.data.quote.text);
console.log(`Took ${metrics.duration}ms, cached: ${metrics.cached}`);

// Get crypto prices
const crypto = await client.getCryptoPrices(['BTC', 'ETH', 'SOL']);
console.log(crypto.response.data.prices);

// Check rate limits
const rateLimits = client.getRateLimitInfo();
console.log(`${rateLimits.remaining}/${rateLimits.limit} requests remaining`);
```

## 🎓 Educational Features

### Rate Limiting

- **Per-user limits**: 60 requests/minute (default)
- **Headers returned**:
  - `X-RateLimit-Limit`: Max requests per window
  - `X-RateLimit-Remaining`: Requests left
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

### Caching

All responses include `X-Cache: HIT` or `X-Cache: MISS` to show students:
- How caching reduces latency
- When to expect fresh vs. cached data
- TTL management

### Partial Failures

The `/v1/dashboard` endpoint demonstrates:
- Parallel API calls
- Graceful degradation
- Partial response with `meta.partial: true`

## 🔧 Configuration

### API Server (`apps/api/.env`)

```env
PORT=3001
REDIS_URL=redis://localhost:6379
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000,http://localhost:3002
NEWSAPI_KEY=your_key_here  # Get from newsapi.org (optional)
```

### Playground (`apps/playground/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 📦 Deployment

### API Server

**Fly.io / Railway / Render:**

1. Set environment variables
2. Connect Redis (Upstash recommended)
3. Deploy with Dockerfile:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

### Playground

**Vercel / Netlify:**

```bash
cd apps/playground
vercel deploy
```

## 🧪 Development

### Run Tests

```bash
# API tests
cd apps/api
npm test

# Client tests
cd packages/rumad-client
npm test
```

### Database Migrations

```bash
# Run migrations
docker exec -i rumad-postgres psql -U rumad -d rumad < infra/migrations/001_init.sql
```

## 📊 Monitoring

Check request logs in Postgres:

```sql
SELECT route, COUNT(*), AVG(latency_ms)
FROM request_logs
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY route;
```

## 🐛 Troubleshooting

Having issues? Check out:
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and solutions
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Commands and endpoints cheat sheet
- Run `./validate.sh` to diagnose setup issues

### Quick Diagnostic

```bash
cd apis
./validate.sh
```

## 🤝 Contributing

This is an educational project. Contributions welcome!

1. Fork the repo
2. Create a feature branch
3. Add tests
4. Submit PR

## 📚 Documentation

- **[README.md](README.md)** - This file (overview)
- **[GETTING_STARTED.md](GETTING_STARTED.md)** - Step-by-step setup guide
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Commands cheat sheet
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues & solutions
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Technical details

## 📝 License

MIT - see LICENSE file

## 🔗 Links

- **Live Demo**: https://apis.rumad.club/playground
- **API Docs**: https://apis.rumad.club/docs
- **GitHub**: https://github.com/RutgersMobileApplicationDevelopment/new-website-2025

---

Built with ❤️ by RUMAD Team @ Rutgers University
