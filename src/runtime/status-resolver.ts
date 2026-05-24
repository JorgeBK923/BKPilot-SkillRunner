import type { ExecutionStatus, SkillRunnerErrorCode } from '../core/index.js';

export interface StatusResolverInput {
  error?: { code: SkillRunnerErrorCode };
  timedOut?: boolean;
  requiredOutputs: string[];
  producedOutputs: string[];
}

export function resolveStatus(input: StatusResolverInput): ExecutionStatus {
  if (input.timedOut === true || input.error?.code === 'EXECUTION_TIMEOUT') {
    return 'timeout';
  }

  if (input.error?.code === 'EXECUTION_CANCELLED') {
    return 'cancelled';
  }

  if (input.error !== undefined) {
    return 'failed';
  }

  const producedOutputNames = new Set(input.producedOutputs);
  const hasAllRequiredOutputs = input.requiredOutputs.every((outputName) =>
    producedOutputNames.has(outputName),
  );

  return hasAllRequiredOutputs ? 'completed' : 'partial';
}
