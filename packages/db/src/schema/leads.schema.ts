import { LeadSource, LeadStatus } from '@contactship/types';
import { relations } from 'drizzle-orm';
import { index, jsonb, pgTable, text, varchar } from 'drizzle-orm/pg-core';
import { idField } from '../utils/id';
import { leadSourceEnum, leadStatusEnum } from '../utils/postgres-enum';
import { timestampWithTimezone } from '../utils/timestamp';
import { persons } from './persons.schema';
import { syncJobLeads } from './sync-job-leads.schema';

export const leads = pgTable(
  'leads',
  {
    id: idField('lead_id'),
    personId: text('person_id')
      .references(() => persons.id, { onDelete: 'cascade' })
      .notNull(),
    externalId: varchar('external_id', { length: 255 }),
    email: varchar('email', { length: 255 }).notNull(),
    source: leadSourceEnum('source').notNull().default(LeadSource.MANUAL),
    status: leadStatusEnum('status').notNull().default(LeadStatus.NEW),
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),
    syncedAt: timestampWithTimezone('synced_at'),
    summary: text('summary'),
    nextAction: text('next_action'),
    summaryGeneratedAt: timestampWithTimezone('summary_generated_at'),
    createdAt: timestampWithTimezone('created_at').notNull().defaultNow(),
    updatedAt: timestampWithTimezone('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_leads_person_id').on(table.personId),
    index('idx_leads_email').on(table.email),
    index('idx_leads_external_id').on(table.externalId),
    index('idx_leads_source').on(table.source),
    index('idx_leads_status').on(table.status),
  ],
);

export const leadsRelations = relations(leads, ({ one, many }) => ({
  person: one(persons, {
    fields: [leads.personId],
    references: [persons.id],
  }),
  syncJobRelations: many(syncJobLeads),
}));

export type SelectLead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;
export type UpdateLead = Partial<SelectLead>;
