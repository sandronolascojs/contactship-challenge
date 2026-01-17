import type { DB } from '@contactship/db';
import { leads, persons } from '@contactship/db/schema';
import { LeadSource, LeadStatus, SyncStatus } from '@contactship/types';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { eq } from 'drizzle-orm';
import { DRIZZLE_PROVIDER } from '../../database';
import { RandomuserApiService } from '../../integrations';
import type { RandomUserApiResponse } from '../../integrations/randomuser-api/dto';
import { SyncJobsRepository } from '../../sync/repository/sync-jobs.repository';
import { QueueName } from '../enums';
import type { SyncExternalLeadsJobData, SyncJobResult } from '../interfaces';

@Processor(QueueName.SYNC_EXTERNAL_LEADS)
export class SyncExternalLeadsProcessor extends WorkerHost {
  private readonly logger = new Logger(SyncExternalLeadsProcessor.name);

  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly db: DB,
    private readonly syncJobsRepository: SyncJobsRepository,
    private readonly randomuserApiService: RandomuserApiService,
  ) {
    super();
  }

  async process(job: Job<SyncExternalLeadsJobData>): Promise<SyncJobResult> {
    const { source, batchSize = 10 } = job.data;
    if (!job.id) {
      throw new Error('Job ID is required');
    }
    const jobId = typeof job.id === 'string' ? job.id : String(job.id);

    this.logger.log(`[START] Starting sync job ${jobId} for ${source}, batch size: ${batchSize}`);
    const startTime = Date.now();

    try {
      const syncJob = await this.syncJobsRepository.findOneById(jobId);
      if (!syncJob) {
        this.logger.error(`[ERROR] Sync job ${jobId} not found in database`);
        throw new Error(`Sync job ${jobId} not found`);
      }
      this.logger.debug(`[DEBUG] Sync job found: ${JSON.stringify(syncJob)}`);

      this.logger.log(`[UPDATE] Updating job ${jobId} status to IN_PROGRESS`);
      await this.syncJobsRepository.update(jobId, {
        status: SyncStatus.IN_PROGRESS,
        startedAt: new Date(),
      });

      const result = await this.fetchAndProcessLeads(jobId, source, batchSize);

      this.logger.log(`[UPDATE] Updating job ${jobId} status to COMPLETED`);
      await this.syncJobsRepository.update(jobId, {
        status: SyncStatus.COMPLETED,
        completedAt: new Date(),
        recordsProcessed: result.recordsProcessed,
        recordsCreated: result.recordsCreated,
        recordsSkipped: result.recordsSkipped,
        errors: result.errors,
      });

      const duration = Date.now() - startTime;
      this.logger.log(
        `[COMPLETE] Sync job ${jobId} completed in ${duration}ms. Created: ${result.recordsCreated}, Skipped: ${result.recordsSkipped}, Processed: ${result.recordsProcessed}`,
      );

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `[FAILED] Sync job ${jobId} failed after ${duration}ms`,
        error instanceof Error ? error.stack : error,
      );

      try {
        await this.syncJobsRepository.update(jobId, {
          status: SyncStatus.FAILED,
          completedAt: new Date(),
        });
        this.logger.log(`[UPDATE] Updated job ${jobId} status to FAILED`);
      } catch (updateError) {
        this.logger.error(`[ERROR] Failed to update job ${jobId} status to FAILED`, updateError);
      }

      throw error;
    }
  }

  private async fetchAndProcessLeads(
    jobId: string,
    source: string,
    batchSize: number,
  ): Promise<SyncJobResult> {
    this.logger.log(`[FETCH] Starting to fetch leads for job ${jobId} from ${source}`);
    const result: SyncJobResult = {
      syncJobId: jobId,
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsSkipped: 0,
      errors: [],
    };

    if (source === 'randomuser-api') {
      try {
        this.logger.debug(`[FETCH] Calling randomuser.me API with batch size ${batchSize}`);

        const users = await this.randomuserApiService.fetchRandomUsers(batchSize);

        this.logger.log(`[FETCH] Successfully fetched ${users.length} users from randomuser.me`);

        for (const [index, user] of users.entries()) {
          this.logger.debug(
            `[PROCESS] Processing user ${index + 1}/${users.length}: ${user.email}`,
          );
          result.recordsProcessed++;

          try {
            const userStart = Date.now();

            const existingLead = await this.db
              .select()
              .from(leads)
              .where(eq(leads.email, user.email))
              .limit(1);

            if (existingLead.length > 0) {
              result.recordsSkipped++;
              const userDuration = Date.now() - userStart;
              this.logger.debug(
                `[SKIP] Lead with email ${user.email} already exists (${userDuration}ms)`,
              );
              continue;
            }

            this.logger.debug(`[CREATE] Creating lead for ${user.name.first} ${user.name.last}`);
            await this.createLeadFromUser(user);
            result.recordsCreated++;

            const userDuration = Date.now() - userStart;
            this.logger.log(
              `[CREATE] Created lead for ${user.name.first} ${user.name.last} (${userDuration}ms)`,
            );
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            result.errors.push({
              leadId: user.email,
              message: errorMessage,
            });
            this.logger.error(
              `[ERROR] Failed to process user ${user.email}: ${errorMessage}`,
              error,
            );
          }
        }

        this.logger.log(
          `[PROCESS] Completed processing all ${users.length} users. Created: ${result.recordsCreated}, Skipped: ${result.recordsSkipped}, Errors: ${result.errors.length}`,
        );
      } catch (error) {
        this.logger.error(`[FETCH_ERROR] Failed to fetch or process leads from ${source}`, error);
        throw error;
      }
    } else {
      this.logger.warn(`[FETCH] Unknown source: ${source}, skipping`);
    }

    return result;
  }

  private async createLeadFromUser(user: RandomUserApiResponse['results'][number]): Promise<void> {
    this.logger.debug(`[DB_INSERT] Starting DB insert for user ${user.email}`);
    const dbStart = Date.now();

    try {
      this.logger.debug(`[DB_INSERT] Inserting person record`);
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

      const personDuration = Date.now() - dbStart;
      this.logger.debug(`[DB_INSERT] Person created in ${personDuration}ms with ID: ${person.id}`);

      this.logger.debug(`[DB_INSERT] Inserting lead record`);
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

      const totalDuration = Date.now() - dbStart;
      this.logger.debug(`[DB_INSERT] Lead created in ${totalDuration}ms total`);
    } catch (error) {
      const duration = Date.now() - dbStart;
      this.logger.error(
        `[DB_ERROR] Database insert failed for user ${user.email} after ${duration}ms`,
        error,
      );
      throw error;
    }
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.log(`[WORKER] Job ${job.id} is now active`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<unknown>, result: SyncJobResult) {
    this.logger.log(`[WORKER] Job ${job.id} completed successfully`);
  }

  @OnWorkerEvent('failed')
  onError(job: Job<unknown>, error: Error) {
    this.logger.error(`[WORKER] Job ${job.id} failed: ${error.message}`, error.stack);
  }

  @OnWorkerEvent('stalled')
  onStalled(job: Job) {
    this.logger.warn(`[WORKER] Job ${job.id} stalled`);
  }
}
