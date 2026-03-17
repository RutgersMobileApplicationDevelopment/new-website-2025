'use client';

import { useEffect, useRef } from 'react';
import { phoneScreenBridge } from '@/components/phone-screen/phoneScreenBridge';

/* ────────────────────────────────────────────────────────────────────────────
 * usePhoneScreenFrame
 *
 * Subscribe to phone-screen state every animation frame WITHOUT triggering
 * React re-renders.  The callback receives the mutable bridge object that
 * SketchfabPhone writes to each frame (position, phases, dimensions).
 *
 * Typical usage inside a phone-screen content component:
 *
 *   const titleRef = useRef<HTMLDivElement>(null);
 *   usePhoneScreenFrame((s) => {
 *     if (titleRef.current) titleRef.current.style.opacity = String(s.phase1);
 *   });
 * ──────────────────────────────────────────────────────────────────────────── */

export type PhoneScreenState = typeof phoneScreenBridge;

/**
 * Calls `callback` every animation frame with the current phone-screen
 * bridge state.  Runs entirely outside React's render cycle.
 */
export function usePhoneScreenFrame(
  callback: (state: PhoneScreenState) => void,
) {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    let raf: number;
    const tick = () => {
      cbRef.current(phoneScreenBridge);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
}
