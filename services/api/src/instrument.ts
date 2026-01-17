// IMPORTANT: This file must be imported at the very top of main.ts
// Initialize Sentry as early as possible in the application lifecycle
import * as Sentry from '@sentry/nestjs';

// Only initialize Sentry if DSN is provided via environment variable
// This prevents infinite requests if Sentry is not configured
const sentryDsn = process.env.SENTRY_DSN;

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    // Setting this option to true will send default PII data to Sentry.
    // For example, automatic IP address collection on events
    sendDefaultPii: true,
    // Environment configuration
    environment: process.env.NODE_ENV || 'development',
    // Release version (can be set via environment variable)
    release: process.env.APP_VERSION,
    // Performance monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Enable profiling
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Max number of breadcrumbs to capture (prevents memory issues)
    maxBreadcrumbs: 50,
    // Before send hook to filter events (additional protection)
    beforeSend(event, hint) {
      // Optional: Add custom filtering logic here
      return event;
    },
  });
} else {
  // Log warning in development, silent in production
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      '⚠️  Sentry DSN not configured. Error tracking is disabled. Set SENTRY_DSN environment variable to enable.',
    );
  }
}
