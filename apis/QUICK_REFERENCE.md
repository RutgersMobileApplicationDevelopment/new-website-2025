# 🚀 RUMAD APIs Quick Reference

## 🏃‍♂️ One-Line Startup

```bash
cd apis && ./setup.sh && cd apps/api && npm run dev
```

Then in another terminal:
```bash
cd apis/apps/playground && npm run dev
```

## 🔑 Demo API Keys

```
demo_key_12345   # Free tier
test_key_67890   # Basic tier
admin_key_abcde  # Pro tier
```

## 📡 Endpoints Cheat Sheet

```bash
# Health check
curl http://localhost:3001/health

# Get quote
curl -H 'x-api-key: demo_key_12345' \
  http://localhost:3001/v1/quotes

# Weather
curl -H 'x-api-key: demo_key_12345' \
  http://localhost:3001/v1/weather

# Crypto prices
curl -H 'x-api-key: demo_key_12345' \
  'http://localhost:3001/v1/crypto/prices?tickers=BTC,ETH'

# News
curl -H 'x-api-key: demo_key_12345' \
  'http://localhost:3001/v1/news?topic=technology'

# Dashboard
curl -H 'x-api-key: demo_key_12345' \
  http://localhost:3001/v1/dashboard

# Email validation
curl -X POST -H 'x-api-key: demo_key_12345' \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com"}' \
  http://localhost:3001/v1/validate/email
```

## 🎯 URLs

- API Server: http://localhost:3001
- Playground: http://localhost:3002
- API Docs: http://localhost:3002/docs
- Headers Guide: http://localhost:3002/headers

## 🐳 Docker Commands

```bash
# Start infrastructure
cd apis/infra && docker-compose up -d

# Stop infrastructure
docker-compose down

# View logs
docker-compose logs -f

# Check status
docker ps
```

## 💻 Development Commands

```bash
# Install all dependencies
cd apis && npm run setup

# Run API server
cd apps/api && npm run dev

# Run Playground
cd apps/playground && npm run dev

# Build everything
cd apis && npm run build

# Run infrastructure
cd apis && npm run infra:up
```

## 📊 Important Headers

**Request:**
```
x-api-key: your_key_here
Content-Type: application/json
```

**Response:**
```
X-Cache: HIT | MISS
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1698364800
X-Upstream-Latency-ms: 150
X-Request-ID: uuid-here
```

## 🔍 Debug Tips

```bash
# Check Redis
docker exec -it rumad-redis redis-cli
> KEYS *
> GET weather:40.7128:-74.0060

# Check Postgres
docker exec -it rumad-postgres psql -U rumad -d rumad
> SELECT * FROM api_keys;
> SELECT * FROM request_logs ORDER BY created_at DESC LIMIT 10;

# View API logs
cd apps/api && npm run dev  # Logs to console

# Check Docker logs
docker logs rumad-redis
docker logs rumad-postgres
```

## 🛠️ Troubleshooting

**Port already in use:**
```bash
# Find process using port 3001
lsof -ti:3001 | xargs kill -9

# Or change port in apps/api/.env
PORT=3002
```

**Redis connection failed:**
```bash
# Restart Redis
cd apis/infra && docker-compose restart redis
```

**Can't connect to API from Playground:**
```bash
# Check CORS settings in apps/api/.env
CORS_ORIGINS=http://localhost:3002

# Check API URL in apps/playground/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 📝 TypeScript Client Example

```typescript
import { createClient } from '@rumad/client';

const client = createClient({
  apiKey: 'demo_key_12345',
  baseUrl: 'http://localhost:3001',
  debug: true
});

// Get quote
const { response, metrics } = await client.getQuote();
console.log(response.data);
console.log(`${metrics.duration}ms, ${metrics.attempts} attempts`);

// Check rate limits
const limits = client.getRateLimitInfo();
console.log(`${limits?.remaining}/${limits?.limit} remaining`);
```

## 📖 File Locations

- **API Server**: `apis/apps/api/src/server.ts`
- **Playground**: `apis/apps/playground/pages/`
- **Client**: `apis/packages/rumad-client/src/index.ts`
- **OpenAPI**: `apis/apps/api/openapi.yaml`
- **DB Schema**: `apis/infra/migrations/001_init.sql`
- **Docker**: `apis/infra/docker-compose.yml`

## 🎓 Learning Resources

1. **Headers Guide**: http://localhost:3002/headers
2. **API Docs**: http://localhost:3002/docs
3. **README**: `apis/README.md`
4. **Getting Started**: `apis/GETTING_STARTED.md`
5. **Implementation**: `apis/IMPLEMENTATION_SUMMARY.md`

## 🚢 Deployment Checklist

- [ ] Set production `REDIS_URL`
- [ ] Set production `DATABASE_URL`
- [ ] Add `NEWSAPI_KEY` for real news data
- [ ] Update `CORS_ORIGINS` for production domain
- [ ] Change `NODE_ENV=production`
- [ ] Set up monitoring/logging
- [ ] Configure SSL/TLS
- [ ] Set up CDN (optional)
- [ ] Configure rate limits per tier
- [ ] Set up backup strategy

## 🎉 That's It!

You now have a fully functional API platform with:
✅ 8 working endpoints
✅ Redis caching
✅ Rate limiting
✅ Interactive playground
✅ TypeScript client
✅ Complete documentation

**Happy coding!** 🚀
