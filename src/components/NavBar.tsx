'use client';

import Link from 'next/link';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Accelerator', href: '/accelerator' },
  { label: 'Incubator', href: '/incubator' },
  { label: 'E-Board', href: '/eboard' },
];

/** RUMAD pixel-art logo (eyes + mouth). */
function RumadLogo({ size = 38 }: { size?: number }) {
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

/**
 * Fixed top navigation overlay.
 * Translucent blurred backdrop keeps it readable over the 3D canvas.
 */
export function NavBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 bg-[#050505]/70 backdrop-blur-lg border-b border-white/[0.06]">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
        <RumadLogo size={38} />
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
