import { z } from 'zod';

export const manifestTypeSchema = z.enum(['interactive', 'hybrid', 'pure_llm', 'script']);

export const llmProviderHintSchema = z.enum(['strong', 'balanced', 'cheap', 'any']);

export const manifestInputTypeSchema = z.enum([
  'string',
  'number',
  'boolean',
  'url',
  'file_path',
  'json',
]);

export const toolProviderSchema = z.enum([
  'playwright_native',
  'http_client',
  'node_script',
  'builtin',
]);

export const manifestOutputTypeSchema = z.enum(['markdown', 'json', 'png', 'mp4', 'xlsx', 'pdf']);

export const retryReasonSchema = z.enum(['llm_error', 'browser_error', 'timeout']);

export const manifestLlmSchema = z.object({
  provider_hint: llmProviderHintSchema,
  max_tokens: z.number().int().positive().optional(),
  temperature: z.number().min(0).max(2).optional(),
  system_prompt_file: z.string().min(1).optional(),
});

export const manifestInputSchema = z.object({
  name: z.string().min(1),
  type: manifestInputTypeSchema,
  required: z.boolean(),
  description: z.string().min(1),
  default: z.unknown().optional(),
  validation: z.string().min(1).optional(),
});

export const manifestToolSchema = z.object({
  id: z.string().min(1),
  provider: toolProviderSchema,
  config: z.record(z.unknown()).optional(),
});

export const manifestOutputSchema = z.object({
  name: z.string().min(1),
  type: manifestOutputTypeSchema,
  required: z.boolean(),
});

export const manifestRetrySchema = z.object({
  max_attempts: z.number().int().min(1).max(3).optional(),
  on: z.array(retryReasonSchema).optional(),
});

export const skillManifestSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().min(1),
  description: z.string().min(1).optional(),
  version: z.string().regex(/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/),
  type: manifestTypeSchema,
  llm: manifestLlmSchema,
  inputs: z.array(manifestInputSchema).min(1),
  tools: z.array(manifestToolSchema).optional(),
  outputs: z.array(manifestOutputSchema).min(1),
  timeout_seconds: z.number().int().positive().max(1800).optional(),
  retry: manifestRetrySchema.optional(),
  tags: z.array(z.string().min(1)).optional(),
  language: z.string().min(1).optional(),
});
