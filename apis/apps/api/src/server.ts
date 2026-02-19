import Fastify from 'fastify';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import FastifyRedis from '@fastify/redis';
import cors from '@fastify/cors';
import { z } from 'zod';
import { config } from 'dotenv';
import { randomUUID } from 'crypto';

// Load environment variables
config();

const app: FastifyInstance = Fastify({ 
  logger: true,
  requestIdHeader: 'x-request-id',
  requestIdLogLabel: 'reqId',
  genReqId: () => randomUUID()
});

// Redis for caching and rate limiting
await app.register(FastifyRedis, { 
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  connectTimeout: 5000
});

// Rate limiting
await app.register(rateLimit, {
  max: 60,
  timeWindow: '1 minute',
  redis: app.redis,
  keyGenerator: (req: FastifyRequest) => {
    const apiKey = req.headers['x-api-key'] as string;
    return apiKey || req.ip;
  },
  addHeadersOnExceeding: {
    'x-ratelimit-limit': true,
    'x-ratelimit-remaining': true,
    'x-ratelimit-reset': true
  },
  addHeaders: {
    'x-ratelimit-limit': true,
    'x-ratelimit-remaining': true,
    'x-ratelimit-reset': true
  },
  errorResponseBuilder: (req, context) => {
    return {
      ok: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests',
        retry_after_ms: context.after ? parseInt(context.after) : 60000,
        request_id: req.id
      }
    };
  }
});

// CORS
const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:3002'
];

await app.register(cors, {
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.some(allowed => origin.includes(allowed)) || /rumad\.club$/.test(origin)) {
      cb(null, true);
    } else {
      cb(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true
});

// Add request ID and custom headers to all responses
app.addHook('onSend', async (request, reply) => {
  reply.header('X-Request-ID', request.id);
});

// Simple auth gate: x-api-key must exist
app.addHook('preHandler', async (req: FastifyRequest, reply: FastifyReply) => {
  // Allow health check without auth
  if (req.url === '/health') return;
  
  const key = req.headers['x-api-key'] as string;
  if (!key) {
    return reply.code(401).send({
      ok: false,
      error: {
        code: 'NO_API_KEY',
        message: 'Missing x-api-key header',
        request_id: req.id
      }
    });
  }
});

// Helper functions
function envelope<T>(data: T, meta: any = {}) {
  return { ok: true, data, meta };
}

function errorResponse(code: string, message: string, requestId?: string) {
  return { ok: false, error: { code, message, request_id: requestId } };
}

// Health check
app.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// ============================================================================
// ROUTES
// ============================================================================

// --- QUOTES ---
const QUOTES = [
  { text: "Programs must be written for people to read, and only incidentally for machines to execute.", author: "Harold Abelson & Gerald Jay Sussman" },
  { text: "Simplicity is prerequisite for reliability.", author: "Edsger Dijkstra" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { text: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House" },
  { text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
  { text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", author: "Martin Fowler" },
  { text: "Truth can only be found in one place: the code.", author: "Robert C. Martin" },
  { text: "Debugging is twice as hard as writing the code in the first place.", author: "Brian Kernighan" },
];

app.get('/v1/quotes', async (req: FastifyRequest, reply: FastifyReply) => {
  const apiKey = req.headers['x-api-key'] as string;
  const key = `quotes:last:${apiKey}`;
  const ttl = 6; // 6 seconds between quotes per user
  
  try {
    const cached = await app.redis.get(key);
    const isCached = !!cached;
    
    if (isCached) {
      reply.header('X-Cache', 'HIT');
    } else {
      reply.header('X-Cache', 'MISS');
      await app.redis.set(key, '1', 'EX', ttl);
    }
    
    const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    
    return envelope(
      { quote },
      { cached: isCached, ttl, source: 'rumad-quotes' }
    );
  } catch (error) {
    req.log.error({ error }, 'Quote fetch failed');
    return reply.code(500).send(errorResponse('INTERNAL_ERROR', 'Failed to fetch quote', req.id));
  }
});

// --- WEATHER ---
// Uses Open-Meteo API (no key required, free tier)
app.get('/v1/weather', async (req: FastifyRequest<{
  Querystring: { city?: string; lat?: string; lon?: string }
}>, reply: FastifyReply) => {
  const started = Date.now();
  
  try {
    // Default to NYC coordinates
    let lat = req.query.lat || '40.7128';
    let lon = req.query.lon || '-74.0060';
    const city = req.query.city || 'New York';
    
    const cacheKey = `weather:${lat}:${lon}`;
    const cached = await app.redis.get(cacheKey);
    
    if (cached) {
      reply.header('X-Cache', 'HIT');
      reply.header('X-Upstream-Latency-ms', '0');
      const data = JSON.parse(cached);
      return envelope(
        { ...data, location: city },
        { cached: true, ttl: 30, source: 'open-meteo' }
      );
    }
    
    // Fetch from Open-Meteo
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    const latency = Date.now() - started;
    
    // Cache for 30 seconds
    await app.redis.set(cacheKey, JSON.stringify(data), 'EX', 30);
    
    reply.header('X-Cache', 'MISS');
    reply.header('X-Upstream-Latency-ms', latency.toString());
    
    return envelope(
      { ...data, location: city },
      { cached: false, ttl: 30, source: 'open-meteo', upstream_latency_ms: latency }
    );
  } catch (error) {
    req.log.error({ error }, 'Weather fetch failed');
    return reply.code(500).send(errorResponse('WEATHER_FETCH_ERROR', 'Failed to fetch weather data', req.id));
  }
});

// --- CRYPTO PRICES ---
// Uses CoinGecko free API (no key required for basic usage)
app.get('/v1/crypto/prices', async (req: FastifyRequest<{
  Querystring: { tickers: string }
}>, reply: FastifyReply) => {
  const started = Date.now();
  
  try {
    const querySchema = z.object({
      tickers: z.string().min(1)
    });
    
    const { tickers } = querySchema.parse(req.query);
    const tickerList = tickers.split(',').map(t => t.trim().toUpperCase()).slice(0, 10);
    
    const cacheKey = `crypto:${tickerList.sort().join(',')}`;
    const cached = await app.redis.get(cacheKey);
    
    if (cached) {
      reply.header('X-Cache', 'HIT');
      reply.header('X-Upstream-Latency-ms', '0');
      return envelope(JSON.parse(cached), { cached: true, ttl: 30 });
    }
    
    // Map common symbols to CoinGecko IDs
    const symbolToId: Record<string, string> = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'SOL': 'solana',
      'ADA': 'cardano',
      'DOT': 'polkadot',
      'MATIC': 'matic-network',
      'AVAX': 'avalanche-2',
      'LINK': 'chainlink',
      'UNI': 'uniswap',
      'ATOM': 'cosmos'
    };
    
    const ids = tickerList.map(t => symbolToId[t] || t.toLowerCase()).join(',');
    
    // Fetch from CoinGecko
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.statusText}`);
    }
    
    const rawData = await response.json() as Record<string, { usd: number; usd_24h_change: number }>;
    const latency = Date.now() - started;
    
    // Transform to ticker-based response
    const prices: Record<string, { price: number; change_24h: number }> = {};
    tickerList.forEach(ticker => {
      const id = symbolToId[ticker] || ticker.toLowerCase();
      if (rawData[id]) {
        prices[ticker] = {
          price: rawData[id].usd,
          change_24h: rawData[id].usd_24h_change
        };
      }
    });
    
    const result = { prices, currency: 'USD' };
    
    // Cache for 30 seconds
    await app.redis.set(cacheKey, JSON.stringify(result), 'EX', 30);
    
    reply.header('X-Cache', 'MISS');
    reply.header('X-Upstream-Latency-ms', latency.toString());
    
    return envelope(result, { 
      cached: false, 
      ttl: 30, 
      source: 'coingecko',
      upstream_latency_ms: latency
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send(errorResponse('INVALID_TICKERS', 'Invalid tickers parameter', req.id));
    }
    req.log.error({ error }, 'Crypto prices fetch failed');
    return reply.code(500).send(errorResponse('CRYPTO_FETCH_ERROR', 'Failed to fetch crypto prices', req.id));
  }
});

// --- NEWS ---
// Uses NewsAPI.org (requires free API key - get from newsapi.org)
app.get('/v1/news', async (req: FastifyRequest<{
  Querystring: { topic?: string; limit?: string; page?: string }
}>, reply: FastifyReply) => {
  const started = Date.now();
  
  try {
    const topic = req.query.topic || 'technology';
    const limit = Math.min(parseInt(req.query.limit || '10'), 100);
    const page = parseInt(req.query.page || '1');
    
    const cacheKey = `news:${topic}:${page}:${limit}`;
    const cached = await app.redis.get(cacheKey);
    
    if (cached) {
      reply.header('X-Cache', 'HIT');
      reply.header('X-Upstream-Latency-ms', '0');
      return envelope(JSON.parse(cached), { cached: true, ttl: 300 });
    }
    
    // Using NewsAPI.org - you'll need to set NEWSAPI_KEY in .env
    const apiKey = process.env.NEWSAPI_KEY;
    if (!apiKey) {
      // Return mock data if no API key
      const mockData = {
        articles: [
          {
            title: "Latest Tech News - Configure NewsAPI Key",
            description: "Add NEWSAPI_KEY to your .env file to fetch real news",
            url: "https://newsapi.org",
            source: { name: "Mock News" },
            publishedAt: new Date().toISOString()
          }
        ],
        totalResults: 1
      };
      
      return envelope(mockData, {
        page,
        limit,
        total: 1,
        cached: false,
        source: 'mock'
      });
    }
    
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&pageSize=${limit}&page=${page}&sortBy=publishedAt&apiKey=${apiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.statusText}`);
    }
    
    const data = await response.json() as { articles: any[]; totalResults: number };
    const latency = Date.now() - started;
    
    // Cache for 5 minutes
    await app.redis.set(cacheKey, JSON.stringify(data), 'EX', 300);
    
    reply.header('X-Cache', 'MISS');
    reply.header('X-Upstream-Latency-ms', latency.toString());
    
    return envelope(data, {
      page,
      limit,
      total: data.totalResults,
      cached: false,
      ttl: 300,
      source: 'newsapi',
      upstream_latency_ms: latency
    });
  } catch (error) {
    req.log.error({ error }, 'News fetch failed');
    return reply.code(500).send(errorResponse('NEWS_FETCH_ERROR', 'Failed to fetch news', req.id));
  }
});

// --- DASHBOARD (aggregates multiple endpoints) ---
app.get('/v1/dashboard', async (req: FastifyRequest, reply: FastifyReply) => {
  const started = Date.now();
  
  try {
    const cacheKey = 'dashboard:default';
    const cached = await app.redis.get(cacheKey);
    
    if (cached) {
      reply.header('X-Cache', 'HIT');
      const totalLatency = Date.now() - started;
      reply.header('X-Upstream-Latency-ms', totalLatency.toString());
      return envelope(JSON.parse(cached), { cached: true, ttl: 30 });
    }
    
    // Fetch all data in parallel with error handling
    const [weatherResult, cryptoResult, quoteResult] = await Promise.allSettled([
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.0060&current=temperature_2m,weather_code`).then(r => r.json()),
      fetch(`https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd`).then(r => r.json()),
      Promise.resolve(QUOTES[Math.floor(Math.random() * QUOTES.length)])
    ]);
    
    const errors: string[] = [];
    const data: any = {};
    
    if (weatherResult.status === 'fulfilled') {
      data.weather = weatherResult.value;
    } else {
      errors.push('weather');
    }
    
    if (cryptoResult.status === 'fulfilled') {
      data.crypto = cryptoResult.value;
    } else {
      errors.push('crypto');
    }
    
    if (quoteResult.status === 'fulfilled') {
      data.quote = quoteResult.value;
    } else {
      errors.push('quote');
    }
    
    const totalLatency = Date.now() - started;
    
    // Cache for 30 seconds
    await app.redis.set(cacheKey, JSON.stringify(data), 'EX', 30);
    
    reply.header('X-Cache', 'MISS');
    reply.header('X-Upstream-Latency-ms', totalLatency.toString());
    
    return envelope(data, {
      cached: false,
      ttl: 30,
      partial: errors.length > 0,
      errors: errors.length > 0 ? errors : undefined,
      upstream_latency_ms: totalLatency
    });
  } catch (error) {
    req.log.error({ error }, 'Dashboard fetch failed');
    return reply.code(500).send(errorResponse('DASHBOARD_ERROR', 'Failed to fetch dashboard data', req.id));
  }
});

// --- EMAIL VALIDATION (demo) ---
app.post('/v1/validate/email', async (req: FastifyRequest<{
  Body: { email: string }
}>, reply: FastifyReply) => {
  try {
    const schema = z.object({
      email: z.string().email()
    });
    
    const { email } = schema.parse(req.body);
    
    return envelope({
      valid: true,
      email,
      suggestion: null
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(422).send({
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid email format',
          details: error.errors,
          request_id: req.id
        }
      });
    }
    req.log.error({ error }, 'Email validation failed');
    return reply.code(500).send(errorResponse('INTERNAL_ERROR', 'Validation failed', req.id));
  }
});

// --- AUTH TOKEN (mock for now) ---
app.post('/v1/auth/token', async (req: FastifyRequest<{
  Body: { apiKey: string }
}>, reply: FastifyReply) => {
  try {
    const schema = z.object({
      apiKey: z.string().min(1)
    });
    
    const { apiKey } = schema.parse(req.body);
    
    // Mock JWT generation (in production, use proper JWT library)
    const mockToken = Buffer.from(JSON.stringify({
      apiKey,
      issued: Date.now(),
      expires: Date.now() + 3600000 // 1 hour
    })).toString('base64');
    
    return envelope({
      token: mockToken,
      type: 'Bearer',
      expires_in: 3600
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send(errorResponse('INVALID_REQUEST', 'Missing or invalid apiKey', req.id));
    }
    req.log.error({ error }, 'Token generation failed');
    return reply.code(500).send(errorResponse('INTERNAL_ERROR', 'Token generation failed', req.id));
  }
});

// Error handler
app.setErrorHandler((error, request, reply) => {
  request.log.error({ err: error }, 'Request error');
  
  const statusCode = error.statusCode || 500;
  const code = error.code || 'INTERNAL_ERROR';
  const message = statusCode >= 500 ? 'Internal server error' : error.message;
  
  reply.code(statusCode).send(errorResponse(code, message, request.id));
});

// Start server
const port = Number(process.env.PORT || 3001);
const host = process.env.HOST || '0.0.0.0';

app.listen({ port, host }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`🚀 RUMAD API Server running at ${address}`);
});
