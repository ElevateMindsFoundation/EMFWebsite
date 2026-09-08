import { useState } from 'react';
import type { FormEvent } from 'react';
import { Download, Mail, MapPin, Phone, ShieldCheck, Target } from 'lucide-react';
import rawTeam from '../data/team.json';
import type { TeamMember } from '../types';
import { SEO } from '../components/SEO';
import { PageHeader } from '../components/layout/PageHeader';
import { SectionHeading } from '../components/ui/SectionHeading';
import { InitialsAvatar } from '../components/ui/InitialsAvatar';
import { Card } from '../components/ui/Card';
import { FormField, inputClasses } from '../components/ui/FormField';
import { Button } from '../components/ui/Button';
import { SuccessMessage } from '../components/ui/SuccessMessage';
import { FacebookGlyph, InstagramGlyph, LinkedInGlyph, XGlyph } from '../components/ui/SocialIcons';

const team = rawTeam as TeamMember[];

// Foundation leadership — real people, with photos in /public/team. The bios
// below are short placeholders framed around each role; replace with final
// approved copy when available.
const LEADERSHIP = [
  {
    name: 'Mohit Lagisetty',
    title: 'President',
    photoUrl: '/team/mohit-lagisetty.jpg',
    bio: "As President, Mohit sets the direction and partnerships behind Elevate Minds Foundation, championing free, AI-driven tools that help every child reach their full potential.",
  },
  {
    name: 'Nishant Pai',
    title: 'Vice President',
    photoUrl: '/team/nishant-pai.jpg',
    bio: "As Vice President, Nishant leads program strategy and day-to-day operations, making sure the foundation's technology reaches the families and children who need it most.",
  },
];

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

const SOCIAL_LINKS = [
  { label: 'Facebook', href: '#', Icon: FacebookGlyph },
  { label: 'Instagram', href: '#', Icon: InstagramGlyph },
  { label: 'X (Twitter)', href: '#', Icon: XGlyph },
  { label: 'LinkedIn', href: '#', Icon: LinkedInGlyph },
];

function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section id="contact" className="scroll-mt-24 bg-surface-muted px-5 py-14 dark:bg-surface-dark-muted">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          eyebrow="We'd Love to Hear From You"
          title="Get in Touch"
          align="center"
        />
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-primary-100 bg-surface p-6 shadow-card dark:border-primary-800 dark:bg-surface-dark sm:p-8">
            {submitted ? (
              <SuccessMessage>Thanks for reaching out — we'll get back to you soon.</SuccessMessage>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Full name" htmlFor="contact-name" required>
                    <input
                      id="contact-name"
                      required
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className={inputClasses}
                    />
                  </FormField>
                  <FormField label="Email address" htmlFor="contact-email" required>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      className={inputClasses}
                    />
                  </FormField>
                </div>
                <FormField label="Subject" htmlFor="contact-subject" required>
                  <input
                    id="contact-subject"
                    required
                    value={form.subject}
                    onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                    className={inputClasses}
                  />
                </FormField>
                <FormField label="Message" htmlFor="contact-message" required>
                  <textarea
                    id="contact-message"
                    rows={5}
                    required
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    className={inputClasses}
                  />
                </FormField>
                <Button type="submit" variant="primary" className="self-start">
                  Send Message
                </Button>
              </form>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-dashed border-primary-200 bg-surface p-6 dark:border-primary-700 dark:bg-surface-dark">
              <p className="text-xs font-semibold uppercase tracking-wide text-accent-600 dark:text-accent-light">
                Placeholder — update with real, confirmed contact details
              </p>
              <ul className="mt-4 flex flex-col gap-3 text-sm text-ink-soft dark:text-ink-onDarkSoft">
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                  Cary, NC
                </li>
                <li className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                  info@elevateminds.org
                </li>
                <li className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                  (123) 456-7890
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-primary dark:text-white">
                Follow Along
              </h3>
              <ul className="mt-4 flex items-center gap-2">
                {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      aria-label={label}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-primary-200 text-primary transition-colors hover:bg-primary-50 dark:border-primary-700 dark:text-ink-onDark dark:hover:bg-surface-dark-muted"
                    >
                      <Icon />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function About() {
  return (
    <div>
      <SEO
        title="About Us"
        description="Meet the leadership and team behind Elevate Minds Foundation's free AI programs for children with disabilities — and get in touch."
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

      {/* Leadership team */}
      <section className="bg-surface-muted px-5 py-14 dark:bg-surface-dark-muted">
        <div className="mx-auto max-w-5xl">
          <SectionHeading eyebrow="Leadership" title="Our Leadership Team" align="center" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {LEADERSHIP.map((leader) => (
              <Card key={leader.name} className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left" hoverable={false}>
                <img
                  src={leader.photoUrl}
                  alt={`${leader.name}, ${leader.title} of Elevate Minds Foundation`}
                  loading="lazy"
                  className="h-28 w-28 shrink-0 rounded-2xl object-cover ring-1 ring-primary-100 dark:ring-primary-800"
                />
                <div>
                  <h3 className="text-lg font-bold text-primary dark:text-white">{leader.name}</h3>
                  <p className="text-sm font-medium text-accent-600 dark:text-accent-light">{leader.title}</p>
                  <p className="mt-2 text-sm text-ink-soft dark:text-ink-onDarkSoft">{leader.bio}</p>
                </div>
              </Card>
            ))}
          </div>
          <p className="mt-4 text-center text-xs italic text-ink-soft/70 dark:text-ink-onDarkSoft/70">
            Leadership bios are placeholders — send us the final approved copy to drop in.
          </p>
        </div>
      </section>

      {/* Founder's message */}
      <section className="px-5 py-14">
        <div className="mx-auto max-w-3xl">
          <SectionHeading eyebrow="From Our Team" title="Founder's Message" />
          <div className="mt-6 rounded-2xl border border-dashed border-primary-200 bg-surface p-8 text-ink-soft dark:border-primary-700 dark:bg-surface-dark-muted dark:text-ink-onDarkSoft">
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
      <section className="bg-surface-muted px-5 py-14 dark:bg-surface-dark-muted">
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
      <section className="px-5 py-14">
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
      <section className="bg-surface-muted px-5 py-14 dark:bg-surface-dark-muted">
        <div className="mx-auto max-w-4xl">
          <SectionHeading eyebrow="Transparency" title="Impact Reports" align="center" />
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {REPORTS.map((report) => (
              <div
                key={report.title}
                className="flex flex-col items-start gap-3 rounded-2xl border border-primary-100 bg-surface p-6 dark:border-primary-800 dark:bg-surface-dark"
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

      {/* Contact — merged from the former standalone Contact page */}
      <ContactSection />
    </div>
  );
}
