'use client';

import { useState, useEffect } from 'react';

/**
 * Animated "Scroll to explore" hint.
 * Hides after 5 s or on the first scroll / touch interaction.
 */
export function ScrollHint() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const hide = () => setVisible(false);
    window.addEventListener('wheel', hide, { once: true, passive: true });
    window.addEventListener('touchstart', hide, { once: true, passive: true });
    const timer = setTimeout(hide, 5000);
    return () => {
      window.removeEventListener('wheel', hide);
      window.removeEventListener('touchstart', hide);
      clearTimeout(timer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 animate-pulse pointer-events-none">
      <span className="text-xs text-gray-400 uppercase tracking-widest">
        Scroll to explore
      </span>
      <svg
        className="w-5 h-5 text-gray-400 animate-bounce"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}
