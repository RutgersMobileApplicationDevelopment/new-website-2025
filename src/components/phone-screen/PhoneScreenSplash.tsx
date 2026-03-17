'use client';

import { useRef } from 'react';
import { usePhoneScreenFrame } from '@/hooks/usePhoneScreen';

/* ────────────────────────────────────────────────────────────────────────────
 * PhoneScreenSplash
 *
 * Phase 1 — the first thing visible on the phone screen.
 * Logo sits to the LEFT of the title + subtitle (horizontal layout).
 * Social icons in a small row below.
 *
 * Fades in via phase1, then fades up and out via phase1Out.
 * pointer-events: none always — scroll passes through to drei.
 * ──────────────────────────────────────────────────────────────────────────── */

const SOCIALS = [
  { name: 'Instagram', href: 'https://www.instagram.com/rumad.club/', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[55%] h-[55%]"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" /></svg> },
  { name: 'Discord', href: 'https://discord.gg/5ZqhYZam', icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-[55%] h-[55%]"><path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23.077.077 0 0 0-.079-.036 19.736 19.736 0 0 0-4.885 1.491.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.009c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.028zM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419s.956-2.419 2.157-2.419c1.21 0 2.176 1.094 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419s.955-2.419 2.157-2.419c1.21 0 2.176 1.094 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" /></svg> },
  { name: 'GitHub', href: 'https://github.com/RutgersMobileApplicationDevelopment', icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-[55%] h-[55%]"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" /></svg> },
  { name: 'YouTube', href: 'https://www.youtube.com/channel/UCKNn3JTjbk0TjfnizsvcgsQ/', icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-[55%] h-[55%]"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg> },
  { name: 'Email', href: 'mailto:rutgersmobile@gmail.com', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[55%] h-[55%]"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 4 10 8 10-8" /></svg> },
  { name: 'Facebook', href: 'https://www.facebook.com/rumad.club/', icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-[55%] h-[55%]"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg> },
];

export function PhoneScreenSplash() {
  const rootRef = useRef<HTMLDivElement>(null);

  usePhoneScreenFrame((s) => {
    const el = rootRef.current;
    if (!el) return;

    const opacity = s.phase1 * (1 - s.phase1Out);
    const translateY = -s.phase1Out * 40;

    el.style.opacity = String(opacity);
    el.style.transform = `translateY(${translateY}px)`;
    el.style.pointerEvents = 'none';
    el.style.visibility = opacity > 0.01 ? 'visible' : 'hidden';
  });

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 z-10 flex flex-col items-center justify-center px-[5%]"
      style={{ opacity: 0 }}
    >
      {/* Logo left of title — spans full width, centered */}
      <div className="flex items-center gap-[3cqw] w-full justify-center">
        <img
          src="/vertical-logo.png"
          alt="RUMAD"
          className="h-[18cqw] w-auto opacity-60 shrink-0"
          style={{
            filter:
              'brightness(0) invert(28%) sepia(90%) saturate(2000%) hue-rotate(345deg) brightness(80%)',
          }}
        />
        <div>
          <h1 className="font-display text-[clamp(3rem,22cqw,9rem)] text-white tracking-[0.08em] leading-none">
            RUMAD
          </h1>
          <p className="font-body text-[clamp(0.85rem,4cqw,2rem)] text-white/50 tracking-wide mt-[3%] leading-snug">
            Rutgers University Mobile App Development Club
          </p>
        </div>
      </div>

      {/* Social links — pushed further down */}
      <div className="flex items-center gap-[3%] mt-[12%] w-full justify-center">
        {SOCIALS.map((s) => (
          <a
            key={s.name}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.name}
            className="w-[8cqw] h-[8cqw] max-w-[44px] max-h-[44px] rounded-full bg-white/[0.07] flex items-center justify-center text-white/50 hover:text-white hover:bg-[#cc1111]/20 transition-all pointer-events-auto"
          >
            {s.icon}
          </a>
        ))}
      </div>
    </div>
  );
}
