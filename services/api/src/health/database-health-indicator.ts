import { Injectable } from '@nestjs/common';
import { HealthIndicatorResult } from '@nestjs/terminus';
import { sql } from 'drizzle-orm';
import { DrizzleService } from '../database/drizzle.service';

@Injectable()
export class DatabaseHealthIndicator {
  constructor(private readonly drizzleService: DrizzleService) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.drizzleService.client.execute(sql`SELECT 1`);
      return {
        [key]: {
          status: 'up',
        },
      };
    } catch (error) {
      console.error(error);
      return {
        [key]: {
          status: 'down',
          message: error instanceof Error ? error.message : 'Database connection failed',
        },
      };
    }
  }
}
