import { describe, it, expect } from 'vitest';
import { generateReport } from '../../src/runtime/report-generator.js';

describe('generateReport', () => {
  const defaultInput = {
    skillId: 'test-skill',
    targetUrl: 'https://example.com',
    llm: { content: 'Test LLM content', modelUsed: 'test-model' },
  };

  it('should generate a generic report correctly', () => {
    const result = generateReport(defaultInput);

    expect(result).toContain('## Cabecalho');
    expect(result).toContain('## Analise');
    expect(result).toContain('## Conclusao');
    expect(result.length).toBeGreaterThan(100);
    expect(result).toContain(defaultInput.skillId);
    expect(result).toContain(defaultInput.targetUrl);
    expect(result).not.toContain('{{');
    expect(result).not.toContain('<n>');
  });

  it('should process templates and remove orphaned placeholders', () => {
    const template = 'Skill: {{skill_id}} | Missing: {{nao_existe}} | URL: {{target_url}}';
    const input = {
      ...defaultInput,
      template,
    };

    const result = generateReport(input);

    expect(result).not.toContain('{{');
    expect(result).toContain(`Skill: ${defaultInput.skillId}`);
    expect(result).toContain(`URL: ${defaultInput.targetUrl}`);
    expect(result).toContain('Missing:  |'); // The placeholder should be replaced with empty string
  });
});
