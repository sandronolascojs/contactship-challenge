import type { DB } from '@contactship/db';
import type {
  InsertSyncJob,
  InsertSyncJobLead,
  SelectSyncJob,
  SelectSyncJobLead,
  UpdateSyncJob,
} from '@contactship/db/schema';
import { syncJobLeads, syncJobs } from '@contactship/db/schema';
import { desc, eq } from 'drizzle-orm';

export class SyncJobsRepository {
  constructor(private readonly db: DB) {}

  async create(data: InsertSyncJob): Promise<SelectSyncJob> {
    const [job] = await this.db.insert(syncJobs).values(data).returning();
    return job;
  }

  async findOneById(id: string): Promise<SelectSyncJob | null> {
    const [job] = await this.db.select().from(syncJobs).where(eq(syncJobs.id, id)).limit(1);
    return job || null;
  }

  async update(id: string, data: UpdateSyncJob): Promise<SelectSyncJob> {
    const [job] = await this.db.update(syncJobs).set(data).where(eq(syncJobs.id, id)).returning();
    return job;
  }

  async findRecent(limit = 10): Promise<SelectSyncJob[]> {
    return this.db.select().from(syncJobs).orderBy(desc(syncJobs.createdAt)).limit(limit);
  }
}

export class SyncJobLeadsRepository {
  constructor(private readonly db: DB) {}

  async create(data: InsertSyncJobLead): Promise<SelectSyncJobLead> {
    const [relation] = await this.db.insert(syncJobLeads).values(data).returning();
    return relation;
  }

  async findByJobId(syncJobId: string): Promise<SelectSyncJobLead[]> {
    return this.db.select().from(syncJobLeads).where(eq(syncJobLeads.syncJobId, syncJobId));
  }
}
