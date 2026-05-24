import { describe, it, expect } from 'vitest';
import { resolveStatus } from '../../src/runtime/status-resolver.js';
import type { SkillRunnerErrorCode } from '../../src/core/index.js';

describe('StatusResolver', () => {
  it('should resolve to timeout when timedOut is true', () => {
    expect(
      resolveStatus({
        timedOut: true,
        requiredOutputs: [],
        producedOutputs: [],
      }),
    ).toBe('timeout');
  });

  it('should resolve to timeout when error code is EXECUTION_TIMEOUT', () => {
    expect(
      resolveStatus({
        error: { code: 'EXECUTION_TIMEOUT' },
        requiredOutputs: [],
        producedOutputs: [],
      }),
    ).toBe('timeout');
  });

  it('should resolve to cancelled when error code is EXECUTION_CANCELLED', () => {
    expect(
      resolveStatus({
        error: { code: 'EXECUTION_CANCELLED' },
        requiredOutputs: [],
        producedOutputs: [],
      }),
    ).toBe('cancelled');
  });

  it('should resolve to failed for technical errors like LLM_CALL_FAILED', () => {
    expect(
      resolveStatus({
        error: { code: 'LLM_CALL_FAILED' as SkillRunnerErrorCode },
        requiredOutputs: [],
        producedOutputs: [],
      }),
    ).toBe('failed');
  });

  it('should resolve to completed when all requiredOutputs are in producedOutputs', () => {
    expect(
      resolveStatus({
        requiredOutputs: ['report.md', 'screenshot.png'],
        producedOutputs: ['report.md', 'screenshot.png', 'extra.txt'],
      }),
    ).toBe('completed');
  });

  it('should resolve to partial when >=1 required output is missing', () => {
    expect(
      resolveStatus({
        requiredOutputs: ['report.md', 'screenshot.png'],
        producedOutputs: ['report.md'],
      }),
    ).toBe('partial');
  });

  it('should resolve to completed when requiredOutputs is empty and there is no error', () => {
    expect(
      resolveStatus({
        requiredOutputs: [],
        producedOutputs: ['log.txt'],
      }),
    ).toBe('completed');
  });

  it('should resolve to failed due to precedence (error technical + missing output = failed)', () => {
    expect(
      resolveStatus({
        error: { code: 'LLM_CALL_FAILED' as SkillRunnerErrorCode },
        requiredOutputs: ['report.md'],
        producedOutputs: [], // missing output, normally 'partial', but error wins
      }),
    ).toBe('failed');
  });
});
