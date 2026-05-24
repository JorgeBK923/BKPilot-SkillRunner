import { z } from 'zod';

export const logLevelSchema = z.enum(['info', 'warn', 'error', 'debug']);

export const executionPhaseSchema = z.enum([
  'init',
  'browser',
  'llm',
  'report',
  'artifact',
  'cleanup',
]);

export const logEventSchema = z.object({
  timestamp: z.string().datetime({ offset: true }),
  level: logLevelSchema,
  phase: executionPhaseSchema,
  message: z.string().min(1),
  data: z.unknown().optional(),
});

export const executionLogSchema = z.object({
  execution_id: z.string().min(1),
  skill_id: z.string().min(1),
  events: z.array(logEventSchema),
});
