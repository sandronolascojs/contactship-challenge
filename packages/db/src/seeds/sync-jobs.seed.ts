import { SyncStatus } from '@contactship/types';
import { faker } from '@faker-js/faker';
import { getDb } from '../index';
import { syncJobs, type SelectSyncJob } from '../schema';

const SYNC_JOBS_COUNT = 10;

export const seedSyncJobs = async () => {
  console.log('🌱 Seeding sync jobs...');

  const db = getDb();

  try {
    const existingSyncJobs: SelectSyncJob[] = await db.select().from(syncJobs);

    if (existingSyncJobs.length >= SYNC_JOBS_COUNT) {
      console.log(`⏭️  Sync jobs already seeded (${existingSyncJobs.length}), skipping`);
      return;
    }

    for (let i = 0; i < SYNC_JOBS_COUNT; i++) {
      const status = faker.helpers.arrayElement([
        SyncStatus.COMPLETED,
        SyncStatus.COMPLETED,
        SyncStatus.COMPLETED,
        SyncStatus.FAILED,
        SyncStatus.IN_PROGRESS,
      ]);

      const recordsProcessed = faker.number.int({ min: 5, max: 15 });
      const recordsCreated =
        status === SyncStatus.COMPLETED ? faker.number.int({ min: 5, max: 10 }) : 0;
      const recordsSkipped =
        status === SyncStatus.COMPLETED ? recordsProcessed - recordsCreated : 0;

      const startedAt = faker.date.recent({ days: 30 });
      const duration = faker.number.int({ min: 1000, max: 30000 });

      let completedAt: Date | undefined;
      let errors: { leadId: string; message: string }[] | undefined;

      if (status === SyncStatus.COMPLETED || status === SyncStatus.FAILED) {
        completedAt = new Date(startedAt.getTime() + duration);

        if (status === SyncStatus.FAILED && recordsSkipped > 0) {
          errors = Array.from(
            { length: faker.number.int({ min: 1, max: recordsSkipped }) },
            () => ({
              leadId: faker.string.uuid(),
              message: faker.helpers.arrayElement([
                'Email already exists',
                'Invalid data format',
                'External API timeout',
                'Network error',
                'Validation failed',
              ]),
            }),
          );
        }
      }

      await db.insert(syncJobs).values({
        status,
        recordsProcessed,
        recordsCreated,
        recordsSkipped,
        errors,
        startedAt,
        completedAt,
      });
    }

    console.log(`✅ Created ${SYNC_JOBS_COUNT} sync jobs`);
  } catch (error) {
    console.error('❌ Error seeding sync jobs:', error);
    throw error;
  }
};
