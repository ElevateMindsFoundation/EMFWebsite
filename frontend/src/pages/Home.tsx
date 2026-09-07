import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeartHandshake, ShieldCheck, Sparkles, Target } from 'lucide-react';
import { SEO } from '../components/SEO';
import { Button } from '../components/ui/Button';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Testimonials } from '../components/sections/Testimonials';
import { NewsPreview } from '../components/sections/NewsPreview';
import { DonationCtaStrip } from '../components/sections/DonationCtaStrip';
import { HeroSceneFallback } from '../components/three/HeroSceneFallback';

// The R3F scene (three.js + fiber + drei) is a meaningfully sized chunk, so
// it's lazy-loaded and never blocks the rest of the hero -- text/CTAs below
// paint immediately regardless of when (or whether) this chunk arrives.
const HeroScene = lazy(() => import('../components/three/HeroScene'));

export function Home() {
  return (
    <div>
      <SEO
        title="Free AI Tools for Every Child"
        description="Elevate Minds Foundation designs and delivers free AI-powered tools and programs for children with physical, developmental, and neurodiverse conditions."
      />
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-gradient px-5 py-24 text-white sm:py-32">
        <Suspense fallback={<HeroSceneFallback />}>
          <HeroScene />
        </Suspense>

        <div className="relative mx-auto flex max-w-4xl flex-col items-start gap-6">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-accent-light ring-1 ring-inset ring-white/20"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            100% free, always
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl"
          >
            Empowering Young Minds with Free AI Solutions for a More Inclusive Tomorrow
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-2xl text-lg text-primary-100"
          >
            Elevate Minds Foundation designs and delivers AI-powered, cost-free solutions to support
            children with physical, developmental, and neurodiverse conditions — including deaf,
            non-verbal, autistic, ADHD, and related conditions.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-wrap gap-3 pt-2"
          >
            <Button to="/donate" variant="accent" size="lg">
              Donate Now
            </Button>
            <Button to="/about" variant="outline" size="lg" className="border-white/40 text-white hover:bg-white/10">
              Learn More
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="px-5 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading eyebrow="Why We Exist" title="Our Mission & Vision" align="center" />

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-primary-100 bg-surface p-8 shadow-card dark:border-primary-800 dark:bg-surface-dark-muted">
              <Target className="h-8 w-8 text-accent" aria-hidden="true" />
              <h3 className="mt-4 text-xl font-bold text-primary dark:text-white">Mission</h3>
              <p className="mt-2 text-ink-soft dark:text-ink-onDarkSoft">
                To develop and implement AI innovations that empower children with physical,
                cognitive, and sensory disabilities, enabling them to reach their full potential.
              </p>
            </div>
            <div className="rounded-2xl border border-primary-100 bg-surface p-8 shadow-card dark:border-primary-800 dark:bg-surface-dark-muted">
              <ShieldCheck className="h-8 w-8 text-accent" aria-hidden="true" />
              <h3 className="mt-4 text-xl font-bold text-primary dark:text-white">Vision</h3>
              <p className="mt-2 text-ink-soft dark:text-ink-onDarkSoft">
                A future where technology bridges all gaps, and no child's development is limited by
                disability.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-accent-200 bg-accent-50 p-8 dark:border-accent-800 dark:bg-surface-dark-muted sm:flex-row sm:items-center">
            <HeartHandshake className="h-9 w-9 shrink-0 text-accent" aria-hidden="true" />
            <div>
              <h3 className="text-lg font-bold text-primary dark:text-white">Why It's All Free</h3>
              <p className="mt-1 text-sm text-ink-soft dark:text-ink-onDarkSoft">
                Our services are 100% free, funded entirely by donors, volunteers, research
                partners, and grants. Our mission is to eliminate financial barriers so every family
                who needs support can access it.
              </p>
            </div>
            <Link
              to="/about"
              className="shrink-0 text-sm font-semibold text-accent hover:text-accent-600 dark:text-accent-light sm:ml-auto"
            >
              Read more →
            </Link>
          </div>
        </div>
      </section>

      <Testimonials />
      <NewsPreview />
      <DonationCtaStrip />
    </div>
  );
}
