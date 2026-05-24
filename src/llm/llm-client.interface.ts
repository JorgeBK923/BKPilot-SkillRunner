export interface LLMRequest {
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface LLMResponse {
  content: string;
  model_used: string;
  tokens_in: number;
  tokens_out: number;
  latency_ms: number;
}

export interface LLMClient {
  complete(request: LLMRequest): Promise<LLMResponse>;
}
