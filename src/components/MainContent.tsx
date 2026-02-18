"use client";

function RumadLogo({ size = 40 }: { size?: number }) {
  const eyeW = size * 0.2;
  const eyeH = size * 0.14;
  const gap = size * 0.08;
  const mouthW = size * 0.38;
  const mouthH = size * 0.06;

  return (
    <div
      className="bg-accent rounded-lg flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <div className="flex flex-col items-center" style={{ gap: gap * 0.5 }}>
        <div className="flex" style={{ gap }}>
          <div
            className="bg-white rounded-[1px]"
            style={{ width: eyeW, height: eyeH }}
          />
          <div
            className="bg-white rounded-[1px]"
            style={{ width: eyeW, height: eyeH }}
          />
        </div>
        <div
          className="bg-white rounded-[1px]"
          style={{ width: mouthW, height: mouthH }}
        />
      </div>
    </div>
  );
}

function Navbar() {
  return (
    <nav className="w-full flex items-center justify-between px-6 md:px-10 py-4 bg-[#050505]/70 backdrop-blur-lg z-50">
      <RumadLogo size={38} />

      <div className="hidden md:flex items-center gap-8">
        {["Home", "Accelerator", "Incubator", "E-Board"].map((item) => (
          <a
            key={item}
            href="#"
            className="text-white/70 hover:text-white transition-colors font-heading text-sm tracking-[0.12em] uppercase"
          >
            {item}
          </a>
        ))}
      </div>

      <a
        href="#"
        className="px-5 py-2 bg-accent text-white rounded-full text-sm font-heading font-semibold tracking-wider hover:bg-accent-light transition-colors"
      >
        Contact
      </a>
    </nav>
  );
}

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
        <a
          href="#"
          className="px-7 py-3 bg-accent text-white rounded-full font-heading font-semibold text-sm tracking-wider hover:bg-accent-light transition-all hover:shadow-[0_0_30px_rgba(200,20,20,0.4)]"
        >
          Programs
        </a>
        <a
          href="#"
          className="px-7 py-3 border border-white/20 text-white/80 rounded-full font-heading font-semibold text-sm tracking-wider hover:border-white/50 hover:text-white transition-all"
        >
          Our Team
        </a>
      </div>

      <div className="absolute bottom-10 flex flex-col items-center gap-2 opacity-40">
        <span className="text-white/60 text-xs font-body tracking-widest uppercase">
          Scroll
        </span>
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
          <h2 className="font-heading text-accent font-bold text-4xl md:text-5xl leading-tight tracking-wide">
            RUMAD
            <br />
            <span className="text-white">info</span>
          </h2>
          <p className="mt-8 text-white/50 font-body text-base leading-[1.85] max-w-md">
            We are Rutgers University&apos;s premier mobile app development
            club. Our mission is to empower students with the skills and
            experience needed to build impactful applications. Through our
            Accelerator and Incubator programs, we provide hands-on project
            experience and mentorship from industry professionals.
          </p>
          <a
            href="#"
            className="inline-block mt-8 px-6 py-3 border border-accent/40 text-accent rounded-full font-heading text-sm tracking-wider hover:bg-accent/10 transition-all"
          >
            Learn More
          </a>
        </div>

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
    {
      name: "Instagram",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="w-4 h-4"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
    {
      name: "Discord",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23.077.077 0 0 0-.079-.036 19.736 19.736 0 0 0-4.885 1.491.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.175 13.175 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z" />
        </svg>
      ),
    },
    {
      name: "GitHub",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
        </svg>
      ),
    },
    {
      name: "YouTube",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
    {
      name: "Email",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="w-4 h-4"
        >
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m2 4 10 8 10-8" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="pt-20 pb-10 px-6 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="flex items-center gap-4">
          <RumadLogo size={48} />
          <div className="text-left">
            <p className="text-white/30 text-[10px] font-body tracking-[0.2em] uppercase">
              We are
            </p>
            <p className="text-accent font-heading font-bold text-sm tracking-wider leading-snug">
              RUTGERS
              <br />
              UNIVERSITY MOBILE
              <br />
              APP DEVELOPMENT
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {socials.map((s) => (
            <a
              key={s.name}
              href="#"
              aria-label={s.name}
              className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center text-white/50 hover:text-white hover:bg-accent/20 transition-all"
            >
              {s.icon}
            </a>
          ))}
        </div>
      </div>

      <p className="text-center text-white/15 text-xs mt-16 font-body tracking-wider">
        &copy; 2025 RUMAD. All rights reserved.
      </p>
    </footer>
  );
}

export default function MainContent() {
  return (
    <div className="absolute w-full" style={{ top: "260vh" }}>
      {/* Gradient transition from 3D scene */}
      <div
        className="absolute w-full h-[60vh] pointer-events-none"
        style={{
          top: "-60vh",
          background:
            "linear-gradient(to bottom, transparent 0%, #050505 100%)",
        }}
      />

      <div className="bg-[#050505] relative">
        <Navbar />
        <HeroSection />
        <InfoSection />
        <Footer />
      </div>
    </div>
  );
}
