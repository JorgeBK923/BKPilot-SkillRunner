import path from 'node:path';

import {
  executionInputSchema,
  SkillRunnerError,
  type ExecutionError,
  type ExecutionInput,
  type ExecutionLog,
  type ExecutionMetrics,
  type ExecutionResult,
  type LogEvent,
  type ManifestOutput,
  type SkillManifest,
} from '../core/index.js';
import type { LLMClient, LLMRequest, LLMResponse } from '../llm/llm-client.interface.js';
import { MockLLMClient } from '../llm/mock-llm-client.js';
import { PlaywrightExecutor } from '../tools/browser/playwright-executor.js';
import type { PageSnapshot } from '../tools/browser/types.js';
import { LocalArtifactManager } from './artifact-manager.js';
import { generateReport } from './report-generator.js';
import { FileSystemSkillLoader } from './skill-loader.js';
import { resolveStatus } from './status-resolver.js';

const DEFAULT_SKILLS_DIR = 'skills';
const DEFAULT_OUTPUTS_DIR = 'outputs';
const TARGET_URL_INPUT = 'target_url';

export interface RunnerDeps {
  loader: FileSystemSkillLoader;
  browser: PlaywrightExecutor;
  llm: LLMClient;
  artifacts: LocalArtifactManager;
}

export class Runner {
  constructor(private readonly deps: RunnerDeps) {}

  static createDefault(): Runner {
    return new Runner({
      loader: new FileSystemSkillLoader(path.resolve(DEFAULT_SKILLS_DIR)),
      browser: new PlaywrightExecutor(),
      llm: new MockLLMClient(),
      artifacts: new LocalArtifactManager(path.resolve(DEFAULT_OUTPUTS_DIR)),
    });
  }

  async run(input: ExecutionInput): Promise<ExecutionResult> {
    const startedAtMs = Date.now();
    const startedAt = toIso(startedAtMs);
    const events: LogEvent[] = [];
    const outputs: ExecutionResult['outputs'] = [];
    const metrics = createEmptyMetrics();
    const parsedInput = executionInputSchema.safeParse(input);
    const executionId = parsedInput.success ? parsedInput.data.execution_id : fallbackId(input);
    const skillId = parsedInput.success ? parsedInput.data.skill_id : fallbackSkillId(input);
    const artifacts = parsedInput.data?.options?.output_dir
      ? new LocalArtifactManager(parsedInput.data.options.output_dir)
      : this.deps.artifacts;
    const browser = parsedInput.data?.options?.timeout_override
      ? new PlaywrightExecutor({
          navigationTimeoutMs: parsedInput.data.options.timeout_override,
        })
      : this.deps.browser;
    const llm = createEffectiveLlm(this.deps.llm, parsedInput.data?.options?.llm_override);

    let manifest: SkillManifest | undefined;
    let error: ExecutionError | undefined;
    let timedOut = false;

    const log = (
      level: LogEvent['level'],
      phase: LogEvent['phase'],
      message: string,
      data?: unknown,
    ): void => {
      const event = {
        timestamp: new Date().toISOString(),
        level,
        phase,
        message,
        ...(data === undefined ? {} : { data }),
      };

      events.push(event);
    };

    try {
      log('info', 'init', 'Validating execution input.');

      if (!parsedInput.success) {
        throw new SkillRunnerError('INPUT_VALIDATION_FAILED', undefined, {
          issues: parsedInput.error.issues,
        });
      }

      const validInput = parsedInput.data;
      manifest = await this.loadManifest(validInput.skill_id, log);
      this.validateRequiredInputs(manifest, validInput.inputs);
      const targetUrl = getRequiredStringInput(validInput.inputs, TARGET_URL_INPUT);

      const { snapshot, screenshotBuffer } = await this.runBrowserPhase(
        browser,
        targetUrl,
        metrics,
        log,
      );
      const llmResponse = await this.runLlmPhase(llm, manifest, targetUrl, snapshot, metrics, log);
      const report = this.runReportPhase(
        manifest,
        targetUrl,
        snapshot,
        llmResponse,
        'screenshot.png',
        log,
      );

      log('info', 'artifact', 'Writing execution artifacts.');
      outputs.push(
        await artifacts.writeArtifact(executionId, 'screenshot.png', screenshotBuffer, 'png'),
      );
      outputs.push(await artifacts.writeArtifact(executionId, 'report.md', report, 'markdown'));
    } catch (cause) {
      const runnerError = toSkillRunnerError(cause);
      error = toExecutionError(runnerError);
      timedOut = isTimeoutError(runnerError);
      log('error', phaseForError(runnerError), runnerError.message, {
        code: runnerError.code,
        details: runnerError.details,
      });
    } finally {
      log('info', 'cleanup', 'Closing browser.');
      await browser.close();
    }

    const result = this.buildResult({
      executionId,
      skillId,
      startedAt,
      startedAtMs,
      manifest,
      outputs,
      error,
      timedOut,
      metrics,
    });

    try {
      log('info', 'artifact', 'Writing execution log and result.');
      const executionLog: ExecutionLog = {
        execution_id: executionId,
        skill_id: skillId,
        events,
      };
      outputs.push(await artifacts.writeLog(executionLog));
      outputs.push(await artifacts.writeResult(result));
      return {
        ...result,
        outputs,
      };
    } catch (cause) {
      const runnerError = toSkillRunnerError(cause);
      const artifactError = toExecutionError(runnerError);
      const failedResult = {
        ...result,
        status: resolveStatus({
          error: artifactError,
          timedOut: isTimeoutError(runnerError),
          requiredOutputs: requiredOutputNames(manifest),
          producedOutputs: outputNames(outputs),
        }),
        error: artifactError,
        outputs,
      };

      return failedResult;
    }
  }

  private async loadManifest(
    skillId: string,
    log: (level: LogEvent['level'], phase: LogEvent['phase'], message: string, data?: unknown) => void,
  ): Promise<SkillManifest> {
    log('info', 'init', 'Loading skill manifest.', { skill_id: skillId });
    return this.deps.loader.load(skillId);
  }

  private validateRequiredInputs(
    manifest: SkillManifest,
    inputs: ExecutionInput['inputs'],
  ): void {
    const missingInputs = manifest.inputs
      .filter((manifestInput) => manifestInput.required)
      .filter((manifestInput) => inputs[manifestInput.name] === undefined)
      .map((manifestInput) => manifestInput.name);

    if (missingInputs.length > 0) {
      throw new SkillRunnerError('INPUT_VALIDATION_FAILED', undefined, {
        missing_inputs: missingInputs,
      });
    }

    if (inputs[TARGET_URL_INPUT] === undefined) {
      throw new SkillRunnerError('INPUT_VALIDATION_FAILED', undefined, {
        missing_inputs: [TARGET_URL_INPUT],
      });
    }
  }

  private async runBrowserPhase(
    browser: PlaywrightExecutor,
    targetUrl: string,
    metrics: ExecutionMetrics,
    log: (level: LogEvent['level'], phase: LogEvent['phase'], message: string, data?: unknown) => void,
  ): Promise<{ snapshot: PageSnapshot; screenshotBuffer: Buffer }> {
    log('info', 'browser', 'Launching browser.');
    await browser.launch();
    metrics.playwright_actions += 1;

    log('info', 'browser', 'Navigating to target URL.', { target_url: targetUrl });
    const navigation = await browser.navigate(targetUrl);
    metrics.playwright_actions += 1;

    log('debug', 'browser', 'Navigation completed.', navigation);
    const snapshot = await browser.snapshot();
    metrics.playwright_actions += 1;

    const screenshotBuffer = await browser.screenshot();
    metrics.playwright_actions += 1;
    metrics.screenshots_taken += 1;

    return { snapshot, screenshotBuffer };
  }

  private async runLlmPhase(
    llm: LLMClient,
    manifest: SkillManifest,
    targetUrl: string,
    snapshot: PageSnapshot,
    metrics: ExecutionMetrics,
    log: (level: LogEvent['level'], phase: LogEvent['phase'], message: string, data?: unknown) => void,
  ): Promise<LLMResponse> {
    const request = buildLlmRequest(manifest, targetUrl, snapshot);

    log('info', 'llm', 'Calling LLM.', {
      provider_hint: manifest.llm.provider_hint,
    });
    const response = await llm.complete(request);
    metrics.llm_calls += 1;
    metrics.llm_tokens_in += response.tokens_in;
    metrics.llm_tokens_out += response.tokens_out;

    return response;
  }

  private runReportPhase(
    manifest: SkillManifest,
    targetUrl: string,
    snapshot: PageSnapshot,
    llmResponse: LLMResponse,
    screenshotName: string,
    log: (level: LogEvent['level'], phase: LogEvent['phase'], message: string, data?: unknown) => void,
  ): string {
    log('info', 'report', 'Generating markdown report.');

    return generateReport({
      skillId: manifest.id,
      targetUrl,
      llm: {
        content: llmResponse.content,
        modelUsed: llmResponse.model_used,
      },
      snapshot,
      screenshot: {
        name: screenshotName,
        path: screenshotName,
      },
    });
  }

  private buildResult(input: {
    executionId: string;
    skillId: string;
    startedAt: string;
    startedAtMs: number;
    manifest: SkillManifest | undefined;
    outputs: ExecutionResult['outputs'];
    error: ExecutionError | undefined;
    timedOut: boolean;
    metrics: ExecutionMetrics;
  }): ExecutionResult {
    const finishedAtMs = Date.now();
    const status = resolveStatus({
      ...(input.error === undefined ? {} : { error: input.error }),
      timedOut: input.timedOut,
      requiredOutputs: requiredOutputNames(input.manifest),
      producedOutputs: outputNames(input.outputs),
    });
    const result = {
      execution_id: input.executionId,
      skill_id: input.skillId,
      status,
      started_at: input.startedAt,
      finished_at: toIso(finishedAtMs),
      duration_ms: Math.max(0, finishedAtMs - input.startedAtMs),
      outputs: input.outputs,
      ...(input.error === undefined ? {} : { error: input.error }),
      metrics: input.metrics,
    };

    return result;
  }
}

const createEmptyMetrics = (): ExecutionMetrics => ({
  llm_calls: 0,
  llm_tokens_in: 0,
  llm_tokens_out: 0,
  playwright_actions: 0,
  screenshots_taken: 0,
});

const buildLlmRequest = (
  manifest: SkillManifest,
  targetUrl: string,
  snapshot: PageSnapshot,
): LLMRequest => ({
  prompt: [
    `Skill: ${manifest.name} (${manifest.id})`,
    `URL alvo: ${targetUrl}`,
    'Snapshot da pagina:',
    JSON.stringify(snapshot, null, 2),
  ].join('\n\n'),
  ...(manifest.description === undefined ? {} : { systemPrompt: manifest.description }),
  ...(manifest.llm.max_tokens === undefined ? {} : { maxTokens: manifest.llm.max_tokens }),
  ...(manifest.llm.temperature === undefined ? {} : { temperature: manifest.llm.temperature }),
});

const createEffectiveLlm = (
  llm: LLMClient,
  override: ExecutionInput['options'] extends infer Options
    ? Options extends { llm_override?: infer Override }
      ? Override
      : never
    : never,
): LLMClient => {
  if (override?.model !== undefined && llm instanceof MockLLMClient) {
    return new MockLLMClient({ model: override.model });
  }

  return llm;
};

const getRequiredStringInput = (
  inputs: ExecutionInput['inputs'],
  name: string,
): string => {
  const value = inputs[name];

  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new SkillRunnerError('INPUT_VALIDATION_FAILED', undefined, {
      invalid_input: name,
    });
  }

  return value;
};

const requiredOutputNames = (manifest: SkillManifest | undefined): string[] =>
  (manifest?.outputs ?? [])
    .filter((output: ManifestOutput) => output.required)
    .map((output: ManifestOutput) => output.name);

const outputNames = (outputs: ExecutionResult['outputs']): string[] =>
  outputs.flatMap((output) => [output.name, stripExtension(output.name)]);

const stripExtension = (name: string): string => {
  const parsed = path.parse(name);

  return parsed.ext.length === 0 ? name : parsed.name;
};

const toExecutionError = (error: SkillRunnerError): ExecutionError => ({
  code: error.code,
  message: error.message,
  ...(error.details === undefined ? {} : { details: error.details }),
});

const toSkillRunnerError = (cause: unknown): SkillRunnerError => {
  if (cause instanceof SkillRunnerError) {
    return cause;
  }

  return new SkillRunnerError('UNKNOWN_ERROR', undefined, { cause });
};

const isTimeoutError = (error: SkillRunnerError): boolean =>
  error.code === 'EXECUTION_TIMEOUT' ||
  error.code === 'BROWSER_TIMEOUT' ||
  error.code === 'LLM_TIMEOUT';

const phaseForError = (error: SkillRunnerError): LogEvent['phase'] => {
  if (error.code.startsWith('BROWSER_')) {
    return 'browser';
  }

  if (error.code.startsWith('LLM_')) {
    return 'llm';
  }

  if (error.code.startsWith('REPORT_')) {
    return 'report';
  }

  if (error.code.startsWith('ARTIFACT_')) {
    return 'artifact';
  }

  return 'init';
};

const fallbackId = (input: ExecutionInput): string =>
  typeof input.execution_id === 'string' && input.execution_id.length > 0
    ? input.execution_id
    : `execution-${Date.now()}`;

const fallbackSkillId = (input: ExecutionInput): string =>
  typeof input.skill_id === 'string' && input.skill_id.length > 0 ? input.skill_id : 'unknown';

const toIso = (epochMs: number): string => new Date(epochMs).toISOString();
