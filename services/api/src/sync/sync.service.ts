import type { InsertSyncJob } from '@contactship/db/schema';
import { SyncStatus } from '@contactship/types';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { QueueName } from '../queues/enums';
import type { SyncExternalLeadsJobData } from '../queues/interfaces';
import { SyncJobsRepository } from './repository/sync-jobs.repository';

@Injectable()
export class SyncService {
  constructor(
    private readonly syncJobsRepository: SyncJobsRepository,
    @InjectQueue(QueueName.SYNC_EXTERNAL_LEADS)
    private readonly syncQueue: Queue,
  ) {}

  async triggerSyncExternalLeads(source = 'randomuser-api', batchSize = 10) {
    const syncJobData: InsertSyncJob = {
      status: SyncStatus.PENDING,
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsSkipped: 0,
      errors: [],
    };

    const syncJob = await this.syncJobsRepository.create(syncJobData);

    const jobData: SyncExternalLeadsJobData = {
      source,
      batchSize,
    };

    await this.syncQueue.add(QueueName.SYNC_EXTERNAL_LEADS, jobData, {
      jobId: syncJob.id,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });

    return syncJob;
  }

  async getSyncJobs(limit = 10) {
    return this.syncJobsRepository.findRecent(limit);
  }

  async getSyncJobById(id: string) {
    return this.syncJobsRepository.findOneById(id);
  }
}
