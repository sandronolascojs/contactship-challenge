import { SyncStatus } from '@contactship/types';
import { faker } from '@faker-js/faker';
import { getDb } from '../index';
import {
  leads,
  syncJobLeads,
  syncJobs,
  type SelectLead,
  type SelectSyncJob,
  type SelectSyncJobLead,
} from '../schema';

const SYNC_JOB_LEADS_COUNT = 200;

interface PostgresError extends Error {
  code?: string;
}

export const seedSyncJobLeads = async () => {
  console.log('🌱 Seeding sync job leads...');

  const db = getDb();

  try {
    const existingSyncJobLeads: SelectSyncJobLead[] = await db.select().from(syncJobLeads);

    if (existingSyncJobLeads.length >= SYNC_JOB_LEADS_COUNT) {
      console.log(`⏭️  Sync job leads already seeded (${existingSyncJobLeads.length}), skipping`);
      return;
    }

    const allLeads: SelectLead[] = await db.select().from(leads);
    const allSyncJobs: SelectSyncJob[] = await db.select().from(syncJobs);

    const activeSyncJobs: SelectSyncJob[] = allSyncJobs.filter(
      (job: SelectSyncJob) =>
        job.status === SyncStatus.COMPLETED ||
        job.status === SyncStatus.FAILED ||
        job.status === SyncStatus.IN_PROGRESS,
    );

    if (allLeads.length === 0 || activeSyncJobs.length === 0) {
      console.log('⚠️  No leads or sync jobs found. Please seed them first.');
      return;
    }

    const createdCount = Math.min(SYNC_JOB_LEADS_COUNT, allLeads.length);
    let created = 0;

    const existingCombinations = new Set<string>(
      existingSyncJobLeads.map((sjl: SelectSyncJobLead) => `${sjl.syncJobId}-${sjl.leadId}`),
    );

    for (let i = 0; i < createdCount; i++) {
      const lead: SelectLead = faker.helpers.arrayElement(allLeads);
      const syncJob: SelectSyncJob = faker.helpers.arrayElement(activeSyncJobs);

      const combinationKey = `${syncJob.id}-${lead.id}`;

      if (existingCombinations.has(combinationKey)) {
        continue;
      }

      existingCombinations.add(combinationKey);

      try {
        await db.insert(syncJobLeads).values({
          syncJobId: syncJob.id,
          leadId: lead.id,
        });
        created++;
      } catch (error: unknown) {
        const pgError = error as PostgresError;
        if (pgError.code === '23505') {
          continue;
        }
        throw error;
      }
    }

    console.log(`✅ Created ${created} sync job leads`);
  } catch (error) {
    console.error('❌ Error seeding sync job leads:', error);
    throw error;
  }
};
