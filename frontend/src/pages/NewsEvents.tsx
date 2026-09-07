import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import rawNewsEvents from '../data/newsEvents.json';
import type { NewsEventItem } from '../types';
import { SEO } from '../components/SEO';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { formatDate } from '../utils/date';

const newsEvents = rawNewsEvents as NewsEventItem[];

export function NewsEvents() {
  // ISO "YYYY-MM-DD" strings sort correctly lexically, no Date parsing needed.
  const sorted = [...newsEvents].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      <SEO
        title="News & Events"
        description="Read the latest updates, research partnerships, and upcoming free events from Elevate Minds Foundation."
      />
      <PageHeader
        eyebrow="Stay Connected"
        title="News & Events"
        description="Updates from our programs, research partnerships, and upcoming free events."
      />

      <section className="px-5 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col gap-5">
            {sorted.map((item) => (
              <Link key={item.id} to={`/news-events/${item.id}`}>
                <Card className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-6">
                  <div className="flex shrink-0 flex-col items-start gap-2 sm:w-40">
                    <Badge tone={item.type === 'event' ? 'accent' : 'primary'}>
                      {item.type === 'event' ? 'Event' : 'News'}
                    </Badge>
                    <span className="flex items-center gap-1.5 text-xs text-ink-soft dark:text-ink-onDarkSoft">
                      <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                      {formatDate(item.date, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-primary dark:text-white">{item.title}</h2>
                    <p className="mt-1 text-sm text-ink-soft dark:text-ink-onDarkSoft">{item.summary}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
