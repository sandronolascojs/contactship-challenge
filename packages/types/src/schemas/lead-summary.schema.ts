import { z } from 'zod';

export const LeadSummarySchema = z.object({
  summary: z
    .string()
    .describe(
      'A concise summary of the lead profile highlighting key professional and personal characteristics',
    ),
  next_action: z
    .string()
    .describe('A specific, actionable next step for lead engagement and follow-up'),
});

export type LeadSummary = z.infer<typeof LeadSummarySchema>;
