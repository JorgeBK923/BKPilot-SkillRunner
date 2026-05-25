import { readFile } from 'node:fs/promises';

import { CursorLLMClient } from '../src/llm/cursor-llm-client.js';
import { LocalArtifactManager } from '../src/runtime/artifact-manager.js';
import { Runner } from '../src/runtime/runner.js';
import { FileSystemSkillLoader } from '../src/runtime/skill-loader.js';
import { PlaywrightExecutor } from '../src/tools/browser/playwright-executor.js';
import type { ExecutionInput, ExecutionResult } from '../src/core/index.js';

const EXECUTION_ID = 'gate0-001-cursor';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';
const INPUT_PATH = 'inputs/execution-local.json';

const endpoint = process.env.CURSOR_LLM_ENDPOINT;
const apiKey = process.env.CURSOR_LLM_API_KEY;
const model = process.env.CURSOR_LLM_MODEL ?? DEFAULT_MODEL;

if (endpoint === undefined || endpoint.trim().length === 0 || apiKey === undefined || apiKey.trim().length === 0) {
  console.log('DUVIDA EXPLICITA: CursorLLM nao configurado (endpoint/key ausentes); execucao real nao realizada');
  process.exitCode = 1;
} else {
  const runner = new Runner({
    loader: new FileSystemSkillLoader('skills'),
    browser: new PlaywrightExecutor(),
    llm: new CursorLLMClient({ model, endpoint, apiKey }),
    artifacts: new LocalArtifactManager('outputs'),
  });
  const input = await readExecutionInput(INPUT_PATH);
  const result = await runner.run({
    ...input,
    execution_id: EXECUTION_ID,
  });
  const modelUsed = await readModelUsed(result, model);

  console.log(`status: ${result.status}`);
  console.log(`duration_ms: ${result.duration_ms}`);
  console.log(`metrics: ${formatMetrics(result)}`);
  console.log(`model_used: ${modelUsed}`);

  process.exitCode = result.status === 'completed' ? 0 : 1;
}

async function readExecutionInput(filePath: string): Promise<ExecutionInput> {
  const content = await readFile(filePath, 'utf8');

  return JSON.parse(content) as ExecutionInput;
}

async function readModelUsed(result: ExecutionResult, fallback: string): Promise<string> {
  const reportOutput = result.outputs.find((output) => output.name === 'report.md');

  if (reportOutput === undefined) {
    return fallback;
  }

  try {
    const report = await readFile(reportOutput.path, 'utf8');
    const modelLine = /^- Modelo:\s*(.+)$/mu.exec(report);

    return modelLine?.[1]?.trim() ?? fallback;
  } catch {
    return fallback;
  }
}

function formatMetrics(result: ExecutionResult): string {
  const metrics = result.metrics;

  if (metrics === undefined) {
    return 'llm_calls=0 tokens=0 (in=0 out=0)';
  }

  const tokensTotal = metrics.llm_tokens_in + metrics.llm_tokens_out;

  return `llm_calls=${metrics.llm_calls} tokens=${tokensTotal} (in=${metrics.llm_tokens_in} out=${metrics.llm_tokens_out})`;
}
