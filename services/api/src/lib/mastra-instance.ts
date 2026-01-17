import { contactshipAgent } from '@contactship/ai';
import { Mastra } from '@mastra/core';
import { PinoLogger } from '@mastra/loggers';

const mastraInstance: Mastra | null = null;

export const mastra = new Mastra({
  agents: {
    [contactshipAgent.name]: contactshipAgent,
  },
  logger: new PinoLogger({
    name: 'contactship-api',
    level: 'info',
  }),
});
