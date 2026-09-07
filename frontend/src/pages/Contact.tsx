import { useState } from 'react';
import type { FormEvent } from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { SEO } from '../components/SEO';
import { PageHeader } from '../components/layout/PageHeader';
import { FormField, inputClasses } from '../components/ui/FormField';
import { Button } from '../components/ui/Button';
import { SuccessMessage } from '../components/ui/SuccessMessage';
import { FacebookGlyph, InstagramGlyph, LinkedInGlyph, XGlyph } from '../components/ui/SocialIcons';

const SOCIAL_LINKS = [
  { label: 'Facebook', href: '#', Icon: FacebookGlyph },
  { label: 'Instagram', href: '#', Icon: InstagramGlyph },
  { label: 'X (Twitter)', href: '#', Icon: XGlyph },
  { label: 'LinkedIn', href: '#', Icon: LinkedInGlyph },
];

export function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div>
      <SEO
        title="Contact Us"
        description="Get in touch with Elevate Minds Foundation with questions, partnership ideas, or feedback."
      />
      <PageHeader
        eyebrow="We'd Love to Hear From You"
        title="Contact Us"
        description="Questions, partnership ideas, or just want to say hello — reach out."
      />

      <section className="px-5 py-12">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-primary-100 bg-surface p-6 shadow-card dark:border-primary-800 dark:bg-surface-dark-muted sm:p-8">
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
            <div className="rounded-2xl border border-dashed border-primary-200 bg-surface-muted p-6 dark:border-primary-700 dark:bg-surface-dark-muted">
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
              <h2 className="text-sm font-semibold uppercase tracking-wide text-primary dark:text-white">
                Follow Along
              </h2>
              <ul className="mt-4 flex items-center gap-2">
                {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      aria-label={label}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-primary-200 text-primary transition-colors hover:bg-primary-50 dark:border-primary-700 dark:text-ink-onDark dark:hover:bg-surface-dark"
                    >
                      <Icon />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
