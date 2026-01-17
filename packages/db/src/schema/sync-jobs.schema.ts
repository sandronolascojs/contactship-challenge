import { SyncStatus } from '@contactship/types';
import { relations } from 'drizzle-orm';
import { index, integer, jsonb, pgTable } from 'drizzle-orm/pg-core';
import { idField } from '../utils/id';
import { syncStatusEnum } from '../utils/postgres-enum';
import { timestampWithTimezone } from '../utils/timestamp';
import { syncJobLeads } from './sync-job-leads.schema';

export const syncJobs = pgTable(
  'sync_jobs',
  {
    id: idField('sync_job_id'),
    status: syncStatusEnum('status').notNull().default(SyncStatus.PENDING),
    recordsProcessed: integer('records_processed').default(0),
    recordsCreated: integer('records_created').default(0),
    recordsSkipped: integer('records_skipped').default(0),
    errors: jsonb('errors').$type<{ leadId: string; message: string }[]>(),
    startedAt: timestampWithTimezone('started_at'),
    completedAt: timestampWithTimezone('completed_at'),
    createdAt: timestampWithTimezone('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_sync_jobs_status').on(table.status),
    index('idx_sync_jobs_created_at').on(table.createdAt),
  ],
);

export const syncJobsRelations = relations(syncJobs, ({ many }) => ({
  leads: many(syncJobLeads),
}));

export type SelectSyncJob = typeof syncJobs.$inferSelect;
export type InsertSyncJob = typeof syncJobs.$inferInsert;
export type UpdateSyncJob = Partial<SelectSyncJob>;
