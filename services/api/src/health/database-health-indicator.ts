import { Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { DrizzleService } from '../database/drizzle.service';

interface HealthCheckResultType {
  [key: string]: {
    status: 'up' | 'down';
    message?: string;
  };
}

@Injectable()
export class DatabaseHealthIndicator {
  constructor(private readonly drizzleService: DrizzleService) {}

  async isHealthy(key: string) {
    try {
      await this.drizzleService.client.execute(sql`SELECT 1`);
      const result: HealthCheckResultType = {
        [key]: {
          status: 'up',
        },
      };
      return result;
    } catch (error) {
      console.error(error);
      const result: HealthCheckResultType = {
        [key]: {
          status: 'down',
          message:
            error instanceof Error
              ? error.message
              : 'Database connection failed',
        },
      };
      return result;
    }
  }
}
