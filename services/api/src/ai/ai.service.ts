import { generateLeadSummary, type LeadSummary } from '@contactship/ai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '../cache';

@Injectable()
export class AiService {
  constructor(
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
  ) {}

  async generateLeadSummary(leadData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    location?: string;
    profession?: string;
    age?: number;
    picture?: string;
    source?: 'manual' | 'randomuser';
  }): Promise<LeadSummary> {
    const cacheKey = `ai:summary:${leadData.email}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        return generateLeadSummary(leadData);
      },
      86400,
    );
  }
}
