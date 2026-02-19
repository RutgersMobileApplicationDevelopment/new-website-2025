'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TimelineEvent } from '@/data/incubatorCurriculum';

/* ────────────────────────────────────────────────────────────────────────────
 * Interactive vertical timeline.
 * Each node is clickable — expands to show full description + location.
 * Tag colours provide visual differentiation.
 * ──────────────────────────────────────────────────────────────────────────── */

interface TimelineSectionProps {
  events: TimelineEvent[];
}

const TAG_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  checkpoint: { bg: 'bg-[#cc1111]/15', text: 'text-[#ff4444]', label: 'Checkpoint' },
  workshop:   { bg: 'bg-[#ee6622]/15', text: 'text-[#ff9944]', label: 'Workshop' },
  showcase:   { bg: 'bg-[#39e6b0]/15', text: 'text-[#39e6b0]', label: 'Showcase' },
  break:      { bg: 'bg-white/5',      text: 'text-white/40',   label: 'Break' },
  social:     { bg: 'bg-[#9966ff]/15', text: 'text-[#bb88ff]', label: 'Social' },
  deadline:   { bg: 'bg-[#ff4444]/15', text: 'text-[#ff6666]', label: 'Deadline' },
};

function TagBadge({ tag }: { tag: string }) {
  const style = TAG_STYLES[tag];
  if (!style) return null;
  return (
    <span className={`inline-block px-2 py-0.5 text-[10px] font-heading tracking-widest uppercase rounded-full ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}

function dotColor(tag?: string) {
  if (!tag) return 'bg-white/20';
  switch (tag) {
    case 'checkpoint': return 'bg-[#cc1111]';
    case 'workshop':   return 'bg-[#ee6622]';
    case 'showcase':   return 'bg-[#39e6b0]';
    case 'deadline':   return 'bg-[#ff4444]';
    case 'social':     return 'bg-[#9966ff]';
    default:           return 'bg-white/20';
  }
}

export function TimelineSection({ events }: TimelineSectionProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <section className="px-6 py-24 max-w-3xl mx-auto">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        className="text-3xl md:text-4xl font-display uppercase tracking-wider text-center mb-4"
      >
        Timeline
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="text-center font-body text-white/50 text-sm mb-14 max-w-md mx-auto"
      >
        Click any event for details. 9 weeks from kickoff to showcase.
      </motion.p>

      <div className="relative">
        {/* Central vertical line */}
        <div className="absolute left-[18px] md:left-[22px] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

        {events.map((event, i) => {
          const open = expandedIndex === i;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              className="relative pl-12 md:pl-14 mb-6 group"
            >
              {/* Dot on the line */}
              <div
                className={`absolute left-[13px] md:left-[17px] top-2 h-3 w-3 rounded-full ring-2 ring-[#0a0a0a] ${dotColor(event.tag)} transition-transform ${
                  open ? 'scale-150' : 'group-hover:scale-125'
                }`}
              />

              {/* Clickable card */}
              <button
                onClick={() => setExpandedIndex(open ? null : i)}
                className="w-full text-left rounded-xl border border-white/[0.04] hover:border-white/[0.08] bg-white/[0.015] hover:bg-white/[0.03] p-4 transition-colors cursor-pointer"
              >
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-xs font-heading text-[#ee6622] tracking-wider">
                    {event.date}
                    {event.week !== null && ` — Week ${event.week}`}
                  </span>
                  {event.tag && <TagBadge tag={event.tag} />}
                </div>
                <h3 className="text-base font-heading tracking-wide text-white/90">
                  {event.title}
                </h3>

                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="mt-2 text-sm font-body text-white/50 leading-relaxed">
                        {event.description}
                      </p>
                      {event.location && (
                        <span className="inline-flex items-center gap-1.5 mt-2 text-xs font-body text-white/30">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {event.location}
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
