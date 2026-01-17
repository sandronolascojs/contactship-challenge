import type { InsertLead, SelectLead } from '@contactship/db/schema';
import { LeadSource, LeadStatus } from '@contactship/types';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AiService } from '../ai';
import { buildLeadKey, CacheService, DEFAULT_CACHE_TTL } from '../cache';
import type { PaginatedResponse } from '../common/interfaces/response.interface';
import { createPaginationMeta } from '../common/utils/pagination.utils';
import { PersonsService } from '../persons';
import type { CreateLeadDto } from './dto';
import { LeadsRepository, type FindLeadsOptions } from './repository';

@Injectable()
export class LeadsService {
  constructor(
    private readonly leadsRepository: LeadsRepository,
    private readonly personsService: PersonsService,
    private readonly cacheService: CacheService,
    private readonly aiService: AiService,
  ) {}

  async create(createLeadDto: CreateLeadDto): Promise<SelectLead> {
    const existingLead = await this.leadsRepository.findOneByEmail(createLeadDto.email);

    if (existingLead) {
      throw new ConflictException(`Lead with email ${createLeadDto.email} already exists`);
    }

    const person = await this.personsService.createFromLeadDto(createLeadDto);

    const leadData: InsertLead = {
      personId: person.id,
      email: createLeadDto.email,
      externalId: createLeadDto.externalId,
      source: createLeadDto.source,
      status: createLeadDto.status,
      metadata: createLeadDto.metadata,
    };

    return this.leadsRepository.create(leadData);
  }

  async findOneById(id: string): Promise<SelectLead> {
    const cacheKey = buildLeadKey(id);

    return this.cacheService.getOrSet(
      cacheKey,
      async () => this.leadsRepository.findOneById(id),
      DEFAULT_CACHE_TTL,
    );
  }

  async findMany(options: FindLeadsOptions = {}): Promise<PaginatedResponse<SelectLead>> {
    const result = await this.leadsRepository.findMany(options);

    const page = options.skip ? options.skip / (options.take || 10) + 1 : 1;
    const take = options.take || 10;

    const meta = createPaginationMeta({
      total: result.total,
      page,
      take,
    });

    return {
      data: result.leads,
      meta,
    };
  }

  async update(id: string, updateLeadDto: Partial<CreateLeadDto>): Promise<SelectLead> {
    const updateData: Partial<InsertLead> = {};

    if (updateLeadDto.source !== undefined) updateData.source = updateLeadDto.source;
    if (updateLeadDto.status !== undefined) updateData.status = updateLeadDto.status;
    if (updateLeadDto.metadata !== undefined) updateData.metadata = updateLeadDto.metadata;
    if (updateLeadDto.externalId !== undefined) updateData.externalId = updateLeadDto.externalId;
    if (updateLeadDto.email !== undefined) updateData.email = updateLeadDto.email;

    return this.leadsRepository.update(id, updateData);
  }

  async delete(id: string): Promise<SelectLead> {
    return this.leadsRepository.delete(id);
  }

  async getStatistics() {
    const total = await this.leadsRepository.count();
    const newLeads = await this.leadsRepository.countByStatus(LeadStatus.NEW);
    const contacted = await this.leadsRepository.countByStatus(LeadStatus.CONTACTED);
    const converted = await this.leadsRepository.countByStatus(LeadStatus.CONVERTED);

    return {
      total,
      new: newLeads,
      contacted,
      converted,
    };
  }

  async generateAndSaveSummary(leadId: string): Promise<SelectLead> {
    const lead = await this.leadsRepository.findOneById(leadId);

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${leadId} not found`);
    }

    const person = await this.personsService.findOneById(lead.personId);

    if (!person) {
      throw new NotFoundException(`Person with ID ${lead.personId} not found`);
    }

    const metadata = lead.metadata;

    const leadSummary = await this.aiService.generateLeadSummary({
      firstName: person.firstName,
      lastName: person.lastName,
      email: lead.email,
      phone: person.phone ?? undefined,
      location: person.address ? `${person.address.city}, ${person.address.country}` : undefined,
      profession: metadata?.profession as string | undefined,
      age: metadata?.age as number | undefined,
      picture: person.pictureUrl ?? undefined,
      source: lead.source === LeadSource.MANUAL ? 'manual' : 'randomuser',
    });

    const updatedLead = await this.leadsRepository.update(leadId, {
      summary: leadSummary.summary,
      nextAction: leadSummary.next_action,
      summaryGeneratedAt: new Date(),
    });

    const cacheKey = buildLeadKey(leadId);
    await this.cacheService.del(cacheKey);

    return updatedLead;
  }
}
