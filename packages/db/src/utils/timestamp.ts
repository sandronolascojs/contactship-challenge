import { timestamp } from 'drizzle-orm/pg-core';

export const timestampWithTimezone = (name: string) =>
  timestamp(name, { withTimezone: true, mode: 'date' });
