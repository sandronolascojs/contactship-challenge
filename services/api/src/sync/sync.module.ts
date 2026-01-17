import type { DB } from '@contactship/db';
import { Module } from '@nestjs/common';
import { DatabaseModule, DRIZZLE_PROVIDER } from '../database';
import { QueuesModule } from '../queues';
import { SyncJobsRepository } from './repository/sync-jobs.repository';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';

@Module({
  imports: [DatabaseModule, QueuesModule],
  controllers: [SyncController],
  providers: [
    {
      provide: SyncJobsRepository,
      useFactory: (db: DB) => new SyncJobsRepository(db),
      inject: [DRIZZLE_PROVIDER],
    },
    SyncService,
  ],
  exports: [SyncService],
})
export class SyncModule {}
