import type { DB } from '@contactship/db';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule, DRIZZLE_PROVIDER } from '../database';
import { IntegrationsModule } from '../integrations';
import { SyncJobsRepository } from '../sync/repository/sync-jobs.repository';
import { QueueName } from './enums/queue-name.enum';
import { SyncExternalLeadsProcessor } from './processors/sync-external-leads.processor';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST') ?? 'localhost',
          port: configService.get<number>('REDIS_PORT') ?? 6379,
          password: configService.get<string>('REDIS_PASSWORD'),
          db: configService.get<number>('REDIS_DB') ?? 0,
        },
      }),
    }),
    BullModule.registerQueue({ name: QueueName.SYNC_EXTERNAL_LEADS }),
    DatabaseModule,
    IntegrationsModule,
  ],
  providers: [
    {
      provide: SyncJobsRepository,
      useFactory: (db: DB) => new SyncJobsRepository(db),
      inject: [DRIZZLE_PROVIDER],
    },
    SyncExternalLeadsProcessor,
  ],
  exports: [BullModule, SyncJobsRepository],
})
export class QueuesModule {}
