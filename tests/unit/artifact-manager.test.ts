import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as os from 'node:os';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { LocalArtifactManager } from '../../src/runtime/artifact-manager.js';
import {
  executionResultSchema,
  executionLogSchema,
  SkillRunnerError,
} from '../../src/core/index.js';
import type { ExecutionResult, ExecutionLog } from '../../src/core/index.js';

describe('LocalArtifactManager', () => {
  let tempBaseDir: string;
  let artifactManager: LocalArtifactManager;
  const testExecutionId = 'gate0-test';

  beforeAll(async () => {
    tempBaseDir = await fs.mkdtemp(path.join(os.tmpdir(), 'skill-runner-test-'));
    artifactManager = new LocalArtifactManager(tempBaseDir);
  });

  afterAll(async () => {
    await fs.rm(tempBaseDir, { recursive: true, force: true });
  });

  it('should create the execution directory via ensureDir', async () => {
    const dirPath = await artifactManager.ensureDir(testExecutionId);
    const stats = await fs.stat(dirPath);
    expect(stats.isDirectory()).toBe(true);
  });

  it('should write result and return valid OutputFile when given valid ExecutionResult', async () => {
    const validResult: ExecutionResult = {
      execution_id: testExecutionId,
      skill_id: 'test-skill',
      status: 'completed',
      started_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
      duration_ms: 100,
      outputs: [],
    };

    const outputFile = await artifactManager.writeResult(validResult);

    expect(outputFile.name).toBe('result.json');
    expect(outputFile.type).toBe('json');
    expect(outputFile.size_bytes).toBeGreaterThan(0);

    // Verify file exists and size matches
    const stats = await fs.stat(outputFile.path);
    expect(stats.size).toBe(outputFile.size_bytes);

    // Re-read file and validate against schema
    const fileContent = await fs.readFile(outputFile.path, 'utf-8');
    const parsedContent = JSON.parse(fileContent);
    const validationResult = executionResultSchema.safeParse(parsedContent);
    expect(validationResult.success).toBe(true);
  });

  it('should write log and return valid OutputFile when given valid ExecutionLog', async () => {
    const validLog: ExecutionLog = {
      execution_id: testExecutionId,
      skill_id: 'test-skill',
      events: [
        {
          timestamp: new Date().toISOString(),
          level: 'info',
          phase: 'init',
          message: 'Execution started',
        },
      ],
    };

    const outputFile = await artifactManager.writeLog(validLog);

    expect(outputFile.name).toBe('execution-log.json');
    expect(outputFile.type).toBe('json');
    expect(outputFile.size_bytes).toBeGreaterThan(0);

    // Verify file exists and size matches
    const stats = await fs.stat(outputFile.path);
    expect(stats.size).toBe(outputFile.size_bytes);

    // Re-read file and validate against schema
    const fileContent = await fs.readFile(outputFile.path, 'utf-8');
    const parsedContent = JSON.parse(fileContent);
    const validationResult = executionLogSchema.safeParse(parsedContent);
    expect(validationResult.success).toBe(true);
  });

  it('should throw ARTIFACT_SAVE_FAILED with issues when writeResult receives invalid object', async () => {
    const invalidResult = {
      execution_id: testExecutionId,
      skill_id: 'test-skill',
      status: 'INVALID_STATUS_XYZ', // invalid enum
      started_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
      duration_ms: 100,
      outputs: [],
    } as unknown as ExecutionResult;

    await expect(artifactManager.writeResult(invalidResult)).rejects.toThrowError(
      SkillRunnerError
    );

    try {
      await artifactManager.writeResult(invalidResult);
    } catch (error: any) {
      expect(error.code).toBe('ARTIFACT_SAVE_FAILED');
      expect(error.details?.issues).toBeDefined();
    }
  });

  it('should correctly handle writeArtifact with a Buffer', async () => {
    const bufferContent = Buffer.from('fake-png-bytes', 'utf-8');
    const outputFile = await artifactManager.writeArtifact(
      testExecutionId,
      'test-image.png',
      bufferContent,
      'image/png'
    );

    expect(outputFile.name).toBe('test-image.png');
    expect(outputFile.type).toBe('image/png');
    expect(outputFile.size_bytes).toBe(bufferContent.length);

    const stats = await fs.stat(outputFile.path);
    expect(stats.size).toBe(outputFile.size_bytes);
  });
});
