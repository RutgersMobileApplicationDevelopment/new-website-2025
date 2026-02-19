'use client';

import { motion } from 'framer-motion';

/* ────────────────────────────────────────────────────────────────────────────
 * Meeting schedule cards — team meetings + workshops.
 * ──────────────────────────────────────────────────────────────────────────── */

interface MeetingInfo {
  day: string;
  time?: string;
  duration?: string;
  description: string;
}

interface ScheduleSectionProps {
  teamMeetings: MeetingInfo;
  workshops: MeetingInfo;
}

export function ScheduleSection({ teamMeetings, workshops }: ScheduleSectionProps) {
  return (
    <section className="px-6 py-24 max-w-4xl mx-auto">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        className="text-3xl md:text-4xl font-display uppercase tracking-wider text-center mb-14"
      >
        Schedule
      </motion.h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Team meetings */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="h-10 w-10 rounded-lg bg-[#cc1111]/10 flex items-center justify-center text-xl">
              📅
            </span>
            <div>
              <h3 className="font-heading text-lg tracking-wide">Team Meetings</h3>
              <span className="text-xs font-body text-white/40">{teamMeetings.day} · {teamMeetings.duration}</span>
            </div>
          </div>
          <p className="text-sm font-body text-white/50 leading-relaxed">
            {teamMeetings.description}
          </p>
        </motion.div>

        {/* Workshops */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="h-10 w-10 rounded-lg bg-[#ee6622]/10 flex items-center justify-center text-xl">
              🛠
            </span>
            <div>
              <h3 className="font-heading text-lg tracking-wide">Workshops</h3>
              <span className="text-xs font-body text-white/40">{workshops.day} · {workshops.time}</span>
            </div>
          </div>
          <p className="text-sm font-body text-white/50 leading-relaxed">
            {workshops.description}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
