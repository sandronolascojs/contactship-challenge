import { openai } from '@ai-sdk/openai';
import { createScorer } from '@mastra/core/scores';
import { z } from 'zod';
import { INTELLIGENCE_DEFAULT_MODEL } from '../../constants/ai.constants';

export const contactshipSummaryScorer = createScorer({
  name: 'Contactship Lead Summary Quality',
  description: 'Validates lead summary and next action quality for contact management',
  type: 'agent',
  judge: {
    model: openai(INTELLIGENCE_DEFAULT_MODEL),
    instructions: 'You are an expert evaluator for lead management and sales systems.',
  },
})
  .preprocess(({ run }) => {
    const output = run.output;
    const summaryData =
      typeof output === 'object' && output !== null && 'object' in output ? output.object : output;

    return {
      summaryData,
      hasObject: typeof output === 'object' && output !== null && 'object' in output,
    };
  })
  .analyze({
    description: 'Analyze lead summary for quality and actionability',
    outputSchema: z.object({
      isValidStructure: z.boolean(),
      hasSummary: z.boolean(),
      hasNextAction: z.boolean(),
      summaryQuality: z.enum(['excellent', 'good', 'fair', 'poor']),
      nextActionQuality: z.enum(['excellent', 'good', 'fair', 'poor']),
      summaryLength: z.number(),
      nextActionLength: z.number(),
      issues: z.array(z.string()),
    }),
    createPrompt: ({ results }) => {
      const { summaryData } = results.preprocessStepResult;
      return `Analyze this lead summary output for quality:

${JSON.stringify(summaryData, null, 2)}

Check:
1. Does it have the correct structure (summary, next_action)?
2. Is the summary meaningful and captures key lead information?
3. Is the next_action specific, actionable, and relevant?
4. Are both fields non-empty?
5. Is the length appropriate (summary: 50-300 chars, next_action: 20-150 chars)?

Rate summary quality:
- excellent: Comprehensive, well-structured, captures key details
- good: Informative, covers main points
- fair: Basic information present but lacks detail
- poor: Vague, incomplete, or irrelevant

Rate next_action quality:
- excellent: Specific, actionable, strategic
- good: Clear and actionable
- fair: Generic but valid action
- poor: Vague, unclear, or not actionable

Return JSON with:
- isValidStructure: boolean
- hasSummary: boolean
- hasNextAction: boolean
- summaryQuality: string (excellent/good/fair/poor)
- nextActionQuality: string (excellent/good/fair/poor)
- summaryLength: number
- nextActionLength: number
- issues: string[] (list of any problems found)`;
    },
  })
  .generateScore((context) => {
    const analysis = context.results.analyzeStepResult;

    if (!analysis.isValidStructure) {
      return 0;
    }

    let score = 0.2;

    if (analysis.hasSummary) {
      score += 0.15;
    }

    if (analysis.hasNextAction) {
      score += 0.15;
    }

    const qualityScores = {
      excellent: 1.0,
      good: 0.75,
      fair: 0.5,
      poor: 0.25,
    };

    const summaryScore = qualityScores[analysis.summaryQuality] ?? 0;
    const actionScore = qualityScores[analysis.nextActionQuality] ?? 0;

    score += summaryScore * 0.25;
    score += actionScore * 0.25;

    if (analysis.summaryLength >= 50 && analysis.summaryLength <= 300) {
      score += 0.05;
    }

    if (analysis.nextActionLength >= 20 && analysis.nextActionLength <= 150) {
      score += 0.05;
    }

    return Math.min(score, 1.0);
  })
  .generateReason({
    description: 'Generate explanation for the lead summary quality score',
    createPrompt: (context) => {
      const analysis = context.results.analyzeStepResult;
      return `Explain why this lead summary received a score of ${context.score.toFixed(2)}.

Analysis results:
- Valid structure: ${analysis.isValidStructure ?? false}
- Has summary: ${analysis.hasSummary ?? false}
- Has next_action: ${analysis.hasNextAction ?? false}
- Summary quality: ${analysis.summaryQuality ?? 'N/A'}
- Next action quality: ${analysis.nextActionQuality ?? 'N/A'}
- Summary length: ${analysis.summaryLength ?? 0} chars
- Next action length: ${analysis.nextActionLength ?? 0} chars
${analysis.issues.length > 0 ? `- Issues: ${analysis.issues.join(', ')}` : ''}

Provide a clear explanation of the score and actionable feedback for improvement.`;
    },
  });
