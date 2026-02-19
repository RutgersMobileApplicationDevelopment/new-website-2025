import { useState } from 'react';

interface RequestBuilderProps {
  onResponse: (headers: Record<string, string>) => void;
}

export default function RequestBuilder({ onResponse }: RequestBuilderProps) {
  const [method, setMethod] = useState('GET');
  const [endpoint, setEndpoint] = useState('/v1/quotes');
  const [apiKey, setApiKey] = useState('demo_key_12345');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const endpoints = [
    { value: '/v1/quotes', label: 'GET /v1/quotes - Random Quote' },
    { value: '/v1/weather', label: 'GET /v1/weather - Weather Data' },
    { value: '/v1/crypto/prices?tickers=BTC,ETH', label: 'GET /v1/crypto/prices - Crypto Prices' },
    { value: '/v1/news?topic=technology', label: 'GET /v1/news - News Articles' },
    { value: '/v1/dashboard', label: 'GET /v1/dashboard - Dashboard' },
    { value: '/v1/validate/email', label: 'POST /v1/validate/email - Validate Email' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const options: RequestInit = {
        method,
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
      };

      if (method === 'POST' && body) {
        options.body = body;
      }

      const res = await fetch(`${baseUrl}${endpoint}`, options);
      const data = await res.json();

      // Extract headers
      const headers: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        headers[key] = value;
      });

      onResponse(headers);
      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers,
        data,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to make request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
      <h3 className="text-2xl font-semibold mb-6">Request Builder</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Method</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Endpoint</label>
          <select
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {endpoints.map((ep) => (
              <option key={ep.value} value={ep.value}>
                {ep.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">API Key</label>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="demo_key_12345"
            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {method === 'POST' && (
          <div>
            <label className="block text-sm font-medium mb-2">Request Body (JSON)</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder='{"email": "user@example.com"}'
              rows={4}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-[1.02]"
        >
          {loading ? 'Sending...' : 'Send Request'}
        </button>
      </form>

      {error && (
        <div className="mt-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-300 font-medium">Error</p>
          <p className="text-red-200 text-sm mt-1">{error}</p>
        </div>
      )}

      {response && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold">Response</h4>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                response.status >= 200 && response.status < 300
                  ? 'bg-green-500/20 text-green-300'
                  : response.status >= 400
                  ? 'bg-red-500/20 text-red-300'
                  : 'bg-yellow-500/20 text-yellow-300'
              }`}
            >
              {response.status} {response.statusText}
            </span>
          </div>

          <div className="bg-black/30 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-gray-300">
              {JSON.stringify(response.data, null, 2)}
            </pre>
          </div>

          <details className="bg-white/5 rounded-lg">
            <summary className="cursor-pointer p-4 font-medium hover:bg-white/10 transition">
              Response Headers
            </summary>
            <div className="p-4 pt-0 space-y-2">
              {Object.entries(response.headers).map(([key, value]) => (
                <div key={key} className="flex text-sm">
                  <span className="text-blue-300 font-mono w-48">{key}:</span>
                  <span className="text-gray-300 font-mono">{value}</span>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
