'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useWheelForward } from '@/hooks/useWheelForward';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Accelerator', href: '/accelerator' },
  { label: 'Incubator', href: '/incubator' },
  { label: 'Web Team', href: '/webteam' },
  { label: 'Events', href: '/events' },
  { label: 'E-Board', href: '/eboard' },
];

/**
 * Fixed top navigation overlay.
 * Translucent blurred backdrop keeps it readable over the 3D canvas.
 */
export function NavBar() {
  const navRef = useRef<HTMLElement>(null);
  useWheelForward(navRef);

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-3 bg-[#050505]/70 backdrop-blur-lg border-b border-white/[0.06]"
    >
      {/* Logo */}
      <Link href="/" className="flex items-center">
        <img
          src="/horizontal-logo.png"
          alt="RUMAD"
          className="h-8 w-auto"
          style={{
            filter:
              'brightness(0) invert(28%) sepia(90%) saturate(2000%) hue-rotate(345deg) brightness(90%)',
          }}
        />
      </Link>

      {/* Desktop links */}
      <div className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm text-white/70 hover:text-white transition-colors font-heading tracking-[0.12em] uppercase"
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Contact CTA */}
      <Link
        href="/contact"
        className="px-5 py-2 text-sm font-heading font-semibold text-white bg-[#cc1111] hover:bg-[#ee2222] rounded-full tracking-wider transition-colors"
      >
        Contact
      </Link>
    </nav>
  );
}
