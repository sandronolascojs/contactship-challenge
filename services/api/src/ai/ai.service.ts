import { contactshipAgent } from '@contactship/ai';
import { LeadSummarySchema, type LeadSummary } from '@contactship/types';
import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from '../cache';
import { mastra } from '../lib/mastra-instance';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly cacheService: CacheService) {}

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

    this.logger.log(`[AI_SUMMARY] Checking cache for key: ${cacheKey}`);

    const cached = await this.cacheService.get<LeadSummary>(cacheKey);
    if (cached) {
      this.logger.log(`[AI_SUMMARY] Cache hit for key: ${cacheKey}`);
      return cached;
    }

    this.logger.log(`[AI_SUMMARY] Cache miss for key: ${cacheKey}, generating summary...`);

    try {
      this.logger.debug(`[AI_SUMMARY] Getting agent: ${contactshipAgent.name}`);

      const agent = mastra.getAgent(contactshipAgent.name);
      if (!agent) {
        throw new Error(`Agent ${contactshipAgent.name} not found in Mastra instance`);
      }

      const userMessage = this.buildLeadContextMessage(leadData);

      const result = await agent.generateLegacy(userMessage, { output: LeadSummarySchema });
      const summary = result.object;

      await this.cacheService.set(cacheKey, summary, 86400);
      this.logger.log(`[AI_SUMMARY] Cached summary for key: ${cacheKey}`);

      return summary;
    } catch (error) {
      console.error(error);
      this.logger.error(
        `[AI_SUMMARY] Failed to generate summary for ${leadData.email}`,
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  private buildLeadContextMessage(leadData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    location?: string;
    profession?: string;
    age?: number;
    picture?: string;
    source?: 'manual' | 'randomuser';
  }): string {
    const { firstName, lastName, email, phone, location, profession, age, source } = leadData;

    const personalDetails = `**Personal Details:**
- Full Name: ${firstName} ${lastName}
- Email: ${email}
${phone ? `- Phone: ${phone}` : ''}
${age ? `- Age: ${age}` : ''}

**Professional Details:**
${profession ? `- Profession/Role: ${profession}` : ''}
${location ? `- Location: ${location}` : ''}

**Acquisition Context:**
${
  source
    ? `- Source: ${
        source === 'manual' ? 'Manual entry (high intent)' : 'Automated import from RandomUser API'
      }`
    : ''
}`;

    return `Analyze the following lead information and generate a professional summary and strategic next action.

${personalDetails}

## Task

Based on the lead information above, generate:
1. A professional summary (50-300 characters) capturing the lead's key attributes and business potential
2. A specific, actionable next step (20-150 characters) for engagement`;
  }
}
