import type { DB } from '@contactship/db';
import { leads, persons } from '@contactship/db/schema';
import { LeadSource, LeadStatus, SyncStatus } from '@contactship/types';
import { OnWorkerEvent, Processor } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { eq } from 'drizzle-orm';
import { DRIZZLE_PROVIDER } from '../../database';
import type { RandomUserApiResponse } from '../../integrations/randomuser-api/dto';
import { SyncJobsRepository } from '../../sync/repository/sync-jobs.repository';
import { QueueName } from '../enums';
import type { SyncExternalLeadsJobData, SyncJobResult } from '../interfaces';

@Processor(QueueName.SYNC_EXTERNAL_LEADS)
export class SyncExternalLeadsProcessor {
  private readonly logger = new Logger(SyncExternalLeadsProcessor.name);

  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly db: DB,
    private readonly syncJobsRepository: SyncJobsRepository,
  ) {}

  async process(job: Job<SyncExternalLeadsJobData>): Promise<SyncJobResult> {
    const { source, batchSize = 10 } = job.data;
    if (!job.id) {
      throw new Error('Job ID is required');
    }
    const jobId = typeof job.id === 'string' ? job.id : String(job.id);

    this.logger.log(`Starting sync job for ${source}, batch size: ${batchSize}`);

    const syncJob = await this.syncJobsRepository.findOneById(jobId);
    if (!syncJob) {
      throw new Error(`Sync job ${jobId} not found`);
    }

    await this.syncJobsRepository.update(jobId, {
      status: SyncStatus.IN_PROGRESS,
      startedAt: new Date(),
    });

    try {
      const result = await this.fetchAndProcessLeads(source, batchSize);

      await this.syncJobsRepository.update(jobId, {
        status: SyncStatus.COMPLETED,
        completedAt: new Date(),
        recordsProcessed: result.recordsProcessed,
        recordsCreated: result.recordsCreated,
        recordsSkipped: result.recordsSkipped,
        errors: result.errors,
      });

      this.logger.log(
        `Sync job ${jobId} completed. Created: ${result.recordsCreated}, Skipped: ${result.recordsSkipped}`,
      );

      return result;
    } catch (error) {
      this.logger.error(`Sync job ${jobId} failed`, error);

      await this.syncJobsRepository.update(jobId, {
        status: SyncStatus.FAILED,
        completedAt: new Date(),
      });

      throw error;
    }
  }

  private async fetchAndProcessLeads(source: string, batchSize: number): Promise<SyncJobResult> {
    const result: SyncJobResult = {
      syncJobId: '',
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsSkipped: 0,
      errors: [],
    };

    if (source === 'randomuser-api') {
      const response = await fetch(`https://randomuser.me/api/?results=${batchSize}`);
      const data = (await response.json()) as RandomUserApiResponse;
      const users = data.results;

      this.logger.log(`Fetched ${users.length} users from randomuser.me`);

      for (const user of users) {
        result.recordsProcessed++;

        try {
          const email = user.email;
          const existingLead = await this.db
            .select()
            .from(leads)
            .where(eq(leads.email, email))
            .limit(1);

          if (existingLead.length > 0) {
            result.recordsSkipped++;
            this.logger.debug(`Lead with email ${email} already exists, skipping`);
            continue;
          }

          await this.createLeadFromUser(user);
          result.recordsCreated++;
          this.logger.debug(`Created lead for ${user.name.first} ${user.name.last}`);
        } catch (error) {
          result.errors.push({
            leadId: user.email,
            message: error instanceof Error ? error.message : 'Unknown error',
          });
          this.logger.error(`Failed to process user ${user.email}`, error);
        }
      }
    }

    return result;
  }

  private async createLeadFromUser(user: RandomUserApiResponse['results'][number]): Promise<void> {
    const [person] = await this.db
      .insert(persons)
      .values({
        firstName: user.name.first,
        lastName: user.name.last,
        phone: user.phone,
        pictureUrl: user.picture.medium,
        address: {
          street: `${user.location.street.number} ${user.location.street.name}`,
          city: user.location.city,
          state: user.location.state,
          postcode: user.location.postcode,
          country: user.location.country,
        },
        dateOfBirth: user.dob.date ? new Date(user.dob.date) : undefined,
        gender: user.gender,
      })
      .returning();

    await this.db.insert(leads).values({
      personId: person.id,
      email: user.email,
      externalId: user.login.uuid,
      source: LeadSource.EXTERNAL_API,
      status: LeadStatus.NEW,
      syncedAt: new Date(),
      metadata: {
        location: `${user.location.city}, ${user.location.country}`,
        profession: user.nat,
      },
    });
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.log(`Processing job ${job.id}`);
  }

  @OnWorkerEvent('failed')
  onError(job: Job<unknown>, error: Error) {
    this.logger.error(`Job ${job.id} failed: ${error.message}`);
  }
}
