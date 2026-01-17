# Contactship Agent

AI-powered lead analysis agent for Contactship-mini challenge. This agent generates professional summaries and action plans for lead management.

## Installation

```bash
pnpm add @contactship/ai
```

## Usage

### Basic Usage

```typescript
import { generateLeadSummary } from '@contactship/ai/agents';
import type { LeadData, LeadSummary } from '@contactship/ai/agents';

const leadData: LeadData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1 555-123-4567',
  location: 'San Francisco, CA',
  profession: 'Software Engineer',
  age: 32,
  source: 'manual',
};

const summary: LeadSummary = await generateLeadSummary(leadData);

console.log(summary.summary);
// "Senior Software Engineer with 10+ years experience in full-stack development..."

console.log(summary.next_action);
// "Schedule a 15-minute discovery call to discuss partnership opportunities"
```

### Using Mastra Instance

For more advanced usage with memory, tools, and workflows, create a Mastra instance:

```typescript
import { mastra } from '@contactship/ai/mastra';

const result = await mastra
  .getAgent('Contactship Lead Analyzer')
  .generate('Analyze this lead: John Doe, Software Engineer, john@example.com', {
    output: {
      summary: 'string',
      next_action: 'string',
    },
  });
```

### Using Runtime Context

Pass additional context to the agent using `RuntimeContext`:

```typescript
import { RuntimeContext } from '@mastra/core/runtime-context';
import { generateLeadSummary } from '@contactship/ai/agents';

const context = new RuntimeContext({
  userId: '123',
  companyId: '456',
  userTier: 'enterprise',
});

const summary = await generateLeadSummary(leadData);

// The agent will have access to this context through its runtime context
```

## Lead Data Schema

```typescript
type LeadData = {
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
```

## Lead Summary Schema

```typescript
type LeadSummary = {
  summary: string;
  next_action: string;
};
```

## Scoring

The agent includes a built-in scorer (`contactshipSummaryScorer`) that evaluates the quality of generated summaries:

- **Structure Validation**: Ensures correct JSON format
- **Content Quality**: Rates summary and next action (excellent/good/fair/poor)
- **Length Validation**: Checks appropriate character counts
- **Actionability**: Verifies next action is specific and executable

Run evaluations:

```typescript
import { contactshipSummaryScorer } from '@contactship/ai/scorers';

const result = await contactshipSummaryScorer.run({
  input: { ... },
  output: { ... },
  runId: 'test-123',
});
```

## Configuration

The agent uses the following environment variables:

- `OPENAI_API_KEY`: Required for OpenAI model access
- `INTELLIGENCE_DEFAULT_MODEL`: Model to use (default: gpt-4o-mini)

## Best Practices

1. **Provide Rich Data**: Include as much lead information as possible for better analysis
2. **Use Context**: Leverage `RuntimeContext` to pass user/company-specific context
3. **Handle Errors**: Always wrap calls in try/catch and handle appropriately
4. **Cache Results**: Store generated summaries to avoid repeated API calls
5. **Validate Input**: Ensure required fields (firstName, lastName, email) are present

## Examples

### Manual Lead Entry

```typescript
await generateLeadSummary({
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane.smith@company.com',
  profession: 'Marketing Director',
  location: 'New York, NY',
  source: 'manual',
});
```

### RandomUser API Import

```typescript
await generateLeadSummary({
  firstName: 'Carlos',
  lastName: 'García',
  email: 'carlos.garcia@email.com',
  profession: 'Data Scientist',
  location: 'Madrid, Spain',
  age: 29,
  source: 'randomuser',
});
```

## Architecture

This agent follows Mastra's architecture patterns:

- **Agent-based**: Extends `Agent` from `@mastra/core/agent`
- **Zod Schemas**: Type-safe structured output using Zod
- **No Manual Parsing**: Leverages Mastra's built-in structured output handling
- **Clean Prompts**: Professional, detailed instructions in English
- **Scalable**: Can be integrated with workflows, tools, and memory

## License

ISC
