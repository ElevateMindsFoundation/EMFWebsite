import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import rawNewsEvents from '../../data/newsEvents.json';
import type { NewsEventItem } from '../../types';
import { SectionHeading } from '../ui/SectionHeading';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatDate } from '../../utils/date';

const newsEvents = rawNewsEvents as NewsEventItem[];

export function NewsPreview() {
  const preview = newsEvents.slice(0, 3);

  return (
    <section className="bg-surface-muted px-5 py-16 dark:bg-surface-dark-muted sm:py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Stay in the Loop"
          title="Latest News & Events"
          action={
            <Link
              to="/news-events"
              className="text-sm font-semibold text-accent hover:text-accent-600 dark:text-accent-light"
            >
              View all →
            </Link>
          }
        />

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {preview.map((item) => (
            <Link key={item.id} to={`/news-events/${item.id}`}>
              <Card className="flex h-full flex-col gap-3">
                <Badge tone={item.type === 'event' ? 'accent' : 'primary'}>
                  {item.type === 'event' ? 'Event' : 'News'}
                </Badge>
                <h3 className="text-lg font-bold text-primary dark:text-white">{item.title}</h3>
                <p className="text-sm text-ink-soft dark:text-ink-onDarkSoft">{item.summary}</p>
                <span className="mt-auto flex items-center gap-1.5 text-xs text-ink-soft dark:text-ink-onDarkSoft">
                  <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                  {formatDate(item.date)}
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
