'use client';

import { motion } from 'framer-motion';
import type { TeamRole } from '@/data/incubatorCurriculum';

/* ────────────────────────────────────────────────────────────────────────────
 * Team composition cards — shows the 3 roles and their descriptions.
 * ──────────────────────────────────────────────────────────────────────────── */

interface TeamSectionProps {
  roles: TeamRole[];
}

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

export function TeamSection({ roles }: TeamSectionProps) {
  return (
    <section className="px-6 py-24 max-w-5xl mx-auto">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        className="text-3xl md:text-4xl font-display uppercase tracking-wider text-center mb-4"
      >
        Your Team
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="text-center font-body text-white/50 text-sm mb-14 max-w-lg mx-auto"
      >
        Every incubator team has 5 members — a balanced mix of frontend, backend, and mentorship.
      </motion.p>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
        transition={{ staggerChildren: 0.15 }}
        className="grid md:grid-cols-3 gap-6"
      >
        {roles.map((r) => (
          <motion.div
            key={r.role}
            variants={cardVariants}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-white/[0.12] transition-colors"
          >
            {/* Top glow line */}
            <div
              className="absolute inset-x-0 top-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${r.color}40, transparent)` }}
            />

            <div className="flex items-center gap-3 mb-4">
              {/* Colour indicator */}
              <span
                className="h-10 w-10 rounded-lg flex items-center justify-center text-lg font-display"
                style={{ background: r.color + '18', color: r.color }}
              >
                {r.count}×
              </span>
              <h3 className="text-lg font-heading tracking-wide">{r.role}</h3>
            </div>

            <p className="text-sm font-body text-white/50 leading-relaxed">{r.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Team size summary */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6 }}
        className="mt-10 text-center"
      >
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.06] text-xs font-heading tracking-widest uppercase text-white/40">
          <span className="h-1.5 w-1.5 rounded-full bg-[#39e6b0]" />
          5 members per team
        </span>
      </motion.div>
    </section>
  );
}
