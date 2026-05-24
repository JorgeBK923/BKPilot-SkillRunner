import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  executionLogSchema,
  executionResultSchema,
  outputFileSchema,
  SkillRunnerError,
} from '../core/index.js';
import type { ExecutionLog, ExecutionResult, OutputFile } from '../core/index.js';

export class LocalArtifactManager {
  constructor(private readonly baseDir: string) {}

  async ensureDir(executionId: string): Promise<string> {
    const dirPath = this.executionDir(executionId);

    try {
      await mkdir(dirPath, { recursive: true });
    } catch (cause) {
      throw new SkillRunnerError('ARTIFACT_SAVE_FAILED', undefined, { cause });
    }

    return dirPath;
  }

  async writeResult(result: ExecutionResult): Promise<OutputFile> {
    const parsed = executionResultSchema.safeParse(result);

    if (!parsed.success) {
      throw new SkillRunnerError('ARTIFACT_SAVE_FAILED', undefined, {
        issues: parsed.error.issues,
      });
    }

    const content = JSON.stringify(parsed.data, null, 2);

    return this.writeArtifact(parsed.data.execution_id, 'result.json', content, 'json');
  }

  async writeLog(log: ExecutionLog): Promise<OutputFile> {
    const parsed = executionLogSchema.safeParse(log);

    if (!parsed.success) {
      throw new SkillRunnerError('ARTIFACT_SAVE_FAILED', undefined, {
        issues: parsed.error.issues,
      });
    }

    const content = JSON.stringify(parsed.data, null, 2);

    return this.writeArtifact(parsed.data.execution_id, 'execution-log.json', content, 'json');
  }

  async writeArtifact(
    executionId: string,
    name: string,
    content: string | Buffer,
    type: string,
  ): Promise<OutputFile> {
    const dirPath = await this.ensureDir(executionId);
    const artifactPath = path.join(dirPath, name);

    try {
      await writeFile(artifactPath, content);
    } catch (cause) {
      throw new SkillRunnerError('ARTIFACT_SAVE_FAILED', undefined, { cause });
    }

    const outputFile = {
      name,
      type,
      path: artifactPath,
      size_bytes: Buffer.isBuffer(content) ? content.length : Buffer.byteLength(content),
    };

    const parsed = outputFileSchema.safeParse(outputFile);

    if (!parsed.success) {
      throw new SkillRunnerError('ARTIFACT_SAVE_FAILED', undefined, {
        issues: parsed.error.issues,
      });
    }

    return parsed.data;
  }

  private executionDir(executionId: string): string {
    return path.join(this.baseDir, executionId);
  }
}
