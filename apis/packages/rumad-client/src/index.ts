/**
 * RUMAD API Client
 * 
 * A TypeScript client for the RUMAD APIs with built-in:
 * - Automatic retries with exponential backoff
 * - Jitter to prevent thundering herd
 * - Rate limit handling
 * - Request/response typing
 */

export interface ClientOptions {
  /** Base URL of the API. Defaults to production. */
  baseUrl?: string;
  /** Your API key */
  apiKey: string;
  /** Maximum number of retries for failed requests. Default: 3 */
  maxRetries?: number;
  /** Initial backoff delay in ms. Default: 500 */
  initialBackoff?: number;
  /** Maximum backoff delay in ms. Default: 10000 */
  maxBackoff?: number;
  /** Enable request/response logging. Default: false */
  debug?: boolean;
}

export interface ApiResponse<T = any> {
  ok: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    retry_after_ms?: number;
    request_id?: string;
    details?: any;
  };
  meta?: {
    cached?: boolean;
    ttl?: number;
    source?: string;
    upstream_latency_ms?: number;
    partial?: boolean;
    errors?: string[];
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

export interface RequestMetrics {
  startTime: number;
  endTime: number;
  duration: number;
  attempts: number;
  cached: boolean;
  upstreamLatency?: number;
}

/**
 * Sleep utility with jitter
 */
const sleep = (ms: number, jitter = true): Promise<void> => {
  const delay = jitter ? ms + Math.random() * 200 : ms;
  return new Promise((resolve) => setTimeout(resolve, delay));
};

/**
 * Calculate exponential backoff delay
 */
const calculateBackoff = (
  attempt: number,
  initial: number,
  max: number
): number => {
  const delay = Math.min(initial * Math.pow(2, attempt), max);
  return delay;
};

/**
 * Main RUMAD API Client
 */
export class RumadClient {
  private baseUrl: string;
  private apiKey: string;
  private maxRetries: number;
  private initialBackoff: number;
  private maxBackoff: number;
  private debug: boolean;
  private lastRateLimitInfo?: RateLimitInfo;

  constructor(options: ClientOptions) {
    this.baseUrl = options.baseUrl || 'https://apis.rumad.club';
    this.apiKey = options.apiKey;
    this.maxRetries = options.maxRetries ?? 3;
    this.initialBackoff = options.initialBackoff ?? 500;
    this.maxBackoff = options.maxBackoff ?? 10000;
    this.debug = options.debug ?? false;

    if (!this.apiKey) {
      throw new Error('API key is required');
    }
  }

  /**
   * Get the last known rate limit info
   */
  getRateLimitInfo(): RateLimitInfo | undefined {
    return this.lastRateLimitInfo;
  }

  /**
   * Make a request with automatic retry and backoff
   */
  async request<T = any>(
    path: string,
    options: RequestInit = {}
  ): Promise<{ response: ApiResponse<T>; metrics: RequestMetrics }> {
    const url = `${this.baseUrl}${path}`;
    const startTime = Date.now();
    let attempt = 0;
    let lastError: Error | null = null;

    // Merge headers
    const headers = {
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    while (attempt < this.maxRetries) {
      try {
        if (this.debug) {
          console.log(`[RUMAD] Attempt ${attempt + 1}/${this.maxRetries}: ${options.method || 'GET'} ${path}`);
        }

        const response = await fetch(url, {
          ...options,
          headers,
        });

        // Extract rate limit headers
        const rateLimitLimit = response.headers.get('x-ratelimit-limit');
        const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
        const rateLimitReset = response.headers.get('x-ratelimit-reset');

        if (rateLimitLimit && rateLimitRemaining && rateLimitReset) {
          this.lastRateLimitInfo = {
            limit: parseInt(rateLimitLimit),
            remaining: parseInt(rateLimitRemaining),
            reset: parseInt(rateLimitReset),
          };
        }

        // Extract metrics headers
        const cached = response.headers.get('x-cache') === 'HIT';
        const upstreamLatency = response.headers.get('x-upstream-latency-ms');

        const data = await response.json();

        // Handle rate limiting (429)
        if (response.status === 429) {
          attempt++;
          if (attempt >= this.maxRetries) {
            throw new Error(`Rate limit exceeded after ${this.maxRetries} retries`);
          }

          // Use retry-after from response or calculate backoff
          const retryAfter = data.error?.retry_after_ms || 
            calculateBackoff(attempt, this.initialBackoff, this.maxBackoff);

          if (this.debug) {
            console.log(`[RUMAD] Rate limited. Retrying in ${retryAfter}ms...`);
          }

          await sleep(retryAfter);
          continue;
        }

        // Build metrics
        const endTime = Date.now();
        const metrics: RequestMetrics = {
          startTime,
          endTime,
          duration: endTime - startTime,
          attempts: attempt + 1,
          cached,
          upstreamLatency: upstreamLatency ? parseInt(upstreamLatency) : undefined,
        };

        if (this.debug) {
          console.log(`[RUMAD] Response: ${response.status} in ${metrics.duration}ms (cached: ${cached})`);
        }

        return { response: data, metrics };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        attempt++;

        if (attempt >= this.maxRetries) {
          break;
        }

        const backoff = calculateBackoff(attempt, this.initialBackoff, this.maxBackoff);
        
        if (this.debug) {
          console.log(`[RUMAD] Error: ${lastError.message}. Retrying in ${backoff}ms...`);
        }

        await sleep(backoff);
      }
    }

    // All retries failed
    throw lastError || new Error('Request failed after all retries');
  }

  /**
   * GET request helper
   */
  async get<T = any>(path: string): Promise<{ response: ApiResponse<T>; metrics: RequestMetrics }> {
    return this.request<T>(path, { method: 'GET' });
  }

  /**
   * POST request helper
   */
  async post<T = any>(
    path: string,
    body: any
  ): Promise<{ response: ApiResponse<T>; metrics: RequestMetrics }> {
    return this.request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // ============================================================================
  // Convenience methods for specific endpoints
  // ============================================================================

  /**
   * Get a random programming quote
   */
  async getQuote() {
    return this.get<{ quote: { text: string; author: string } }>('/v1/quotes');
  }

  /**
   * Get weather data
   */
  async getWeather(params?: { city?: string; lat?: string; lon?: string }) {
    const query = new URLSearchParams(params as any).toString();
    const path = query ? `/v1/weather?${query}` : '/v1/weather';
    return this.get(path);
  }

  /**
   * Get cryptocurrency prices
   */
  async getCryptoPrices(tickers: string[]) {
    const tickersParam = tickers.join(',');
    return this.get<{
      prices: Record<string, { price: number; change_24h: number }>;
      currency: string;
    }>(`/v1/crypto/prices?tickers=${tickersParam}`);
  }

  /**
   * Get news articles
   */
  async getNews(params: { topic?: string; limit?: number; page?: number } = {}) {
    const query = new URLSearchParams({
      topic: params.topic || 'technology',
      limit: String(params.limit || 10),
      page: String(params.page || 1),
    }).toString();
    return this.get(`/v1/news?${query}`);
  }

  /**
   * Get dashboard (aggregated data)
   */
  async getDashboard() {
    return this.get<{
      weather: any;
      crypto: any;
      quote: { text: string; author: string };
    }>('/v1/dashboard');
  }

  /**
   * Validate an email address
   */
  async validateEmail(email: string) {
    return this.post<{
      valid: boolean;
      email: string;
      suggestion: string | null;
    }>('/v1/validate/email', { email });
  }

  /**
   * Exchange API key for JWT token
   */
  async getAuthToken(apiKey: string) {
    return this.post<{
      token: string;
      type: string;
      expires_in: number;
    }>('/v1/auth/token', { apiKey });
  }
}

/**
 * Create a new RUMAD API client
 */
export function createClient(options: ClientOptions): RumadClient {
  return new RumadClient(options);
}

/**
 * Simple fetch wrapper without retry logic (for basic usage)
 */
export async function rumadFetch(
  path: string,
  options: ClientOptions & { method?: string; body?: any } = { apiKey: '' }
): Promise<Response> {
  const base = options.baseUrl ?? 'https://apis.rumad.club';
  let attempt = 0;
  const max = options.maxRetries ?? 3;

  while (true) {
    const response = await fetch(base + path, {
      method: options.method || 'GET',
      headers: {
        'x-api-key': options.apiKey,
        'Content-Type': 'application/json',
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (response.status !== 429 || attempt >= max) {
      return response;
    }

    const retryAfter =
      Number(response.headers.get('retry-after')) * 1000 || 500 * Math.pow(2, attempt);
    await sleep(retryAfter);
    attempt++;
  }
}

// Export types
export default RumadClient;
