'use client';

import { useEffect, useRef } from 'react';
import { phoneScreenBridge } from './phoneScreenBridge';
import { useWheelForward } from '@/hooks/useWheelForward';

/* ────────────────────────────────────────────────────────────────────────────
 * PhoneScreenOverlay
 *
 * Reusable wrapper that positions its children precisely over the 3D
 * phone's Display mesh.
 *
 * The overlay root stays pointer-events: none so wheel events pass
 * through to drei's ScrollControls.  Child links opt-in to
 * pointer-events: auto for clickability; wheel events that bubble up
 * from those links are forwarded to drei's scroll container via
 * useWheelForward (directly adjusting scrollTop).
 * ──────────────────────────────────────────────────────────────────────────── */

interface PhoneScreenOverlayProps {
  children: React.ReactNode;
  className?: string;
  zIndex?: number;
}

export function PhoneScreenOverlay({
  children,
  className = '',
  zIndex = 10,
}: PhoneScreenOverlayProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  // ── Positioning via rAF ────────────────────────────────────────────
  useEffect(() => {
    let raf: number;

    const tick = () => {
      const root = rootRef.current;
      if (!root) {
        raf = requestAnimationFrame(tick);
        return;
      }

      const b = phoneScreenBridge;
      const isVisible = b.visible && b.screenWidth > 10 && b.screenHeight > 10;

      if (isVisible) {
        root.style.opacity = '1';
        root.style.visibility = 'visible';
        root.style.left = `${b.screenLeft}px`;
        root.style.top = `${b.screenTop}px`;
        root.style.width = `${b.screenWidth}px`;
        root.style.height = `${b.screenHeight}px`;
      } else {
        root.style.opacity = '0';
        root.style.visibility = 'hidden';
      }

      root.style.setProperty('--phone-phase1', String(b.phase1));
      root.style.setProperty('--phone-phase2', String(b.phase2));
      root.style.setProperty('--phone-scroll', String(b.contentScroll));
      root.style.setProperty('--phone-w', String(Math.round(b.screenWidth)));
      root.style.setProperty('--phone-h', String(Math.round(b.screenHeight)));

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Forward wheel events to the element underneath (drei ScrollControls)
  useWheelForward(rootRef);

  return (
    <div
      ref={rootRef}
      className={`fixed pointer-events-none overflow-hidden ${className}`}
      style={{ zIndex, opacity: 0, visibility: 'hidden', containerType: 'inline-size' }}
    >
      {children}
    </div>
  );
}
