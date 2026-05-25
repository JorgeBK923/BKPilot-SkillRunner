import { describe, it, expect } from 'vitest';
import { MockLLMClient } from '../../src/llm/mock-llm-client.js';

describe('MockLLMClient', () => {
  it('should return default response successfully without network calls', async () => {
    const client = new MockLLMClient();
    const request = {
      prompt: 'Test prompt',
      systemPrompt: 'System prompt',
    };

    const response = await client.complete(request);

    expect(response.content).not.toBe('');
    expect(response.model_used).toBe('mock-model');
    expect(response.tokens_in).toBeGreaterThan(0);
    expect(response.tokens_out).toBeGreaterThan(0);
    expect(response.latency_ms).toBeGreaterThanOrEqual(0);
  });

  it('should throw SkillRunnerError with LLM_CALL_FAILED when custom response file is missing', async () => {
    const client = new MockLLMClient({ responseFilePath: 'nao/existe.md' });
    const request = { prompt: 'Test prompt' };

    await expect(client.complete(request)).rejects.toHaveProperty('code', 'LLM_CALL_FAILED');
  });
});
