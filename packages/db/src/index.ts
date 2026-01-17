import type { ExtractTablesWithRelations } from 'drizzle-orm';
import { drizzle, NodePgQueryResultHKT } from 'drizzle-orm/node-postgres';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { Pool } from 'pg';
import * as schema from './schema';

const MAX_POOL_CONNECTIONS = 30;
const IDLE_TIMEOUT = 10000;
const CONNECTION_TIMEOUT = 10000;

let dbInstance: ReturnType<typeof drizzle> | null = null;
let poolInstance: Pool | null = null;

const getConnectionString = () => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return url;
};

export const getDb = () => {
  if (!dbInstance) {
    poolInstance = new Pool({
      connectionString: getConnectionString(),
      max: MAX_POOL_CONNECTIONS,
      idleTimeoutMillis: IDLE_TIMEOUT,
      connectionTimeoutMillis: CONNECTION_TIMEOUT,
    });

    dbInstance = drizzle(poolInstance, { schema: { ...schema } });
  }
  return dbInstance;
};

export type DrizzleDB = ReturnType<typeof drizzle>;
export type DrizzleTx = PgTransaction<
  NodePgQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;
export type DB = DrizzleDB | DrizzleTx;

export * from './schema';
