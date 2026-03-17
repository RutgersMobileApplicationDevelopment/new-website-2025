'use client';

import { useRef } from 'react';
import { useWheelForward } from '@/hooks/useWheelForward';

/**
 * Fixed bottom footer overlay.
 * Translucent blurred backdrop mirrors the NavBar style.
 */
export function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  useWheelForward(footerRef);

  return (
    <footer
      ref={footerRef}
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-3 bg-[#050505]/70 backdrop-blur-lg border-t border-white/[0.06]"
    >
      <p className="text-xs text-white/60 tracking-wider font-heading">
        &copy; 2026 RUMAD
      </p>

      <a
        href="mailto:rutgersmobile@gmail.com"
        className="text-xs text-[#cc1111]/70 hover:text-[#cc1111] transition-colors font-heading tracking-wider"
      >
        rutgersmobile@gmail.com
      </a>
    </footer>
  );
}
