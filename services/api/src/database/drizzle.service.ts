import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE_PROVIDER } from './database.module';
import type { DB } from '@contactship/db';

@Injectable()
export class DrizzleService {
  constructor(@Inject(DRIZZLE_PROVIDER) private readonly db: DB) {}

  get client(): DB {
    return this.db;
  }
}
