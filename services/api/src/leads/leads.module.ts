import type { DB } from '@contactship/db';
import { Module } from '@nestjs/common';
import { AiModule } from '../ai';
import { DatabaseModule, DRIZZLE_PROVIDER } from '../database';
import { PersonsModule } from '../persons';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { LeadsRepository } from './repository';

@Module({
  imports: [DatabaseModule, PersonsModule, AiModule],
  controllers: [LeadsController],
  providers: [
    LeadsService,
    {
      provide: LeadsRepository,
      useFactory: (db: DB) => new LeadsRepository(db),
      inject: [DRIZZLE_PROVIDER],
    },
  ],
  exports: [LeadsService, LeadsRepository],
})
export class LeadsModule {}
