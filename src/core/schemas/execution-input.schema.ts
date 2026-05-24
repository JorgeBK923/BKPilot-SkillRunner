import { z } from 'zod';

export const executionInputOptionsSchema = z.object({
  timeout_override: z.number().int().positive().optional(),
  llm_override: z
    .object({
      provider: z.string().min(1).optional(),
      model: z.string().min(1).optional(),
    })
    .optional(),
  dry_run: z.boolean().optional(),
  output_dir: z.string().min(1).optional(),
});

export const executionInputSchema = z.object({
  execution_id: z.string().min(1),
  skill_id: z.string().min(1),
  inputs: z.record(z.unknown()),
  options: executionInputOptionsSchema.optional(),
});
