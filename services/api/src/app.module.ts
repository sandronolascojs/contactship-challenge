import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiModule } from './ai';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth';
import { CacheModule } from './cache';
import { LoggerModule } from './common';
import { loadEnv } from './config/env.config';
import { SecurityModule } from './config/security';
import { DatabaseModule } from './database';
import { HealthModule } from './health';
import { LeadsModule } from './leads';
import { QueuesModule } from './queues';
import { SchedulerModule } from './scheduler';
import { SyncModule } from './sync';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: [loadEnv],
    }),
    SecurityModule,
    DatabaseModule,
    LeadsModule,
    LoggerModule,
    HealthModule,
    CacheModule,
    AuthModule,
    AiModule,
    QueuesModule,
    SyncModule,
    SchedulerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
