import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { DatabaseHealthIndicator } from './database-health-indicator';
import { MemoryHealthIndicator } from './memory-health.indicator';
import { DatabaseModule, DrizzleService } from '../database';

@Module({
  imports: [DatabaseModule, TerminusModule.forRoot({})],
  controllers: [HealthController],
  providers: [DatabaseHealthIndicator, MemoryHealthIndicator, DrizzleService],
  exports: [DatabaseHealthIndicator, MemoryHealthIndicator],
})
export class HealthModule {}
