import type { InsertLead, SelectLead } from '@contactship/db/schema';
import { LeadStatus } from '@contactship/types';
import { ConflictException, Injectable } from '@nestjs/common';
import { buildLeadKey, CacheService, DEFAULT_CACHE_TTL } from '../cache';
import { PersonsService } from '../persons';
import type { CreateLeadDto } from './dto';
import { LeadsRepository, type FindLeadsOptions } from './repository';

@Injectable()
export class LeadsService {
  constructor(
    private readonly leadsRepository: LeadsRepository,
    private readonly personsService: PersonsService,
    private readonly cacheService: CacheService,
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

  async findMany(options: FindLeadsOptions = {}) {
    return this.leadsRepository.findMany(options);
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
}
