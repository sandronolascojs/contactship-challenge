import { Controller, Get, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth';
import { SyncService } from './sync.service';

@ApiTags('sync')
@ApiBearerAuth('JWT-auth')
@Controller('sync')
@UseGuards(JwtAuthGuard)
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('trigger')
  @ApiOperation({
    summary: 'Trigger external lead sync',
    description: 'Manually trigger synchronization with the RandomUser API to fetch 10 new leads',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sync job triggered successfully',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Sync service error',
  })
  async triggerSync() {
    return this.syncService.triggerSyncExternalLeads('randomuser-api', 10);
  }

  @Get('jobs')
  @ApiOperation({
    summary: 'Get all sync jobs',
    description: 'Retrieve a list of synchronization jobs',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of jobs to return',
    example: 20,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sync jobs retrieved successfully',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async getJobs() {
    return this.syncService.getSyncJobs(20);
  }

  @Get('jobs/:id')
  @ApiOperation({
    summary: 'Get sync job by ID',
    description: 'Retrieve details of a specific synchronization job',
  })
  @ApiParam({
    name: 'id',
    description: 'Sync job ID (cuid)',
    example: 'clh1234567890abcdefghij',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sync job retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Sync job not found',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async getJobById(@Param('id') id: string) {
    return this.syncService.getSyncJobById(id);
  }
}
