import { relations } from 'drizzle-orm';
import { index, pgTable, primaryKey, text } from 'drizzle-orm/pg-core';
import { timestampWithTimezone } from '../utils/timestamp';
import { leads } from './leads.schema';
import { syncJobs } from './sync-jobs.schema';

export const syncJobLeads = pgTable(
  'sync_job_leads',
  {
    syncJobId: text('sync_job_id')
      .references(() => syncJobs.id, { onDelete: 'cascade' })
      .notNull(),
    leadId: text('lead_id')
      .references(() => leads.id, { onDelete: 'cascade' })
      .notNull(),
    createdAt: timestampWithTimezone('created_at').notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.syncJobId, table.leadId] }),
    index('idx_sync_job_leads_sync_job_id').on(table.syncJobId),
    index('idx_sync_job_leads_lead_id').on(table.leadId),
  ],
);

export const syncJobLeadsRelations = relations(syncJobLeads, ({ one }) => ({
  lead: one(leads, {
    fields: [syncJobLeads.leadId],
    references: [leads.id],
  }),
  syncJob: one(syncJobs, {
    fields: [syncJobLeads.syncJobId],
    references: [syncJobs.id],
  }),
}));

export type SelectSyncJobLead = typeof syncJobLeads.$inferSelect;
export type InsertSyncJobLead = typeof syncJobLeads.$inferInsert;
export type UpdateSyncJobLead = Partial<SelectSyncJobLead>;
