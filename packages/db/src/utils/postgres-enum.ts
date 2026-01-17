import { LeadSource, LeadStatus, SyncStatus } from '@contactship/types';
import { pgEnum } from 'drizzle-orm/pg-core';

export const leadSourceEnum = pgEnum('lead_source', [LeadSource.MANUAL, LeadSource.EXTERNAL_API]);

export const leadStatusEnum = pgEnum('lead_status', [
  LeadStatus.NEW,
  LeadStatus.CONTACTED,
  LeadStatus.QUALIFIED,
  LeadStatus.CONVERTED,
  LeadStatus.LOST,
]);

export const syncStatusEnum = pgEnum('sync_status', [
  SyncStatus.PENDING,
  SyncStatus.IN_PROGRESS,
  SyncStatus.COMPLETED,
  SyncStatus.FAILED,
]);
