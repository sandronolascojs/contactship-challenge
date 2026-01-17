import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { DatabaseHealthIndicator } from './database-health-indicator';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly database: DatabaseHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    return this.health.check([async () => this.database.isHealthy('database')]);
  }

  @Get('readiness')
  @HealthCheck()
  async readiness() {
    return this.health.check([async () => this.database.isHealthy('database')]);
  }

  @Get('liveness')
  @HealthCheck()
  async liveness() {
    return this.health.check([]);
  }
}
