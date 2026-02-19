import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function Docs() {
  return (
    <>
      <Head>
        <title>API Documentation - RUMAD APIs</title>
        <meta name="description" content="Complete API reference for RUMAD APIs" />
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
                <Link href="/docs" className="text-white font-semibold">
                  API Docs
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="bg-white">
          <SwaggerUI url="/api/openapi.yaml" />
        </div>
      </main>
    </>
  );
}
