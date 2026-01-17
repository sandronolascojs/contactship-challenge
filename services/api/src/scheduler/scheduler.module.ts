import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SyncModule } from '../sync';
import { SyncScheduler } from './sync.scheduler';

@Module({
  imports: [ScheduleModule.forRoot(), SyncModule],
  providers: [SyncScheduler],
  exports: [SyncScheduler],
})
export class SchedulerModule {}
