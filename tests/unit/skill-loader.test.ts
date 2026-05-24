import { describe, it, expect } from 'vitest';
import { FileSystemSkillLoader } from '../../src/runtime/skill-loader.js';
import { SkillRunnerError } from '../../src/core/errors.js';

describe('FileSystemSkillLoader', () => {
  const loader = new FileSystemSkillLoader('tests/fixtures/manifests');

  it('deve resolver uma fixture válida com o manifesto tipado', async () => {
    const manifest = await loader.load('usabilidade-valida');
    expect(manifest.id).toBe('usabilidade-valida');
    expect(manifest.version).toBe('1.0.0');
    expect(manifest.type).toBe('interactive');
    expect(manifest.inputs?.length).toBeGreaterThanOrEqual(1);
    expect(manifest.outputs?.length).toBeGreaterThanOrEqual(1);
  });

  it('deve rejeitar com SkillRunnerError se o id não existir (MANIFEST_NOT_FOUND)', async () => {
    try {
      await loader.load('nao-existe');
      expect.fail('Should have thrown an error');
    } catch (err: any) {
      expect(err).toBeInstanceOf(SkillRunnerError);
      expect(err.name).toBe('SkillRunnerError');
      expect(err.code).toBe('MANIFEST_NOT_FOUND');
      expect(err.details?.path).toContain('manifest.yaml');
    }
  });

  it('deve rejeitar com MANIFEST_INVALID se a fixture for inválida pelo schema', async () => {
    try {
      await loader.load('usabilidade-invalida');
      expect.fail('Should have thrown an error');
    } catch (err: any) {
      expect(err).toBeInstanceOf(SkillRunnerError);
      expect(err.name).toBe('SkillRunnerError');
      expect(err.code).toBe('MANIFEST_INVALID');
      expect(err.details?.issues).toBeDefined();
      expect((err.details.issues as unknown[]).length).toBeGreaterThan(0);
    }
  });

  it('deve rejeitar com MANIFEST_INVALID se a fixture for malformada (parse error)', async () => {
    try {
      await loader.load('usabilidade-malformada');
      expect.fail('Should have thrown an error');
    } catch (err: any) {
      expect(err).toBeInstanceOf(SkillRunnerError);
      expect(err.name).toBe('SkillRunnerError');
      expect(err.code).toBe('MANIFEST_INVALID');
      expect(err.details?.cause).toBeDefined();
    }
  });
});
