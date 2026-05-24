import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { SkillRunnerError } from '../core/index.js';
import type { LLMClient, LLMRequest, LLMResponse } from './llm-client.interface.js';

export interface MockLLMClientOptions {
  responseFilePath?: string;
  model?: string;
}

const DEFAULT_RESPONSE_FILE_PATH = 'tests/fixtures/llm-responses/usabilidade.md';
const DEFAULT_MODEL = 'mock-model';
const DEFAULT_RESPONSE = `# Analise de Usabilidade

## Achados
- Fluxo principal claro, com oportunidade de melhorar feedback visual.
- Mensagens de erro devem indicar como corrigir o problema.
- Elementos interativos precisam manter consistencia de rotulos.

## Conclusao
A experiencia e adequada para uma validacao inicial, com ajustes pontuais recomendados.
`;

const estimateTokens = (text: string): number => Math.max(1, Math.ceil(text.trim().split(/\s+/u).length * 1.33));

export class MockLLMClient implements LLMClient {
  private readonly responseFilePath: string;

  private readonly model: string;

  private readonly hasCustomResponseFilePath: boolean;

  constructor(options: MockLLMClientOptions = {}) {
    this.responseFilePath = options.responseFilePath ?? DEFAULT_RESPONSE_FILE_PATH;
    this.model = options.model ?? DEFAULT_MODEL;
    this.hasCustomResponseFilePath = options.responseFilePath !== undefined;
  }

  async complete(request: LLMRequest): Promise<LLMResponse> {
    const startedAt = Date.now();
    const content = await this.readResponse();
    const input = [request.systemPrompt, request.prompt].filter((part): part is string => part !== undefined).join('\n\n');

    return {
      content,
      model_used: this.model,
      tokens_in: estimateTokens(input),
      tokens_out: estimateTokens(content),
      latency_ms: Math.max(0, Date.now() - startedAt),
    };
  }

  private async readResponse(): Promise<string> {
    try {
      return await readFile(resolve(this.responseFilePath), 'utf8');
    } catch (cause) {
      if (!this.hasCustomResponseFilePath) {
        return DEFAULT_RESPONSE;
      }

      throw new SkillRunnerError('LLM_CALL_FAILED', undefined, { cause });
    }
  }
}
