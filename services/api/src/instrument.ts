// IMPORTANT: This file must be imported at the very top of main.ts
// Initialize Sentry as early as possible in the application lifecycle
import * as Sentry from '@sentry/nestjs';

Sentry.init({
  dsn: 'https://bd421792464d3aac8c357eafb3f4dffe@o4510591178440704.ingest.us.sentry.io/4510728018526208',
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
});
