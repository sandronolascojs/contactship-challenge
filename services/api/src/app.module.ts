import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database';
import { LeadsModule } from './leads';
import { LoggerModule } from './common';
import { SecurityModule } from './config/security';
import { HealthModule } from './health';
import { loadEnv } from './config/env.config';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
