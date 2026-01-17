import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth';
import { SyncService } from './sync.service';

@Controller('sync')
@UseGuards(JwtAuthGuard)
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('trigger')
  async triggerSync() {
    return this.syncService.triggerSyncExternalLeads('randomuser-api', 10);
  }

  @Get('jobs')
  async getJobs() {
    return this.syncService.getSyncJobs(20);
  }

  @Get('jobs/:id')
  async getJobById(@Param('id') id: string) {
    return this.syncService.getSyncJobById(id);
  }
}
