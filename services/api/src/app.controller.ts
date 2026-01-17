import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('root')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'API Information',
    description: 'Get basic API information and version',
  })
  @ApiResponse({
    status: 200,
    description: 'API information retrieved successfully',
    schema: {
      example: {
        name: 'ContactShip API',
        version: '1.0.0',
        description: 'API for managing leads and synchronization',
      },
    },
  })
  getInfo() {
    return this.appService.getApiInfo();
  }

  @Get('ping')
  @ApiOperation({
    summary: 'Ping endpoint',
    description: 'Check if the API is responding',
  })
  @ApiResponse({
    status: 200,
    description: 'API is responding',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  ping() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
