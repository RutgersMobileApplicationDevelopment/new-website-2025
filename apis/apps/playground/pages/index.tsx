import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import RequestBuilder from '@/components/RequestBuilder';
import QuotaCard from '@/components/QuotaCard';

export default function Home() {
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});

  return (
    <>
      <Head>
        <title>RUMAD API Playground</title>
        <meta name="description" content="Interactive API playground for RUMAD APIs" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
                <Link href="/headers" className="text-gray-300 hover:text-white transition">
                  Headers Guide
                </Link>
                <Link href="/docs" className="text-gray-300 hover:text-white transition">
                  API Docs
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-4">API Playground</h2>
            <p className="text-gray-300 text-lg">
              Test RUMAD API endpoints interactively. Learn about caching, rate limiting, and API best practices.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RequestBuilder onResponse={setResponseHeaders} />
            </div>
            <div className="space-y-6">
              <QuotaCard headers={responseHeaders} />
              
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
                <div className="space-y-2 text-sm">
                  <a href="#" className="block text-blue-300 hover:text-blue-200">
                    📚 Getting Started Guide
                  </a>
                  <a href="#" className="block text-blue-300 hover:text-blue-200">
                    🔑 Get API Key
                  </a>
                  <a href="#" className="block text-blue-300 hover:text-blue-200">
                    💡 Code Examples
                  </a>
                  <a href="#" className="block text-blue-300 hover:text-blue-200">
                    🐛 Report Issue
                  </a>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                <h3 className="text-xl font-semibold mb-4">Featured Endpoints</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <code className="text-green-300">/v1/quotes</code>
                    <p className="text-gray-400 mt-1">Get programming quotes</p>
                  </div>
                  <div>
                    <code className="text-green-300">/v1/weather</code>
                    <p className="text-gray-400 mt-1">Current weather data</p>
                  </div>
                  <div>
                    <code className="text-green-300">/v1/crypto/prices</code>
                    <p className="text-gray-400 mt-1">Cryptocurrency prices</p>
                  </div>
                  <div>
                    <code className="text-green-300">/v1/dashboard</code>
                    <p className="text-gray-400 mt-1">Aggregated data</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
