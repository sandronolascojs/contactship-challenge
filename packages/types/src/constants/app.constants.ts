const APP_NAME = 'Counsy AI';
const APP_DESCRIPTION =
  'Private 24/7 voice-chat therapy app offering personalized mental-health support';
const APP_PREFIX = 'counsy-ai';
const APP_VERSION = '1.0.0';
const APP_URL = 'https://counsy.app';
const COMPANY_NAME = 'SoundsWire LLC';

// Date range limits //
const MAX_DATE_RANGE_DAYS = 1825; // 5 años (permite 2025-2030)
const MIN_DATE_RANGE_DAYS = 1;

export const APP_CONFIG = {
  basics: {
    name: APP_NAME,
    description: APP_DESCRIPTION,
    prefix: APP_PREFIX,
    version: APP_VERSION,
    url: APP_URL,
  },
  validation: {
    dateRange: {
      maxDays: MAX_DATE_RANGE_DAYS,
      minDays: MIN_DATE_RANGE_DAYS,
    },
  },
};
