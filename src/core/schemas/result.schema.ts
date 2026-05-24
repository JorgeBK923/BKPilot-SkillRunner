import { z } from 'zod';

import { SKILL_RUNNER_ERROR_CODES } from '../errors.js';

export const executionStatusSchema = z.enum([
  'completed',
  'failed',
  'timeout',
  'cancelled',
  'partial',
]);

export const outputFileSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  path: z.string().min(1),
  size_bytes: z.number().int().nonnegative(),
});

export const executionErrorSchema = z.object({
  code: z.enum(SKILL_RUNNER_ERROR_CODES),
  message: z.string().min(1),
  details: z.unknown().optional(),
});

export const executionMetricsSchema = z.object({
  llm_calls: z.number().int().nonnegative(),
  llm_tokens_in: z.number().int().nonnegative(),
  llm_tokens_out: z.number().int().nonnegative(),
  llm_cost_usd: z.number().nonnegative().optional(),
  playwright_actions: z.number().int().nonnegative(),
  screenshots_taken: z.number().int().nonnegative(),
});

export const executionResultSchema = z.object({
  execution_id: z.string().min(1),
  skill_id: z.string().min(1),
  status: executionStatusSchema,
  started_at: z.string().datetime({ offset: true }),
  finished_at: z.string().datetime({ offset: true }),
  duration_ms: z.number().int().nonnegative(),
  outputs: z.array(outputFileSchema),
  error: executionErrorSchema.optional(),
  metrics: executionMetricsSchema.optional(),
});
