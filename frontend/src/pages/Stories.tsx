import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { BookOpen, Loader2, PenLine, Quote } from 'lucide-react';
import type { ApiStory } from '../types';
import { SEO } from '../components/SEO';
import { PageHeader } from '../components/layout/PageHeader';
import { FormField, inputClasses } from '../components/ui/FormField';
import { Button } from '../components/ui/Button';
import { SuccessMessage } from '../components/ui/SuccessMessage';
import { api, ApiError } from '../lib/api';
import { formatDate } from '../utils/date';

function StoryList() {
  const [stories, setStories] = useState<ApiStory[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.get<{ stories: ApiStory[] }>('/stories');
      setStories(result.stories);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Couldn't load stories — the server may be unavailable.";
      setError(message);
      setStories(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-ink-soft dark:text-ink-onDarkSoft">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Loading stories…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">
        <p>{error}</p>
        <Button type="button" variant="outline" size="sm" className="self-start" onClick={loadStories}>
          Try again
        </Button>
      </div>
    );
  }

  if (!stories || stories.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-primary-200 bg-surface-muted p-10 text-center dark:border-primary-700 dark:bg-surface-dark-muted">
        <BookOpen className="h-10 w-10 text-primary-300 dark:text-primary-600" aria-hidden="true" />
        <h3 className="text-lg font-bold text-primary dark:text-white">No stories yet</h3>
        <p className="text-sm text-ink-soft dark:text-ink-onDarkSoft">
          Be the first to share your experience — use the form to submit your story.
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-5">
      {stories.map((story) => (
        <li
          key={story.id}
          className="rounded-2xl border border-primary-100 bg-surface p-6 shadow-card dark:border-primary-800 dark:bg-surface-dark-muted"
        >
          <Quote className="h-6 w-6 text-accent" aria-hidden="true" />
          <h3 className="mt-3 text-lg font-bold text-primary dark:text-white">{story.title}</h3>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-soft dark:text-ink-onDarkSoft">
            {story.body}
          </p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-accent-600 dark:text-accent-light">
            {story.authorName}
            <span className="ml-2 font-normal normal-case text-ink-soft/70 dark:text-ink-onDarkSoft/70">
              {formatDate(story.createdAt.slice(0, 10))}
            </span>
          </p>
        </li>
      ))}
    </ul>
  );
}

function StorySubmissionForm() {
  const [form, setForm] = useState({ authorName: '', authorEmail: '', title: '', body: '' });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await api.post('/stories', {
        authorName: form.authorName.trim(),
        authorEmail: form.authorEmail.trim() ? form.authorEmail.trim() : null,
        title: form.title.trim(),
        body: form.body.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Couldn't submit your story — please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col gap-4">
        <SuccessMessage>
          Thank you for sharing! Your story has been submitted and will appear here once our team has
          reviewed it.
        </SuccessMessage>
        <Button
          type="button"
          variant="outline"
          className="self-start"
          onClick={() => {
            setForm({ authorName: '', authorEmail: '', title: '', body: '' });
            setSubmitted(false);
          }}
        >
          Submit another story
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Your name" htmlFor="story-name" required>
          <input
            id="story-name"
            required
            maxLength={120}
            value={form.authorName}
            onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))}
            className={inputClasses}
          />
        </FormField>
        <FormField label="Email address" htmlFor="story-email" hint="Optional — only our team sees it">
          <input
            id="story-email"
            type="email"
            value={form.authorEmail}
            onChange={(e) => setForm((f) => ({ ...f, authorEmail: e.target.value }))}
            className={inputClasses}
          />
        </FormField>
      </div>
      <FormField label="Story title" htmlFor="story-title" required>
        <input
          id="story-title"
          required
          maxLength={160}
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className={inputClasses}
          placeholder="e.g. How EMF helped my son find his voice"
        />
      </FormField>
      <FormField label="Your story" htmlFor="story-body" required hint="Share as much as you'd like">
        <textarea
          id="story-body"
          rows={8}
          required
          maxLength={8000}
          value={form.body}
          onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
          className={inputClasses}
        />
      </FormField>

      {error && (
        <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <p className="text-xs text-ink-soft dark:text-ink-onDarkSoft">
        Submitted stories are reviewed by our team before appearing publicly.
      </p>
      <Button type="submit" variant="accent" className="self-start" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {isSubmitting ? 'Submitting…' : 'Share Your Story'}
      </Button>
    </form>
  );
}

export function Stories() {
  return (
    <div>
      <SEO
        title="Stories"
        description="Read stories from the Elevate Minds Foundation community — and share your own experience for others to see."
      />
      <PageHeader
        eyebrow="Community Voices"
        title="Stories"
        description="Real experiences from the families, volunteers, and children who make up the Elevate Minds community — and a place to share yours."
      />

      <section className="px-5 py-14">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          {/* Left: collection of published stories */}
          <div>
            <div className="flex items-center gap-2 text-primary dark:text-white">
              <BookOpen className="h-5 w-5 text-accent" aria-hidden="true" />
              <h2 className="text-xl font-bold">Community Stories</h2>
            </div>
            <p className="mt-1 text-sm text-ink-soft dark:text-ink-onDarkSoft">
              Stories shared by our community and published for everyone to read.
            </p>
            <div className="mt-6">
              <StoryList />
            </div>
          </div>

          {/* Right: submission form */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-primary-100 bg-surface p-6 shadow-card dark:border-primary-800 dark:bg-surface-dark-muted sm:p-8">
              <div className="flex items-center gap-2 text-primary dark:text-white">
                <PenLine className="h-5 w-5 text-accent" aria-hidden="true" />
                <h2 className="text-xl font-bold">Share Your Story</h2>
              </div>
              <p className="mt-1 text-sm text-ink-soft dark:text-ink-onDarkSoft">
                Tell us about your experience — with your permission, we'll share it publicly to
                inspire others.
              </p>
              <div className="mt-6">
                <StorySubmissionForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
