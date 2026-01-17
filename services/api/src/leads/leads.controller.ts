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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth';
import type { CreateLeadDto } from './dto';
import { LeadsService } from './leads.service';
import type { FindLeadsOptions } from './repository';

@ApiTags('leads')
@ApiBearerAuth('JWT-auth')
@Controller('leads')
@UseGuards(JwtAuthGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new lead',
    description: 'Create a new lead record in the system',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Lead created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async create(@Body() createLeadDto: CreateLeadDto) {
    return this.leadsService.create(createLeadDto);
  }

  @Post('create-lead')
  @ApiOperation({
    summary: 'Create a lead (alternative endpoint)',
    description: 'Alternative endpoint to create a new lead',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Lead created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async createLead(@Body() createLeadDto: CreateLeadDto) {
    return this.leadsService.create(createLeadDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all leads',
    description: 'Retrieve a paginated list of leads with optional filters',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
    example: 10,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['new', 'contacted', 'qualified', 'converted', 'lost'],
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by name or email',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Leads retrieved successfully',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
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
  @ApiOperation({
    summary: 'Get lead statistics',
    description: 'Retrieve statistics about leads grouped by status',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistics retrieved successfully',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async getStatistics() {
    return this.leadsService.getStatistics();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get lead by ID',
    description: 'Retrieve a single lead by its unique identifier',
  })
  @ApiParam({
    name: 'id',
    description: 'Lead ID (cuid)',
    example: 'clh1234567890abcdefghij',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lead retrieved successfully',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Lead not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async findOne(@Param('id') id: string) {
    return this.leadsService.findOneById(id);
  }

  @Post(':id/summarize')
  @ApiOperation({
    summary: 'Generate lead summary',
    description: 'Generate and save an AI-powered summary for lead',
  })
  @ApiParam({
    name: 'id',
    description: 'Lead ID (cuid)',
    example: 'clh1234567890abcdefghij',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Summary generated and saved successfully',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Lead not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Summary already exists for this lead',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'AI service error',
  })
  async generateSummary(@Param('id') id: string) {
    return this.leadsService.generateAndSaveSummary(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update lead',
    description: 'Update lead information partially',
  })
  @ApiParam({
    name: 'id',
    description: 'Lead ID (cuid)',
    example: 'clh1234567890abcdefghij',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lead updated successfully',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Lead not found' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async update(@Param('id') id: string, @Body() updateLeadDto: Partial<CreateLeadDto>) {
    return this.leadsService.update(id, updateLeadDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete lead',
    description: 'Permanently delete a lead from the system',
  })
  @ApiParam({
    name: 'id',
    description: 'Lead ID (cuid)',
    example: 'clh1234567890abcdefghij',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Lead deleted successfully',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Lead not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.leadsService.delete(id);
  }
}
