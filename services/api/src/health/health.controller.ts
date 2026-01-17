import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { DatabaseHealthIndicator } from './database-health-indicator';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly database: DatabaseHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({
    summary: 'Health check',
    description: 'Check the overall health status of the application',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is healthy',
    schema: {
      example: {
        status: 'ok',
        info: {
          database: {
            status: 'up',
          },
        },
        error: {},
        details: {
          database: {
            status: 'up',
          },
        },
      },
    },
  })
  async check(): Promise<HealthCheckResult> {
    const databaseCheck = async (): Promise<HealthIndicatorResult> => {
      return this.database.isHealthy('database');
    };
    return this.health.check([databaseCheck]);
  }

  @Get('readiness')
  @HealthCheck()
  @ApiOperation({
    summary: 'Readiness check',
    description: 'Check if the application is ready to handle requests',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is ready',
    schema: {
      example: {
        status: 'ok',
        info: {
          database: {
            status: 'up',
          },
        },
        error: {},
        details: {
          database: {
            status: 'up',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 503, description: 'Service is not ready' })
  async readiness(): Promise<HealthCheckResult> {
    const databaseCheck = async (): Promise<HealthIndicatorResult> => {
      return this.database.isHealthy('database');
    };
    return this.health.check([databaseCheck]);
  }

  @Get('liveness')
  @HealthCheck()
  @ApiOperation({
    summary: 'Liveness check',
    description: 'Check if the application is alive',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is alive',
    schema: {
      example: {
        status: 'ok',
        info: {},
        error: {},
        details: {},
      },
    },
  })
  async liveness(): Promise<HealthCheckResult> {
    return this.health.check([]);
  }
}
