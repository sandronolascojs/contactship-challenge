import { Global, Module } from '@nestjs/common';
import { getDb } from '@contactship/db';

export const DRIZZLE_PROVIDER = 'DRIZZLE_PROVIDER';

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE_PROVIDER,
      useFactory: () => getDb(),
    },
  ],
  exports: [DRIZZLE_PROVIDER],
})
export class DatabaseModule {}
