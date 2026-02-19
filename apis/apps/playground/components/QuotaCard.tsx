import { useState, useEffect } from 'react';

interface QuotaCardProps {
  headers: Record<string, string>;
}

export default function QuotaCard({ headers }: QuotaCardProps) {
  const [timeUntilReset, setTimeUntilReset] = useState<number>(0);

  const limit = headers['x-ratelimit-limit'];
  const remaining = headers['x-ratelimit-remaining'];
  const reset = headers['x-ratelimit-reset'];
  const cache = headers['x-cache'];
  const latency = headers['x-upstream-latency-ms'];

  useEffect(() => {
    if (reset) {
      const resetTime = parseInt(reset) * 1000; // Convert to milliseconds
      const interval = setInterval(() => {
        const now = Date.now();
        const diff = Math.max(0, resetTime - now);
        setTimeUntilReset(Math.ceil(diff / 1000));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [reset]);

  const usedPercentage = limit && remaining
    ? ((parseInt(limit) - parseInt(remaining)) / parseInt(limit)) * 100
    : 0;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
      <h3 className="text-xl font-semibold mb-4">API Metrics</h3>

      {limit ? (
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-300">Requests Used</span>
              <span className="font-mono">
                {parseInt(limit) - parseInt(remaining || '0')} / {limit}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  usedPercentage > 80
                    ? 'bg-red-500'
                    : usedPercentage > 50
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${usedPercentage}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Remaining</p>
              <p className="text-2xl font-bold font-mono">{remaining}</p>
            </div>
            <div>
              <p className="text-gray-400">Resets in</p>
              <p className="text-2xl font-bold font-mono">{timeUntilReset}s</p>
            </div>
          </div>

          {cache && (
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Cache Status</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                    cache === 'HIT'
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-blue-500/20 text-blue-300'
                  }`}
                >
                  {cache}
                </span>
              </div>
            </div>
          )}

          {latency && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Upstream Latency</span>
              <span className="font-mono text-purple-300">{latency}ms</span>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-400">Make a request to see metrics</p>
          <svg
            className="w-16 h-16 mx-auto mt-4 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-white/10">
        <h4 className="text-sm font-semibold mb-3 text-gray-300">
          Educational Headers
        </h4>
        <ul className="space-y-2 text-xs text-gray-400">
          <li>• <code className="text-blue-300">X-RateLimit-*</code> - Quota info</li>
          <li>• <code className="text-blue-300">X-Cache</code> - Cache status (HIT/MISS)</li>
          <li>• <code className="text-blue-300">X-Upstream-Latency-ms</code> - API latency</li>
          <li>• <code className="text-blue-300">X-Request-ID</code> - Trace requests</li>
        </ul>
      </div>
    </div>
  );
}
