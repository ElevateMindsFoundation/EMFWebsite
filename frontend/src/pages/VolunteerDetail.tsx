import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Users2 } from 'lucide-react';
import rawOpportunities from '../data/volunteerOpportunities.json';
import type { VolunteerOpportunity } from '../types';
import { SEO } from '../components/SEO';
import { PageHeader } from '../components/layout/PageHeader';
import { Badge } from '../components/ui/Badge';
import { FormField, inputClasses } from '../components/ui/FormField';
import { Button } from '../components/ui/Button';
import { SuccessMessage } from '../components/ui/SuccessMessage';
import { NotFound } from './NotFound';

const opportunities = rawOpportunities as VolunteerOpportunity[];

export function VolunteerDetail() {
  const { id } = useParams<{ id: string }>();
  const opportunity = opportunities.find((o) => o.id === id);
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  if (!opportunity) return <NotFound />;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div>
      <SEO title={opportunity.title} description={opportunity.description} />
      <PageHeader eyebrow={opportunity.category} title={opportunity.title} />

      <section className="px-5 py-12">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/volunteer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-600 dark:text-accent-light"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Volunteer
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Badge>{opportunity.category}</Badge>
            <span className="flex items-center gap-1.5 text-sm text-ink-soft dark:text-ink-onDarkSoft">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              {opportunity.remote ? 'Remote' : opportunity.location}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-ink-soft dark:text-ink-onDarkSoft">
              <Users2 className="h-4 w-4" aria-hidden="true" />
              {opportunity.spotsAvailable} spots open
            </span>
          </div>

          <p className="mt-6 text-lg leading-relaxed text-ink dark:text-ink-onDark">
            {opportunity.description}
          </p>

          <div className="mt-10 rounded-2xl border border-primary-100 bg-surface p-6 dark:border-primary-800 dark:bg-surface-dark-muted sm:p-8">
            <h2 className="text-xl font-bold text-primary dark:text-white">Sign Up for This Role</h2>
            {submitted ? (
              <div className="mt-6">
                <SuccessMessage>Thanks for signing up for {opportunity.title} — we'll follow up soon.</SuccessMessage>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
                <FormField label="Full name" htmlFor="vd-name" required>
                  <input
                    id="vd-name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClasses}
                  />
                </FormField>
                <FormField label="Email address" htmlFor="vd-email" required>
                  <input
                    id="vd-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClasses}
                  />
                </FormField>
                <Button type="submit" variant="accent" className="self-start">
                  Confirm Sign-Up
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
