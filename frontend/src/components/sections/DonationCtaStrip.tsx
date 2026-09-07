import { Coins, Handshake, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SectionHeading } from '../ui/SectionHeading';
import { Card } from '../ui/Card';
import { TiltCard } from '../ui/TiltCard';

const OPTIONS = [
  {
    icon: Coins,
    title: 'Monetary',
    description: 'Fund AI research, custom devices, and free access for more families.',
  },
  {
    icon: Handshake,
    title: 'Time & Effort',
    description: 'Pledge your skills — technical, educational, or organizational — to our mission.',
  },
  {
    icon: Rocket,
    title: 'Project Participation',
    description: 'Join a current innovation as a research partner, tester, or collaborator.',
  },
];

export function DonationCtaStrip() {
  return (
    <section className="px-5 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Get Involved"
          title="Three Ways to Support Our Mission"
          description="Every one of our services is free to families — made possible entirely by people like you."
          align="center"
        />

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {OPTIONS.map(({ icon: Icon, title, description }) => (
            <TiltCard key={title}>
              <Card className="flex h-full flex-col items-start gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-primary dark:bg-surface-dark dark:text-accent-light">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="text-lg font-bold text-primary dark:text-white">{title}</h3>
                <p className="text-sm text-ink-soft dark:text-ink-onDarkSoft">{description}</p>
                <Link
                  to="/donate"
                  className="mt-auto text-sm font-semibold text-accent hover:text-accent-600 dark:text-accent-light"
                >
                  Learn more →
                </Link>
              </Card>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
