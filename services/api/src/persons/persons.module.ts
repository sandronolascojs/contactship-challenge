import type { DB } from '@contactship/db';
import { Module } from '@nestjs/common';
import { DatabaseModule, DRIZZLE_PROVIDER } from '../database';
import { PersonsService } from './persons.service';
import { PersonsRepository } from './repository/persons.repository';

@Module({
  imports: [DatabaseModule],
  providers: [
    PersonsService,
    {
      provide: PersonsRepository,
      useFactory: (db: DB) => new PersonsRepository(db),
      inject: [DRIZZLE_PROVIDER],
    },
  ],
  exports: [PersonsService, PersonsRepository],
})
export class PersonsModule {}
