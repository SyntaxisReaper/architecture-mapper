import * as Sentry from '@sentry/node';

const SENTRY_DSN = process.env.SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 0.2,
  });
  console.log('  Sentry        : ✓ initialized');
} else {
  console.log('  Sentry        : ○ not configured (optional)');
}

export { Sentry };
