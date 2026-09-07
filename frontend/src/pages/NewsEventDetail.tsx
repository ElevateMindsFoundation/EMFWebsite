import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import rawNewsEvents from '../data/newsEvents.json';
import type { NewsEventItem } from '../types';
import { SEO } from '../components/SEO';
import { PageHeader } from '../components/layout/PageHeader';
import { Badge } from '../components/ui/Badge';
import { formatDate } from '../utils/date';
import { NotFound } from './NotFound';

const newsEvents = rawNewsEvents as NewsEventItem[];

export function NewsEventDetail() {
  const { id } = useParams<{ id: string }>();
  const item = newsEvents.find((n) => n.id === id);

  if (!item) return <NotFound />;

  return (
    <div>
      <SEO title={item.title} description={item.summary} />
      <PageHeader eyebrow={item.type === 'event' ? 'Event' : 'News'} title={item.title} />

      <section className="px-5 py-12">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/news-events"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-600 dark:text-accent-light"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to News & Events
          </Link>

          <div className="mt-6 flex items-center gap-3">
            <Badge tone={item.type === 'event' ? 'accent' : 'primary'}>
              {item.type === 'event' ? 'Event' : 'News'}
            </Badge>
            <span className="flex items-center gap-1.5 text-sm text-ink-soft dark:text-ink-onDarkSoft">
              <Calendar className="h-4 w-4" aria-hidden="true" />
              {formatDate(item.date)}
            </span>
          </div>

          <p className="mt-6 text-lg leading-relaxed text-ink dark:text-ink-onDark">{item.body}</p>
        </div>
      </section>
    </div>
  );
}
