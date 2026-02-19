'use client';

import Link from 'next/link';

/* ────────────────────────────────────────────────────────────────────────────
 * MainContent — HTML layer rendered inside drei's <Scroll html>.
 *
 * Positioned at ~260vh so it appears after the 3D phone/warp section,
 * preceded by a gradient fade overlay. Contains: Navbar, Hero, Info, Footer.
 * Adapted from Sebby's branch with RUMAD branding from rumad.club.
 * ──────────────────────────────────────────────────────────────────────────── */

function RumadLogo({ size = 40 }: { size?: number }) {
  const eyeW = size * 0.2;
  const eyeH = size * 0.14;
  const gap = size * 0.08;
  const mouthW = size * 0.38;
  const mouthH = size * 0.06;

  return (
    <div
      className="bg-[#cc1111] rounded-lg flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <div className="flex flex-col items-center" style={{ gap: gap * 0.5 }}>
        <div className="flex" style={{ gap }}>
          <div className="bg-white rounded-[1px]" style={{ width: eyeW, height: eyeH }} />
          <div className="bg-white rounded-[1px]" style={{ width: eyeW, height: eyeH }} />
        </div>
        <div className="bg-white rounded-[1px]" style={{ width: mouthW, height: mouthH }} />
      </div>
    </div>
  );
}

/* ContentNav removed — NavBar in page.tsx is the single fixed header */

function HeroSection() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative">
      <h1 className="font-display text-[clamp(3.5rem,12vw,9rem)] text-white tracking-[0.08em] leading-none">
        RUMAD
      </h1>
      <p className="mt-5 text-white/50 text-lg md:text-xl font-body max-w-lg tracking-wide">
        Rutgers University Mobile App Development Club
      </p>

      <div className="mt-14 flex gap-5">
        <Link
          href="/accelerator"
          className="px-7 py-3 bg-[#cc1111] text-white rounded-full font-heading font-semibold text-sm tracking-wider hover:bg-[#ee2222] transition-all hover:shadow-[0_0_30px_rgba(200,20,20,0.4)]"
        >
          Programs
        </Link>
        <Link
          href="/team"
          className="px-7 py-3 border border-white/20 text-white/80 rounded-full font-heading font-semibold text-sm tracking-wider hover:border-white/50 hover:text-white transition-all"
        >
          Our Team
        </Link>
      </div>

      <div className="absolute bottom-10 flex flex-col items-center gap-2 opacity-40">
        <span className="text-white/60 text-xs font-body tracking-widest uppercase">Scroll</span>
        <div className="w-[1px] h-8 bg-gradient-to-b from-white/40 to-transparent" />
      </div>
    </section>
  );
}

function InfoSection() {
  return (
    <section className="min-h-[80vh] flex items-center px-6 md:px-12 lg:px-20 py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-center max-w-6xl mx-auto w-full">
        <div>
          <h2 className="font-heading text-[#cc1111] font-bold text-4xl md:text-5xl leading-tight tracking-wide">
            RUMAD
            <br />
            <span className="text-white">info</span>
          </h2>
          <p className="mt-8 text-white/50 font-body text-base leading-[1.85] max-w-md">
            We are Rutgers University&apos;s premier mobile app development club.
            Our mission is to empower students with the skills and experience
            needed to build impactful applications. Through our Accelerator and
            Incubator programs, we provide hands-on project experience and
            mentorship from industry professionals.
          </p>
          <Link
            href="/accelerator"
            className="inline-block mt-8 px-6 py-3 border border-[#cc1111]/40 text-[#cc1111] rounded-full font-heading text-sm tracking-wider hover:bg-[#cc1111]/10 transition-all"
          >
            Learn More
          </Link>
        </div>

        {/* CSS phone mockup for this section */}
        <div className="flex justify-center">
          <div className="phone-mockup">
            <div className="phone-screen">
              <div className="flex flex-col items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-6 h-4 bg-white rounded-[2px]" />
                  <div className="w-6 h-4 bg-white rounded-[2px]" />
                </div>
                <div className="w-10 h-1.5 bg-white rounded-[2px]" />
              </div>
              <span className="text-white font-display text-base tracking-[0.15em] mt-3">
                RUMAD
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const socials = [
    { name: 'Facebook', href: 'https://www.facebook.com/rumad.club/' },
    { name: 'Instagram', href: 'https://www.instagram.com/rumad.club/' },
    { name: 'Discord', href: 'https://discord.gg/5ZqhYZam' },
    { name: 'GitHub', href: 'https://github.com/RutgersMobileApplicationDevelopment' },
    { name: 'YouTube', href: 'https://www.youtube.com/channel/UCKNn3JTjbk0TjfnizsvcgsQ/' },
    { name: 'Email', href: 'mailto:rutgersmobile@gmail.com' },
  ];

  return (
    <footer className="pt-20 pb-10 px-6 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="flex items-center gap-4">
          <RumadLogo size={48} />
          <div className="text-left">
            <p className="text-white/30 text-[10px] tracking-[0.2em] uppercase">We are</p>
            <p className="text-[#cc1111] font-bold text-sm tracking-wider leading-snug">
              RUTGERS<br />UNIVERSITY MOBILE<br />APP DEVELOPMENT
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {socials.map((s) => (
            <a
              key={s.name}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.name}
              className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center text-white/50 hover:text-white hover:bg-[#cc1111]/20 transition-all text-xs font-bold"
            >
              {s.name.charAt(0)}
            </a>
          ))}
        </div>
      </div>

      <p className="text-center text-white/15 text-xs mt-16 tracking-wider">
        &copy; 2025 RUMAD. All rights reserved.
      </p>
    </footer>
  );
}

export function MainContent() {
  return (
    <div className="absolute w-full" style={{ top: '260vh' }}>
      {/* Gradient transition from 3D scene */}
      <div
        className="absolute w-full h-[60vh] pointer-events-none"
        style={{
          top: '-60vh',
          background: 'linear-gradient(to bottom, transparent 0%, #050505 100%)',
        }}
      />

      <div className="bg-[#050505] relative">
        <HeroSection />
        <InfoSection />
        <Footer />
      </div>
    </div>
  );
}
