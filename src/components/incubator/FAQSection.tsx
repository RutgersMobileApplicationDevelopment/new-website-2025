'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FAQ } from '@/data/incubatorCurriculum';

/* ────────────────────────────────────────────────────────────────────────────
 * Accordion-style FAQ section.
 * ──────────────────────────────────────────────────────────────────────────── */

interface FAQSectionProps {
  faqs: FAQ[];
}

export function FAQSection({ faqs }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="px-6 py-24 max-w-3xl mx-auto">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        className="text-3xl md:text-4xl font-display uppercase tracking-wider text-center mb-14"
      >
        FAQ
      </motion.h2>

      <div className="space-y-3">
        {faqs.map((faq, i) => {
          const open = openIndex === i;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <button
                onClick={() => setOpenIndex(open ? null : i)}
                className="w-full text-left rounded-xl border border-white/[0.04] hover:border-white/[0.08] bg-white/[0.015] hover:bg-white/[0.03] p-5 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-base font-heading tracking-wide text-white/90">
                    {faq.question}
                  </h3>
                  <motion.span
                    animate={{ rotate: open ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-xl text-white/30 shrink-0"
                  >
                    +
                  </motion.span>
                </div>

                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="mt-3 text-sm font-body text-white/50 leading-relaxed">
                        {faq.answer}
                      </p>
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
