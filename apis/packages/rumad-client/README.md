# RUMAD Client

TypeScript/JavaScript client for RUMAD APIs with automatic retry logic and exponential backoff.

## Installation

```bash
npm install @rumad/client
```

## Quick Start

```typescript
import { createClient } from '@rumad/client';

const client = createClient({
  apiKey: 'your_api_key',
  maxRetries: 3,
  debug: true
});

// Get a quote
const { response, metrics } = await client.getQuote();
console.log(response.data.quote.text);
```

## Features

- ✅ Automatic retry with exponential backoff
- ✅ Jitter to prevent thundering herd
- ✅ Rate limit handling (429 errors)
- ✅ Request metrics and timing
- ✅ TypeScript support
- ✅ Zero dependencies

## API

### `createClient(options)`

Create a new API client.

**Options:**
- `apiKey` (required): Your RUMAD API key
- `baseUrl` (optional): API base URL (default: `https://apis.rumad.club`)
- `maxRetries` (optional): Max retry attempts (default: 3)
- `initialBackoff` (optional): Initial backoff delay in ms (default: 500)
- `maxBackoff` (optional): Maximum backoff delay in ms (default: 10000)
- `debug` (optional): Enable debug logging (default: false)

### Methods

#### `getQuote()`
Get a random programming quote.

```typescript
const { response, metrics } = await client.getQuote();
```

#### `getWeather(params?)`
Get weather data.

```typescript
const weather = await client.getWeather({ city: 'New York' });
// or with coordinates
const weather = await client.getWeather({ lat: '40.7128', lon: '-74.0060' });
```

#### `getCryptoPrices(tickers)`
Get cryptocurrency prices.

```typescript
const crypto = await client.getCryptoPrices(['BTC', 'ETH', 'SOL']);
console.log(crypto.response.data.prices.BTC);
```

#### `getNews(params?)`
Get news articles.

```typescript
const news = await client.getNews({
  topic: 'technology',
  limit: 10,
  page: 1
});
```

#### `getDashboard()`
Get aggregated dashboard data.

```typescript
const dashboard = await client.getDashboard();
```

#### `validateEmail(email)`
Validate an email address.

```typescript
const result = await client.validateEmail('user@example.com');
```

#### `getRateLimitInfo()`
Get last known rate limit info.

```typescript
const limits = client.getRateLimitInfo();
console.log(`${limits.remaining}/${limits.limit} remaining`);
```

## Response Format

All methods return:

```typescript
{
  response: ApiResponse<T>,
  metrics: RequestMetrics
}
```

**ApiResponse:**
```typescript
{
  ok: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    retry_after_ms?: number;
    request_id?: string;
  };
  meta?: {
    cached?: boolean;
    ttl?: number;
    source?: string;
    upstream_latency_ms?: number;
  };
}
```

**RequestMetrics:**
```typescript
{
  startTime: number;
  endTime: number;
  duration: number;
  attempts: number;
  cached: boolean;
  upstreamLatency?: number;
}
```

## Error Handling

```typescript
try {
  const quote = await client.getQuote();
} catch (error) {
  if (error.message.includes('Rate limit')) {
    console.log('Too many requests, try again later');
  }
}
```

## License

MIT
