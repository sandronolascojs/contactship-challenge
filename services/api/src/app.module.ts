import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacheModule } from './cache';
import { LoggerModule } from './common';
import { loadEnv } from './config/env.config';
import { SecurityModule } from './config/security';
import { DatabaseModule } from './database';
import { HealthModule } from './health';
import { LeadsModule } from './leads';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
