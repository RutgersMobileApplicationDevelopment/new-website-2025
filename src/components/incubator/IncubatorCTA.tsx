'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

/* ────────────────────────────────────────────────────────────────────────────
 * CTA section — apply button + final encouragement.
 * ──────────────────────────────────────────────────────────────────────────── */

export function IncubatorCTA() {
  return (
    <section className="relative px-6 py-32 text-center overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[400px] rounded-full bg-[#ee6622]/8 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-xl mx-auto"
      >
        <h2 className="text-3xl md:text-4xl font-display uppercase tracking-wider mb-4">
          Ready to Build?
        </h2>
        <p className="font-body text-white/50 text-sm mb-10 max-w-md mx-auto leading-relaxed">
          Applications for the Spring 2026 Incubator are open. Join a team of five and build something
          you&apos;re proud of.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/contact"
            className="px-8 py-3 font-heading font-semibold text-sm tracking-wider uppercase bg-[#ee6622] hover:bg-[#ff8833] text-white rounded-full transition-colors"
          >
            Apply Now
          </Link>
          <Link
            href="/"
            className="px-8 py-3 font-heading text-sm tracking-wider uppercase border border-white/10 hover:border-white/20 text-white/60 hover:text-white rounded-full transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
