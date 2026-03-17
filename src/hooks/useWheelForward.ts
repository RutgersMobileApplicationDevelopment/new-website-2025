'use client';

import { useEffect, type RefObject } from 'react';

/* ────────────────────────────────────────────────────────────────────────────
 * useWheelForward
 *
 * Attaches a wheel-event forwarder to the given element ref.  When a
 * wheel event fires on (or bubbles up to) the element, the hook finds
 * drei's scroll container and directly adjusts its scrollTop.
 *
 * Why not re-dispatch a WheelEvent?  Synthetic (untrusted) events do
 * NOT trigger native scroll — the browser ignores them.  Directly
 * writing to scrollTop is the only reliable cross-browser approach.
 * ──────────────────────────────────────────────────────────────────────────── */

let cachedScrollContainer: HTMLElement | null = null;

/**
 * Walk up from `start` to find the nearest ancestor (or self) that is
 * a scrollable container (overflow-y: auto|scroll with content overflow).
 */
function findScrollableAncestor(start: Element | null): HTMLElement | null {
  let el = start;
  while (el && el !== document.documentElement) {
    if (el instanceof HTMLElement && el.scrollHeight > el.clientHeight) {
      const cs = window.getComputedStyle(el);
      if (cs.overflowY === 'auto' || cs.overflowY === 'scroll') {
        return el;
      }
    }
    el = el.parentElement;
  }
  return null;
}

function getScrollContainer(probe: HTMLElement): HTMLElement | null {
  if (cachedScrollContainer && document.contains(cachedScrollContainer)) {
    return cachedScrollContainer;
  }

  // Temporarily hide the probe element from hit-testing
  const prev = probe.style.pointerEvents;
  probe.style.pointerEvents = 'none';
  const below = document.elementFromPoint(
    window.innerWidth / 2,
    window.innerHeight / 2,
  );
  probe.style.pointerEvents = prev;

  const container = findScrollableAncestor(below);
  if (container) cachedScrollContainer = container;
  return container;
}

export function useWheelForward(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      const container = getScrollContainer(el);
      if (container) {
        container.scrollTop += e.deltaY;
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: true });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [ref]);
}
