import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SyncService } from '../sync';

@Injectable()
export class SyncScheduler {
  private readonly logger = new Logger(SyncScheduler.name);

  constructor(private readonly syncService: SyncService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleHourlySync() {
    this.logger.log('Starting hourly external leads sync');

    try {
      const syncJob = await this.syncService.triggerSyncExternalLeads('randomuser-api', 10);

      this.logger.log(`Hourly sync job created with ID: ${syncJob.id}, status: ${syncJob.status}`);
    } catch (error) {
      this.logger.error('Failed to trigger hourly sync', error);
    }
  }
}
