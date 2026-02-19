'use client';

import { motion } from 'framer-motion';

/* ────────────────────────────────────────────────────────────────────────────
 * Hero section for the Incubator page.
 * Full-viewport height, bold title, animated tagline and highlights.
 * ──────────────────────────────────────────────────────────────────────────── */

interface IncubatorHeroProps {
  title: string;
  tagline: string;
  description: string;
  highlights: string[];
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

export function IncubatorHero({ title, tagline, description, highlights }: IncubatorHeroProps) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-24 text-center overflow-hidden">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#ee6622]/10 blur-[120px]" />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-3xl"
      >
        {/* Badge */}
        <motion.span
          variants={fadeUp}
          className="inline-block px-4 py-1.5 mb-6 text-xs font-heading tracking-[0.2em] uppercase text-[#ee6622] border border-[#ee6622]/30 rounded-full"
        >
          Spring 2026
        </motion.span>

        <motion.h1
          variants={fadeUp}
          className="text-5xl md:text-7xl font-display uppercase tracking-wider mb-4 bg-gradient-to-r from-[#ee6622] via-[#ff9944] to-[#ee6622] bg-clip-text text-transparent"
        >
          {title}
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="text-xl md:text-2xl font-heading text-white/80 mb-6"
        >
          {tagline}
        </motion.p>

        <motion.p
          variants={fadeUp}
          className="text-base font-body text-white/50 leading-relaxed max-w-2xl mx-auto mb-10"
        >
          {description}
        </motion.p>

        {/* Highlights */}
        <motion.ul variants={container} className="grid gap-3 text-left max-w-xl mx-auto">
          {highlights.map((h) => (
            <motion.li
              key={h}
              variants={fadeUp}
              className="flex items-start gap-3 text-sm font-body text-white/70"
            >
              <span className="mt-1 h-2 w-2 rounded-full bg-[#ee6622] shrink-0" />
              {h}
            </motion.li>
          ))}
        </motion.ul>

        {/* Scroll hint */}
        <motion.div
          variants={fadeUp}
          className="mt-16 flex flex-col items-center gap-2 text-white/30"
        >
          <span className="text-xs font-heading tracking-widest uppercase">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1"
          >
            <div className="w-1 h-2 rounded-full bg-white/40" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
