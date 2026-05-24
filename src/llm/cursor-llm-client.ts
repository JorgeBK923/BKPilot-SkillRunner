import { SkillRunnerError } from '../core/index.js';
import type { LLMClient, LLMRequest, LLMResponse } from './llm-client.interface.js';

export interface CursorLLMClientOptions {
  model: string;
  endpoint?: string;
  apiKey?: string;
}

interface OpenAICompatibleResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
    text?: string;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
  };
  model?: string;
}

const estimateTokens = (text: string): number => Math.max(1, Math.ceil(text.trim().split(/\s+/u).length * 1.33));

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const parseOpenAICompatibleResponse = (value: unknown): OpenAICompatibleResponse => {
  if (!isObject(value)) {
    throw new SkillRunnerError('LLM_RESPONSE_INVALID');
  }

  return value as OpenAICompatibleResponse;
};

export class CursorLLMClient implements LLMClient {
  private readonly model: string;

  private readonly endpoint: string | undefined;

  private readonly apiKey: string | undefined;

  constructor(options: CursorLLMClientOptions) {
    this.model = options.model;
    this.endpoint = options.endpoint ?? process.env.CURSOR_LLM_ENDPOINT;
    this.apiKey = options.apiKey ?? process.env.CURSOR_LLM_API_KEY;
  }

  async complete(request: LLMRequest): Promise<LLMResponse> {
    if (this.endpoint === undefined || this.apiKey === undefined) {
      throw new SkillRunnerError('LLM_CALL_FAILED', undefined, {
        reason: 'Cursor LLM client requires endpoint and apiKey configuration.',
      });
    }

    const startedAt = Date.now();

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${this.apiKey}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            ...(request.systemPrompt === undefined ? [] : [{ role: 'system', content: request.systemPrompt }]),
            { role: 'user', content: request.prompt },
          ],
          max_tokens: request.maxTokens,
          temperature: request.temperature,
        }),
      });

      if (!response.ok) {
        throw new SkillRunnerError('LLM_CALL_FAILED', undefined, {
          reason: `Cursor LLM endpoint returned HTTP ${response.status}.`,
        });
      }

      const payload = parseOpenAICompatibleResponse(await response.json());
      const firstChoice = payload.choices?.[0];
      const content = firstChoice?.message?.content ?? firstChoice?.text;

      if (content === undefined || content.trim().length === 0) {
        throw new SkillRunnerError('LLM_RESPONSE_INVALID');
      }

      return {
        content,
        model_used: payload.model ?? this.model,
        tokens_in: payload.usage?.prompt_tokens ?? estimateTokens([request.systemPrompt, request.prompt].filter(Boolean).join('\n\n')),
        tokens_out: payload.usage?.completion_tokens ?? estimateTokens(content),
        latency_ms: Math.max(0, Date.now() - startedAt),
      };
    } catch (cause) {
      if (cause instanceof SkillRunnerError) {
        throw cause;
      }

      throw new SkillRunnerError('LLM_CALL_FAILED', undefined, { cause });
    }
  }
}
