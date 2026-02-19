import Head from 'next/head';
import Link from 'next/link';

export default function Headers() {
  return (
    <>
      <Head>
        <title>Headers Guide - RUMAD API Playground</title>
        <meta name="description" content="Learn about API headers and best practices" />
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
        <nav className="bg-black/20 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center space-x-8">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  RUMAD APIs
                </h1>
                <Link href="/" className="text-gray-300 hover:text-white transition">
                  Playground
                </Link>
                <Link href="/headers" className="text-white font-semibold">
                  Headers Guide
                </Link>
                <Link href="/docs" className="text-gray-300 hover:text-white transition">
                  API Docs
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-4xl font-bold mb-8">Understanding API Headers</h2>

          <div className="space-y-8">
            <section className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <h3 className="text-2xl font-semibold mb-4 flex items-center">
                <span className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">1</span>
                Rate Limiting Headers
              </h3>
              <p className="text-gray-300 mb-4">
                These headers help you understand your API usage quota and avoid hitting rate limits.
              </p>
              <div className="bg-black/30 rounded-lg p-4 space-y-3">
                <div>
                  <code className="text-green-300 font-mono">X-RateLimit-Limit</code>
                  <p className="text-sm text-gray-400 mt-1">
                    Maximum number of requests allowed in the current time window (e.g., 60 requests per minute)
                  </p>
                </div>
                <div>
                  <code className="text-green-300 font-mono">X-RateLimit-Remaining</code>
                  <p className="text-sm text-gray-400 mt-1">
                    Number of requests remaining in the current window. When this reaches 0, you'll get a 429 error.
                  </p>
                </div>
                <div>
                  <code className="text-green-300 font-mono">X-RateLimit-Reset</code>
                  <p className="text-sm text-gray-400 mt-1">
                    Unix timestamp (seconds) when the rate limit resets. Calculate remaining time: (reset - now).
                  </p>
                </div>
              </div>
              <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-yellow-200 text-sm">
                  <strong>Best Practice:</strong> Always check these headers in your client code and implement
                  exponential backoff when approaching limits.
                </p>
              </div>
            </section>

            <section className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <h3 className="text-2xl font-semibold mb-4 flex items-center">
                <span className="bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">2</span>
                Caching Headers
              </h3>
              <p className="text-gray-300 mb-4">
                Learn how our API uses caching to reduce latency and upstream API calls.
              </p>
              <div className="bg-black/30 rounded-lg p-4 space-y-3">
                <div>
                  <code className="text-green-300 font-mono">X-Cache</code>
                  <p className="text-sm text-gray-400 mt-1">
                    Indicates if the response came from cache. Values: <code>HIT</code> (cached) or <code>MISS</code> (fresh from upstream).
                  </p>
                </div>
                <div>
                  <code className="text-green-300 font-mono">X-Upstream-Latency-ms</code>
                  <p className="text-sm text-gray-400 mt-1">
                    Milliseconds taken to fetch from the upstream API. This is 0 for cached responses.
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <p className="font-semibold text-green-300 mb-2">Cache HIT</p>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>✓ Faster response (~10-50ms)</li>
                    <li>✓ No upstream API call</li>
                    <li>✓ Reduced costs</li>
                  </ul>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <p className="font-semibold text-blue-300 mb-2">Cache MISS</p>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Fresh data</li>
                    <li>• Higher latency (100-500ms)</li>
                    <li>• Upstream API called</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <h3 className="text-2xl font-semibold mb-4 flex items-center">
                <span className="bg-pink-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">3</span>
                Request Tracking
              </h3>
              <p className="text-gray-300 mb-4">
                Each request gets a unique ID for debugging and support.
              </p>
              <div className="bg-black/30 rounded-lg p-4">
                <code className="text-green-300 font-mono">X-Request-ID</code>
                <p className="text-sm text-gray-400 mt-1">
                  Unique identifier (UUID) for this request. Include this when reporting issues to support.
                </p>
                <div className="mt-3 bg-gray-800 rounded p-2">
                  <code className="text-xs text-gray-300">X-Request-ID: 7f3e4d5c-9b8a-4f1e-a2d3-6c7b8e9f0a1b</code>
                </div>
              </div>
            </section>

            <section className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <h3 className="text-2xl font-semibold mb-4">Example: Handling 429 Rate Limit</h3>
              <p className="text-gray-300 mb-4">
                When you receive a 429 error, use the headers to implement proper retry logic:
              </p>
              <div className="bg-black/30 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-gray-300">
{`async function fetchWithRetry(url, apiKey, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetch(url, {
      headers: { 'x-api-key': apiKey }
    });
    
    if (response.status !== 429) {
      return response;
    }
    
    // Get retry delay from headers
    const reset = response.headers.get('x-ratelimit-reset');
    const now = Math.floor(Date.now() / 1000);
    const delay = (parseInt(reset) - now) * 1000;
    
    console.log(\`Rate limited. Retrying in \${delay}ms...\`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  throw new Error('Max retries exceeded');
}`}
                </pre>
              </div>
            </section>

            <section className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">💡 Pro Tips</h3>
              <ul className="space-y-2 text-gray-200">
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">→</span>
                  <span>Always include your <code className="text-green-300">x-api-key</code> header in requests</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">→</span>
                  <span>Monitor <code className="text-green-300">X-RateLimit-Remaining</code> to avoid 429 errors</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">→</span>
                  <span>Cache responses on your client when <code className="text-green-300">X-Cache: HIT</code></span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">→</span>
                  <span>Save <code className="text-green-300">X-Request-ID</code> in logs for troubleshooting</span>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
