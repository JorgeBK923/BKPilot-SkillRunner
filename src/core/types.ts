import type { z } from 'zod';

import type {
  manifestInputSchema,
  manifestInputTypeSchema,
  manifestLlmSchema,
  manifestOutputSchema,
  manifestOutputTypeSchema,
  manifestRetrySchema,
  manifestToolSchema,
  manifestTypeSchema,
  retryReasonSchema,
  skillManifestSchema,
  toolProviderSchema,
} from './schemas/manifest.schema.js';
import type {
  executionInputOptionsSchema,
  executionInputSchema,
} from './schemas/execution-input.schema.js';
import type {
  executionErrorSchema,
  executionMetricsSchema,
  executionResultSchema,
  executionStatusSchema,
  outputFileSchema,
} from './schemas/result.schema.js';
import type {
  executionLogSchema,
  executionPhaseSchema,
  logEventSchema,
  logLevelSchema,
} from './schemas/execution-log.schema.js';

export type ManifestType = z.infer<typeof manifestTypeSchema>;
export type LlmProviderHint = z.infer<typeof manifestLlmSchema>['provider_hint'];
export type ManifestInputType = z.infer<typeof manifestInputTypeSchema>;
export type ToolProvider = z.infer<typeof toolProviderSchema>;
export type ManifestOutputType = z.infer<typeof manifestOutputTypeSchema>;
export type RetryReason = z.infer<typeof retryReasonSchema>;
export type ManifestLlm = z.infer<typeof manifestLlmSchema>;
export type ManifestInput = z.infer<typeof manifestInputSchema>;
export type ManifestTool = z.infer<typeof manifestToolSchema>;
export type ManifestOutput = z.infer<typeof manifestOutputSchema>;
export type ManifestRetry = z.infer<typeof manifestRetrySchema>;
export type SkillManifest = z.infer<typeof skillManifestSchema>;

export type ExecutionInputOptions = z.infer<typeof executionInputOptionsSchema>;
export type ExecutionInput = z.infer<typeof executionInputSchema>;

export type ExecutionStatus = z.infer<typeof executionStatusSchema>;
export type OutputFile = z.infer<typeof outputFileSchema>;
export type ExecutionError = z.infer<typeof executionErrorSchema>;
export type ExecutionMetrics = z.infer<typeof executionMetricsSchema>;
export type ExecutionResult = z.infer<typeof executionResultSchema>;

export type LogLevel = z.infer<typeof logLevelSchema>;
export type ExecutionPhase = z.infer<typeof executionPhaseSchema>;
export type LogEvent = z.infer<typeof logEventSchema>;
export type ExecutionLog = z.infer<typeof executionLogSchema>;

export type { SkillRunnerErrorCode } from './errors.js';
