import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';
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

// Only import Sentry modules if DSN is configured
// This prevents unnecessary initialization and potential issues
const isSentryEnabled = !!process.env.SENTRY_DSN;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: [loadEnv],
    }),
    // Conditionally import SentryModule only if DSN is configured
    ...(isSentryEnabled ? [SentryModule.forRoot()] : []),
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
  providers: [
    AppService,
    // Conditionally add SentryGlobalFilter only if Sentry is enabled
    ...(isSentryEnabled
      ? [
          {
            provide: APP_FILTER,
            useClass: SentryGlobalFilter,
          },
        ]
      : []),
  ],
})
export class AppModule {}
