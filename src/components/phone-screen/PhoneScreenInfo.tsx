'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { usePhoneScreenFrame } from '@/hooks/usePhoneScreen';

/* ────────────────────────────────────────────────────────────────────────────
 * PhoneScreenInfo
 *
 * Phase 2 — the scrollable info page that appears after the splash
 * fades up and out.  Content is taller than the phone screen; the
 * background drei scroll drives a translateY via contentScroll.
 * ──────────────────────────────────────────────────────────────────────────── */

/* 2D icons for program cards */
const AcceleratorIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinejoin="round" strokeLinecap="round" />
  </svg>
);

const IncubatorIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
    <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" strokeLinejoin="round" />
    <path d="M9 21h6M10 17v4M14 17v4" strokeLinecap="round" />
  </svg>
);

const EventsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
    <circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

export function PhoneScreenInfo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  usePhoneScreenFrame((s) => {
    const root = rootRef.current;
    const content = contentRef.current;
    if (!root) return;

    root.style.opacity = String(s.phase2);
    root.style.visibility = s.phase2 > 0.01 ? 'visible' : 'hidden';

    if (content && s.screenHeight > 0) {
      const overflow = Math.max(0, content.scrollHeight - s.screenHeight);
      const ty = -s.contentScroll * overflow;
      content.style.transform = `translateY(${ty}px)`;
    }
  });

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 z-0"
      style={{ opacity: 0, visibility: 'hidden' }}
    >
      <div ref={contentRef} className="w-full px-[6%] pt-[5%] pb-[6%]">
        <div className="grid grid-cols-2 gap-x-[5%] gap-y-[4%]">
          {/* ── Left column: info ──────────────────────────────────── */}
          <div>
            <h2 className="font-heading text-[clamp(1rem,3.2cqw,1.8rem)] text-[#cc1111] font-bold leading-tight tracking-wide">
              RUMAD <span className="text-white">info</span>
            </h2>
            <p className="font-body text-[clamp(0.6rem,1.8cqw,0.95rem)] text-white/50 leading-[1.7] mt-[4%]">
              We are Rutgers University&apos;s premier mobile app development
              club. Through our Accelerator and Incubator programs, we provide
              hands-on project experience and mentorship from industry
              professionals.
            </p>
            <p className="font-body text-[clamp(0.55rem,1.6cqw,0.85rem)] text-white/40 leading-[1.7] mt-[3%]">
              Whether you&apos;re a beginner or an experienced developer, RUMAD
              gives you the tools, teammates, and guidance to build real apps
              that ship to the App Store and Google Play.
            </p>

            {/* Quick stats */}
            <div className="flex gap-[8%] mt-[6%]">
              <div>
                <p className="font-heading text-[clamp(0.9rem,2.6cqw,1.4rem)] text-white font-bold">50+</p>
                <p className="font-body text-[clamp(0.4rem,1.1cqw,0.6rem)] text-white/35 uppercase tracking-wider">Members</p>
              </div>
              <div>
                <p className="font-heading text-[clamp(0.9rem,2.6cqw,1.4rem)] text-white font-bold">10+</p>
                <p className="font-body text-[clamp(0.4rem,1.1cqw,0.6rem)] text-white/35 uppercase tracking-wider">Apps built</p>
              </div>
              <div>
                <p className="font-heading text-[clamp(0.9rem,2.6cqw,1.4rem)] text-white font-bold">4+</p>
                <p className="font-body text-[clamp(0.4rem,1.1cqw,0.6rem)] text-white/35 uppercase tracking-wider">Years</p>
              </div>
            </div>

            <Link
              href="/accelerator"
              className="inline-block mt-[6%] px-[8%] py-[3%] border border-[#cc1111]/40 text-[#cc1111] rounded-full font-heading text-[clamp(0.5rem,1.4cqw,0.75rem)] tracking-wider hover:bg-[#cc1111]/10 transition-all pointer-events-auto"
            >
              Learn More
            </Link>
          </div>

          {/* ── Right column: program cards with icons ─────────────── */}
          <div className="flex flex-col gap-[6%]">
            <Link
              href="/accelerator"
              className="flex items-center gap-[6%] rounded-lg border border-[#cc1111]/30 bg-[#cc1111]/10 px-[6%] py-[5%] pointer-events-auto hover:bg-[#cc1111]/20 transition-all"
            >
              <div className="w-[14%] min-w-[22px] text-[#cc1111]">
                <AcceleratorIcon />
              </div>
              <div>
                <p className="font-heading text-[clamp(0.7rem,2.2cqw,1.1rem)] text-white">
                  Accelerator
                </p>
                <p className="font-body text-[clamp(0.5rem,1.4cqw,0.75rem)] text-white/55 mt-[2%]">
                  Build &amp; ship your own app
                </p>
              </div>
            </Link>
            <Link
              href="/incubator"
              className="flex items-center gap-[6%] rounded-lg border border-[#ee6622]/30 bg-[#ee6622]/10 px-[6%] py-[5%] pointer-events-auto hover:bg-[#ee6622]/20 transition-all"
            >
              <div className="w-[14%] min-w-[22px] text-[#ee6622]">
                <IncubatorIcon />
              </div>
              <div>
                <p className="font-heading text-[clamp(0.7rem,2.2cqw,1.1rem)] text-white">
                  Incubator
                </p>
                <p className="font-body text-[clamp(0.5rem,1.4cqw,0.75rem)] text-white/55 mt-[2%]">
                  Level up your dev skills
                </p>
              </div>
            </Link>
            <Link
              href="/events"
              className="flex items-center gap-[6%] rounded-lg border border-[#39e6b0]/30 bg-[#39e6b0]/10 px-[6%] py-[5%] pointer-events-auto hover:bg-[#39e6b0]/20 transition-all"
            >
              <div className="w-[14%] min-w-[22px] text-[#39e6b0]">
                <EventsIcon />
              </div>
              <div>
                <p className="font-heading text-[clamp(0.7rem,2.2cqw,1.1rem)] text-white">
                  Events
                </p>
                <p className="font-body text-[clamp(0.5rem,1.4cqw,0.75rem)] text-white/55 mt-[2%]">
                  Workshops &amp; meetups
                </p>
              </div>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
