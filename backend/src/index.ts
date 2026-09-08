import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './lib/env';
import { HttpError } from './lib/errors';

import authRouter from './routes/auth';
import innovationsRouter from './routes/innovations';
import earlyInterventionsRouter from './routes/earlyInterventions';
import volunteerRouter from './routes/volunteer';
import donationsRouter from './routes/donations';
import newsEventsRouter from './routes/newsEvents';
import contactRouter from './routes/contact';
import newsletterRouter from './routes/newsletter';
import teamRouter from './routes/team';
import testimonialsRouter from './routes/testimonials';
import storiesRouter from './routes/stories';
import adminRouter from './routes/admin';

const app = express();

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);

// Stripe's webhook signature check needs the RAW request body, not the
// JSON-parsed object, so this exact path gets express.raw() ahead of the
// global express.json() below. body-parser's middlewares (raw/json/etc.)
// each check req._body and skip re-parsing if a prior one already ran, so
// this doesn't break JSON parsing for any other route — only this one path
// gets a Buffer body instead of a parsed object. See routes/donations.ts.
app.use('/api/donations/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/innovations', innovationsRouter);
app.use('/api/early-interventions', earlyInterventionsRouter);
app.use('/api/volunteer', volunteerRouter);
app.use('/api/donations', donationsRouter);
app.use('/api/news-events', newsEventsRouter);
app.use('/api/contact', contactRouter);
app.use('/api/newsletter', newsletterRouter);
app.use('/api/team', teamRouter);
app.use('/api/testimonials', testimonialsRouter);
app.use('/api/stories', storiesRouter);
app.use('/api/admin', adminRouter);

// 404 for unmatched /api/* routes
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Centralized error handler. Never leaks stack traces or internal error
// details to the client — only a safe message and status code.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(env.PORT, () => {
  console.log(`Elevate Minds Foundation API listening on http://localhost:${env.PORT}`);
});
