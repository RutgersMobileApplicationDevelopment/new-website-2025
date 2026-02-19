'use client';

import Link from 'next/link';
import { applications } from '@/data/applications';

/**
 * Static mobile fallback — replaces the 3D canvas on small screens.
 * Shows a gradient hero + card grid generated from the applications array.
 */
export function MobileFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0505] via-[#0a0a0a] to-[#0a0a0a] pt-20 px-4">
      {/* Hero */}
      <div className="text-center py-16">
        <h1 className="text-4xl font-bold text-white mb-4">RUMAD</h1>
        <p className="text-gray-400 text-lg max-w-sm mx-auto">
          Rutgers University Mobile Application Development
        </p>
      </div>

      {/* App cards — one per application entry */}
      <div className="grid grid-cols-1 gap-4 max-w-md mx-auto pb-12">
        {applications.map((app) => (
          <Link
            key={app.id}
            href={app.route}
            className="block p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all"
          >
            <div
              className="w-12 h-12 rounded-xl mb-3"
              style={{ backgroundColor: app.accentColor }}
            />
            <h3 className="text-lg font-semibold text-white">{app.title}</h3>
            {app.subtitle && (
              <p className="text-sm text-gray-400 mt-1">{app.subtitle}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
