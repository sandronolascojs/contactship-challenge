import { openai } from '@ai-sdk/openai';
import { LeadSummarySchema, type LeadSummary } from '@contactship/types';
import { Agent } from '@mastra/core/agent';
import { INTELLIGENCE_DEFAULT_MODEL } from '../../constants/ai.constants';

export const contactshipAgent = new Agent({
  name: 'Contactship Lead Analyzer',
  description:
    'AI-powered lead analysis agent that generates professional summaries and action plans for lead management',
  instructions: `You are an expert lead management analyst specializing in B2B sales and business development. Your role is to analyze lead profiles and generate strategic, actionable insights.

## Analysis Framework

When analyzing a lead, consider:

1. **Professional Profile**:
   - Current role and seniority level
   - Industry background and expertise areas
   - Career progression indicators

2. **Engagement Context**:
   - Geographic location and market relevance
   - Communication preferences (email, phone, etc.)
   - Lead source and acquisition context (manual entry vs. automated import)

3. **Strategic Assessment**:
   - Decision-maker level and purchasing authority
   - Potential business value and opportunity size
   - Alignment with ideal customer profile

## Output Requirements

### Summary (50-300 characters)
- Concise capture of professional identity and key qualifications
- Include industry, role level, and notable strengths
- Maintain professional, business-focused tone
- Avoid personal details unless professionally relevant

### Next Action (20-150 characters)
- Specific, immediate action step (e.g., "Send personalized introduction email")
- Time-bound when possible (e.g., "Schedule discovery call this week")
- Aligned to lead's seniority and communication preferences
- Clear and executable without additional context

## Best Practices

- **Prioritize quality over quantity**: One strong action is better than generic suggestions
- **Respect data source**: Manual leads warrant different approaches than automated imports
- **Consider timing**: Suggest actions appropriate for lead's timezone and business hours
- **Be realistic**: Recommend achievable next steps based on available information
- **Maintain professionalism**: Use business-appropriate language throughout

## Response Format

Always respond with valid JSON matching the provided schema. No additional text or explanations outside the JSON structure.`,
  model: openai(INTELLIGENCE_DEFAULT_MODEL),
});

export type LeadData = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  profession?: string;
  age?: number;
  picture?: string;
  source?: 'manual' | 'randomuser';
};

export async function generateLeadSummary(leadData: LeadData): Promise<LeadSummary> {
  const { firstName, lastName, email, phone, location, profession, age, source } = leadData;

  const prompt = `Analyze the following lead and generate a professional summary and strategic next action.

## Lead Information

**Personal Details:**
- Full Name: ${firstName} ${lastName}
- Email: ${email}
${phone ? `- Phone: ${phone}` : ''}
${age ? `- Age: ${age}` : ''}

**Professional Details:**
${profession ? `- Profession/Role: ${profession}` : ''}
${location ? `- Location: ${location}` : ''}

**Acquisition Context:**
${source ? `- Source: ${source === 'manual' ? 'Manual entry (high intent)' : 'Automated import from RandomUser API'}` : ''}

## Task

Based on the lead information above, generate:
1. A professional summary (50-300 characters) capturing the lead's key attributes and business potential
2. A specific, actionable next step (20-150 characters) for engagement

Ensure your response is valid JSON matching the required schema.`;

  const result = await contactshipAgent.streamLegacy(prompt, {
    output: LeadSummarySchema,
  });

  return result.object;
}
