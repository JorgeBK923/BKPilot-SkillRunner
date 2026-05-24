import { describe, it, expect } from 'vitest';
import {
  skillManifestSchema,
  manifestTypeSchema,
  llmProviderHintSchema,
  manifestInputTypeSchema,
  toolProviderSchema,
  manifestOutputTypeSchema,
} from '../../src/core/schemas/manifest.schema.js';
import { executionInputSchema } from '../../src/core/schemas/execution-input.schema.js';
import { executionResultSchema, executionStatusSchema } from '../../src/core/schemas/result.schema.js';
import { executionLogSchema, logLevelSchema, executionPhaseSchema } from '../../src/core/schemas/execution-log.schema.js';
import {
  SKILL_RUNNER_ERROR_CODES,
  ERROR_MESSAGES,
  CLIENT_RETURNABLE_ERROR_CODES,
  SkillRunnerError,
} from '../../src/core/errors.js';

describe('Schemas and Errors validation against Specification', () => {

  // CAP-1: Ler o manifesto da skill
  describe('CAP-1: Manifest Schema (manifest.schema.ts)', () => {
    const validManifest = {
      id: 'usabilidade-teste',
      name: 'Teste de Usabilidade',
      version: '1.0.0',
      type: 'interactive',
      llm: {
        provider_hint: 'strong'
      },
      inputs: [
        {
          name: 'target_url',
          type: 'url',
          required: true,
          description: 'URL alvo'
        }
      ],
      outputs: [
        {
          name: 'report.md',
          type: 'markdown',
          required: true
        }
      ]
    };

    it('should validate a complete valid manifest', () => {
      expect(() => skillManifestSchema.parse(validManifest)).not.toThrow();
    });

    it('should reject when missing required fields (id, name, version, type, llm.provider_hint, >=1 input, >=1 output)', () => {
      const keys = ['id', 'name', 'version', 'type', 'llm', 'inputs', 'outputs'] as const;
      keys.forEach(key => {
        const invalid = { ...validManifest };
        delete (invalid as any)[key];
        expect(() => skillManifestSchema.parse(invalid)).toThrow();
      });

      // Also check llm.provider_hint specifically
      const invalidLlm = { ...validManifest, llm: {} };
      expect(() => skillManifestSchema.parse(invalidLlm)).toThrow();
      
      // inputs must be >= 1
      const invalidInputs = { ...validManifest, inputs: [] };
      expect(() => skillManifestSchema.parse(invalidInputs)).toThrow();

      // outputs must be >= 1
      const invalidOutputs = { ...validManifest, outputs: [] };
      expect(() => skillManifestSchema.parse(invalidOutputs)).toThrow();
    });

    it('should validate enums', () => {
      // type
      expect(() => manifestTypeSchema.parse('invalid')).toThrow();
      expect(() => manifestTypeSchema.parse('hybrid')).not.toThrow();

      // provider_hint
      expect(() => llmProviderHintSchema.parse('invalid')).toThrow();
      expect(() => llmProviderHintSchema.parse('balanced')).not.toThrow();

      // input.type
      expect(() => manifestInputTypeSchema.parse('invalid')).toThrow();
      expect(() => manifestInputTypeSchema.parse('string')).not.toThrow();

      // tool.provider
      expect(() => toolProviderSchema.parse('invalid')).toThrow();
      expect(() => toolProviderSchema.parse('builtin')).not.toThrow();

      // output.type
      expect(() => manifestOutputTypeSchema.parse('invalid')).toThrow();
      expect(() => manifestOutputTypeSchema.parse('png')).not.toThrow();
    });

    it('should validate regex of id (kebab) and version (semver)', () => {
      const invalidId = { ...validManifest, id: 'CamelCase' };
      expect(() => skillManifestSchema.parse(invalidId)).toThrow();
      
      const invalidId2 = { ...validManifest, id: 'with spaces' };
      expect(() => skillManifestSchema.parse(invalidId2)).toThrow();

      const invalidVersion = { ...validManifest, version: '1.0' };
      expect(() => skillManifestSchema.parse(invalidVersion)).toThrow();
    });

    it('should validate boundary limits of the manifest', () => {
      // timeout_seconds
      expect(() => skillManifestSchema.parse({ ...validManifest, timeout_seconds: 1800 })).not.toThrow();
      expect(() => skillManifestSchema.parse({ ...validManifest, timeout_seconds: 1801 })).toThrow();

      // retry.max_attempts
      expect(() => skillManifestSchema.parse({ ...validManifest, retry: { max_attempts: 1 } })).not.toThrow();
      expect(() => skillManifestSchema.parse({ ...validManifest, retry: { max_attempts: 3 } })).not.toThrow();
      expect(() => skillManifestSchema.parse({ ...validManifest, retry: { max_attempts: 0 } })).toThrow();
      expect(() => skillManifestSchema.parse({ ...validManifest, retry: { max_attempts: 5 } })).toThrow();

      // retry.on
      expect(() => skillManifestSchema.parse({ ...validManifest, retry: { on: ["llm_error", "browser_error", "timeout"] } })).not.toThrow();
      expect(() => skillManifestSchema.parse({ ...validManifest, retry: { on: ["invalid_error"] } })).toThrow();
    });

    it('should validate manifest with all optionals filled', () => {
      const fullManifest = {
        ...validManifest,
        description: 'Test description',
        tags: ['test', 'qa'],
        language: 'pt-BR',
        timeout_seconds: 1800,
        retry: {
          max_attempts: 3,
          on: ['browser_error']
        },
        llm: {
          provider_hint: 'strong',
          max_tokens: 1000,
          temperature: 0.5
        },
        tools: [
          {
            id: 'test_tool',
            name: 'test_tool',
            provider: 'builtin',
            config: {}
          }
        ]
      };
      expect(() => skillManifestSchema.parse(fullManifest)).not.toThrow();
    });
  });

  describe('Execution Input Schema (execution-input.schema.ts)', () => {
    const validInput = {
      execution_id: 'exec-123',
      skill_id: 'test-skill',
      inputs: {
        url: 'http://test.com'
      }
    };

    it('should validate a valid execution input', () => {
      expect(() => executionInputSchema.parse(validInput)).not.toThrow();
    });

    it('should reject invalid execution input (missing execution_id/skill_id, inputs not object)', () => {
      expect(() => executionInputSchema.parse({ ...validInput, execution_id: undefined })).toThrow();
      expect(() => executionInputSchema.parse({ ...validInput, skill_id: undefined })).toThrow();
      expect(() => executionInputSchema.parse({ ...validInput, inputs: 'not an object' })).toThrow();
    });

    it('should validate execution-input.options boundary limits', () => {
      const validOptions = {
        ...validInput,
        options: {
          timeout_override: 1000,
          llm_override: { provider_hint: 'strong' },
          dry_run: true,
          output_dir: './output'
        }
      };
      expect(() => executionInputSchema.parse(validOptions)).not.toThrow();

      const invalidOptions = {
        ...validInput,
        options: {
          timeout_override: -1
        }
      };
      expect(() => executionInputSchema.parse(invalidOptions)).toThrow();
    });
  });

  // CAP-8: Retornar completed ou failed (defines Result schema and Statuses)
  describe('CAP-8: Result Schema (result.schema.ts)', () => {
    const validResult = {
      execution_id: 'exec-123',
      skill_id: 'test-skill',
      status: 'completed',
      started_at: '2026-05-24T00:00:00Z',
      finished_at: '2026-05-24T00:05:00Z',
      duration_ms: 300000,
      outputs: [
        {
          name: 'report.md',
          type: 'markdown',
          path: './report.md',
          size_bytes: 1024
        }
      ]
    };

    it('should validate a valid result', () => {
      expect(() => executionResultSchema.parse(validResult)).not.toThrow();
    });

    it('should reject status outside enum', () => {
      expect(() => executionStatusSchema.parse('unknown_status')).toThrow();
      expect(() => executionResultSchema.parse({ ...validResult, status: 'unknown' })).toThrow();
    });

    it('should require started_at and finished_at to be ISO datetime', () => {
      expect(() => executionResultSchema.parse({ ...validResult, started_at: '2026-05-24' })).toThrow();
      expect(() => executionResultSchema.parse({ ...validResult, finished_at: '2026-05-24 10:00:00' })).toThrow();
    });

    it('should allow metrics to be optional', () => {
      const resultWithoutMetrics = { ...validResult };
      delete (resultWithoutMetrics as any).metrics;
      expect(() => executionResultSchema.parse(resultWithoutMetrics)).not.toThrow();
      
      const resultWithMetrics = {
        ...validResult,
        metrics: {
          llm_calls: 1,
          llm_tokens_in: 100,
          llm_tokens_out: 50,
          playwright_actions: 5,
          screenshots_taken: 1
        }
      };
      expect(() => executionResultSchema.parse(resultWithMetrics)).not.toThrow();
    });

    it('should reject negative numbers for size_bytes and metrics', () => {
      // outputFile.size_bytes negative
      const invalidSize = {
        ...validResult,
        outputs: [
          {
            ...validResult.outputs[0],
            size_bytes: -1
          }
        ]
      };
      expect(() => executionResultSchema.parse(invalidSize)).toThrow();

      // metrics with llm_calls negative
      const invalidMetrics = {
        ...validResult,
        metrics: {
          llm_calls: -1
        }
      };
      expect(() => executionResultSchema.parse(invalidMetrics)).toThrow();
    });

    it('should validate result.error when status is failed', () => {
      const validFailedResult = {
        ...validResult,
        status: 'failed',
        error: {
          code: 'LLM_TIMEOUT',
          message: 'Timeout occurred'
        }
      };
      expect(() => executionResultSchema.parse(validFailedResult)).not.toThrow();

      const invalidFailedResult = {
        ...validResult,
        status: 'failed',
        error: {
          code: 'NOT_A_VALID_CODE',
          message: 'Error'
        }
      };
      expect(() => executionResultSchema.parse(invalidFailedResult)).toThrow();
    });
  });

  // CAP-7: Salvar logs e evidências
  describe('CAP-7: Execution Log Schema (execution-log.schema.ts)', () => {
    const validLog = {
      execution_id: 'exec-123',
      skill_id: 'test-skill',
      events: [
        {
          timestamp: '2026-05-24T00:00:00Z',
          level: 'info',
          phase: 'init',
          message: 'Starting execution'
        }
      ]
    };

    it('should validate a valid execution log', () => {
      expect(() => executionLogSchema.parse(validLog)).not.toThrow();
    });

    it('should reject phase/level outside enum', () => {
      expect(() => logLevelSchema.parse('critical')).toThrow();
      expect(() => executionPhaseSchema.parse('unknown_phase')).toThrow();

      const invalidLog = {
        ...validLog,
        events: [
          { ...validLog.events[0], level: 'critical' }
        ]
      };
      expect(() => executionLogSchema.parse(invalidLog)).toThrow();
    });

    it('should validate events array', () => {
      const invalidLog = { ...validLog, events: 'not an array' };
      expect(() => executionLogSchema.parse(invalidLog)).toThrow();
    });
  });

  // CAP-8: Context for Errors
  describe('CAP-8: Errors (errors.ts)', () => {
    const SPEC_ERROR_CODES = [
      'MANIFEST_INVALID',
      'MANIFEST_NOT_FOUND',
      'INPUT_VALIDATION_FAILED',
      'BROWSER_LAUNCH_FAILED',
      'BROWSER_NAVIGATION_FAILED',
      'BROWSER_ACTION_FAILED',
      'BROWSER_TIMEOUT',
      'LLM_CALL_FAILED',
      'LLM_TIMEOUT',
      'LLM_RESPONSE_INVALID',
      'LLM_FALLBACK_EXHAUSTED',
      'REPORT_GENERATION_FAILED',
      'ARTIFACT_SAVE_FAILED',
      'EXECUTION_TIMEOUT',
      'EXECUTION_CANCELLED',
      'UNKNOWN_ERROR',
    ];

    const SPEC_CLIENT_RETURNABLE = [
      'INPUT_VALIDATION_FAILED',
      'BROWSER_NAVIGATION_FAILED',
      'BROWSER_ACTION_FAILED',
      'BROWSER_TIMEOUT',
      'EXECUTION_TIMEOUT',
      'EXECUTION_CANCELLED',
    ];

    it('should have exactly the 16 codes from spec section 7', () => {
      expect([...SKILL_RUNNER_ERROR_CODES].sort()).toEqual([...SPEC_ERROR_CODES].sort());
    });

    it('SkillRunnerError carries code, message, and details', () => {
      const err = new SkillRunnerError('UNKNOWN_ERROR', 'Custom message', { foo: 'bar' });
      expect(err.code).toBe('UNKNOWN_ERROR');
      expect(err.message).toBe('Custom message');
      expect(err.details).toEqual({ foo: 'bar' });

      const defaultErr = new SkillRunnerError('BROWSER_TIMEOUT');
      expect(defaultErr.code).toBe('BROWSER_TIMEOUT');
      expect(defaultErr.message).toBe(ERROR_MESSAGES['BROWSER_TIMEOUT']);
      expect(defaultErr.details).toBeUndefined();
    });

    it('should match the client returnable codes with the "Sim" column from spec', () => {
      expect([...CLIENT_RETURNABLE_ERROR_CODES].sort()).toEqual([...SPEC_CLIENT_RETURNABLE].sort());
    });
  });
});
