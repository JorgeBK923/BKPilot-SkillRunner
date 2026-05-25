import path from 'node:path';
import { readFile } from 'node:fs/promises';

import { parse } from 'yaml';

import { SkillRunnerError, skillManifestSchema } from '../core/index.js';
import type { SkillManifest } from '../core/index.js';

export class FileSystemSkillLoader {
  constructor(private readonly skillsDir: string) {}

  async load(skillId: string): Promise<SkillManifest> {
    const manifestPath = path.join(this.skillsDir, skillId, 'manifest.yaml');

    let content: string;

    try {
      content = await readFile(manifestPath, 'utf-8');
    } catch (error) {
      if (isNodeError(error) && error.code === 'ENOENT') {
        throw new SkillRunnerError('MANIFEST_NOT_FOUND', undefined, {
          skillId,
          path: manifestPath,
        });
      }

      throw error;
    }

    let manifest: unknown;

    try {
      manifest = parse(content);
    } catch (cause) {
      throw new SkillRunnerError('MANIFEST_INVALID', undefined, { skillId, cause });
    }

    const result = skillManifestSchema.safeParse(manifest);

    if (!result.success) {
      throw new SkillRunnerError('MANIFEST_INVALID', undefined, {
        skillId,
        issues: result.error.issues,
      });
    }

    return result.data;
  }

  async loadReportTemplate(skillId: string): Promise<string | undefined> {
    const templatePath = path.join(this.skillsDir, skillId, 'report-template.md');

    try {
      return await readFile(templatePath, 'utf-8');
    } catch (cause) {
      if (isNodeError(cause) && cause.code === 'ENOENT') {
        return undefined;
      }

      throw new SkillRunnerError('REPORT_GENERATION_FAILED', undefined, { cause });
    }
  }
}

const isNodeError = (error: unknown): error is NodeJS.ErrnoException =>
  error instanceof Error && 'code' in error;
