import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import testimonials from '../../data/testimonials.json';
import { SectionHeading } from '../ui/SectionHeading';

export function Testimonials() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % testimonials.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, []);

  const current = testimonials[index];

  function go(delta: number) {
    setIndex((i) => (i + delta + testimonials.length) % testimonials.length);
  }

  return (
    <section className="bg-surface-muted px-5 py-16 dark:bg-surface-dark-muted sm:py-20">
      <div className="mx-auto max-w-4xl">
        <SectionHeading eyebrow="Real Stories" title="Families & Educators Share Their Experience" align="center" />

        <div className="relative mt-10 flex items-center gap-4">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous testimonial"
            className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary-200 text-primary transition-colors hover:bg-primary-50 dark:border-primary-700 dark:text-ink-onDark dark:hover:bg-surface-dark sm:flex"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>

          <div className="relative min-h-[220px] flex-1 overflow-hidden rounded-2xl border border-primary-100 bg-surface p-8 shadow-card dark:border-primary-800 dark:bg-surface-dark sm:p-10">
            <Quote className="h-8 w-8 text-accent-light" aria-hidden="true" />
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={current.id}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="mt-4"
              >
                <p className="text-lg font-medium text-ink dark:text-ink-onDark sm:text-xl">
                  "{current.quote}"
                </p>
                <footer className="mt-5 text-sm text-ink-soft dark:text-ink-onDarkSoft">
                  <span className="font-semibold text-primary dark:text-accent-light">{current.name}</span>
                  {' — '}
                  {current.role}
                </footer>
              </motion.blockquote>
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next testimonial"
            className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary-200 text-primary transition-colors hover:bg-primary-50 dark:border-primary-700 dark:text-ink-onDark dark:hover:bg-surface-dark sm:flex"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
          {testimonials.map((t, i) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show testimonial ${i + 1}`}
              aria-current={i === index}
              className={`h-2 rounded-full transition-all ${
                i === index ? 'w-6 bg-accent' : 'w-2 bg-primary-200 dark:bg-primary-700'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
