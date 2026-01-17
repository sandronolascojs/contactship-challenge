import type { LeadStatus } from '@contactship/types';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type { CreateLeadDto } from './dto';
import { LeadsService } from './leads.service';
import type { FindLeadsOptions } from './repository';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  async create(@Body() createLeadDto: CreateLeadDto) {
    return this.leadsService.create(createLeadDto);
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('take') take?: string,
    @Query('status') status?: LeadStatus,
    @Query('search') search?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const takeNumber = take ? parseInt(take, 10) : 10;
    const skip = (pageNumber - 1) * takeNumber;

    const options: FindLeadsOptions = {
      skip,
      take: takeNumber,
      status,
      search,
    };

    return this.leadsService.findMany(options);
  }

  @Get('statistics')
  async getStatistics() {
    return this.leadsService.getStatistics();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.leadsService.findOneById(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateLeadDto: Partial<CreateLeadDto>) {
    return this.leadsService.update(id, updateLeadDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.leadsService.delete(id);
  }
}
