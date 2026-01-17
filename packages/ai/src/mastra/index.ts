import { Mastra } from '@mastra/core';
import { PinoLogger } from '@mastra/loggers';
import { contactshipAgent } from './agents';

export { Mastra } from '@mastra/core';
export type { Mastra as MastraType } from '@mastra/core';

export * from './agents';

export const mastra = new Mastra({
  agents: {
    [contactshipAgent.name]: contactshipAgent,
  },
  logger: new PinoLogger({
    name: 'contactship-ai',
    level: 'info',
  }),
});
