import { Download, ShieldCheck, Target } from 'lucide-react';
import rawTeam from '../data/team.json';
import type { TeamMember } from '../types';
import { SEO } from '../components/SEO';
import { PageHeader } from '../components/layout/PageHeader';
import { SectionHeading } from '../components/ui/SectionHeading';
import { InitialsAvatar } from '../components/ui/InitialsAvatar';
import { Card } from '../components/ui/Card';

const team = rawTeam as TeamMember[];

const PARTNERS = [
  'University Developmental Pediatrics Lab',
  'Regional Special Education Network',
  'Open Assistive Tech Collective',
  'Community Therapy Alliance',
];

const REPORTS = [
  { title: '2024 Annual Impact Report', year: 2024 },
  { title: '2023 Annual Impact Report', year: 2023 },
  { title: 'Founding Year Snapshot', year: 2022 },
];

export function About() {
  return (
    <div>
      <SEO
        title="About Us"
        description="Meet the team and mission behind Elevate Minds Foundation's free AI programs for children with disabilities."
      />
      <PageHeader
        eyebrow="Who We Are"
        title="About Elevate Minds Foundation"
        description="A nonprofit dedicated to transforming the lives of children with disabilities through free, AI-driven technology."
      />

      {/* Mission & Vision */}
      <section className="px-5 py-14">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-primary-100 bg-surface p-8 shadow-card dark:border-primary-800 dark:bg-surface-dark-muted">
            <Target className="h-8 w-8 text-accent" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-bold text-primary dark:text-white">Mission</h2>
            <p className="mt-2 text-ink-soft dark:text-ink-onDarkSoft">
              To develop and implement AI innovations that empower children with physical,
              cognitive, and sensory disabilities, enabling them to reach their full potential.
            </p>
          </div>
          <div className="rounded-2xl border border-primary-100 bg-surface p-8 shadow-card dark:border-primary-800 dark:bg-surface-dark-muted">
            <ShieldCheck className="h-8 w-8 text-accent" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-bold text-primary dark:text-white">Vision</h2>
            <p className="mt-2 text-ink-soft dark:text-ink-onDarkSoft">
              A future where technology bridges all gaps, and no child's development is limited by
              disability.
            </p>
          </div>
        </div>
      </section>

      {/* Founder's message */}
      <section className="bg-surface-muted px-5 py-14 dark:bg-surface-dark-muted">
        <div className="mx-auto max-w-3xl">
          <SectionHeading eyebrow="From Our Team" title="Founder's Message" />
          <div className="mt-6 rounded-2xl border border-dashed border-primary-200 bg-surface p-8 text-ink-soft dark:border-primary-700 dark:bg-surface-dark dark:text-ink-onDarkSoft">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent-600 dark:text-accent-light">
              Placeholder copy
            </p>
            <p className="mt-3 italic leading-relaxed">
              "We started Elevate Minds Foundation because we kept meeting families who had found a
              tool that could help their child — and then found out it cost more than they could
              afford. This is our answer to that: technology that meets children where they are,
              built with the people who know them best, and given away freely. This message will be
              replaced with a real note from our founding team."
            </p>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="px-5 py-14">
        <div className="mx-auto max-w-6xl">
          <SectionHeading eyebrow="Meet the Team" title="The People Behind the Work" align="center" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member) => (
              <Card key={member.id} className="flex flex-col items-center gap-3 text-center" hoverable={false}>
                <InitialsAvatar initials={member.initials} name={member.name} />
                <h3 className="text-lg font-bold text-primary dark:text-white">{member.name}</h3>
                <p className="text-sm font-medium text-accent-600 dark:text-accent-light">{member.title}</p>
                <p className="text-sm text-ink-soft dark:text-ink-onDarkSoft">{member.bio}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partnerships */}
      <section className="bg-surface-muted px-5 py-14 dark:bg-surface-dark-muted">
        <div className="mx-auto max-w-6xl">
          <SectionHeading eyebrow="Working Together" title="Partnerships & Collaborators" align="center" />
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {PARTNERS.map((partner) => (
              <span
                key={partner}
                className="rounded-full border border-primary-200 bg-surface px-5 py-2.5 text-sm font-medium text-primary dark:border-primary-700 dark:bg-surface-dark dark:text-ink-onDark"
              >
                {partner}
              </span>
            ))}
          </div>
          <p className="mt-4 text-center text-xs italic text-ink-soft/70 dark:text-ink-onDarkSoft/70">
            Placeholder partner names — real partner logos and agreements will replace these.
          </p>
        </div>
      </section>

      {/* Impact reports */}
      <section className="px-5 py-14">
        <div className="mx-auto max-w-4xl">
          <SectionHeading eyebrow="Transparency" title="Impact Reports" align="center" />
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {REPORTS.map((report) => (
              <div
                key={report.title}
                className="flex flex-col items-start gap-3 rounded-2xl border border-primary-100 bg-surface p-6 dark:border-primary-800 dark:bg-surface-dark-muted"
              >
                <Download className="h-6 w-6 text-primary-300 dark:text-primary-600" aria-hidden="true" />
                <div>
                  <h3 className="text-sm font-bold text-primary dark:text-white">{report.title}</h3>
                  <p className="text-xs text-ink-soft dark:text-ink-onDarkSoft">{report.year}</p>
                </div>
                <button
                  type="button"
                  disabled
                  className="mt-auto w-full cursor-not-allowed rounded-full border border-primary-200 px-4 py-2 text-xs font-semibold text-ink-soft/60 dark:border-primary-700 dark:text-ink-onDarkSoft/60"
                >
                  Coming Soon
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
