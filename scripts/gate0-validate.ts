import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

const EXECUTION_ID = 'gate0-001';
const OUTPUT_DIR = path.resolve('outputs', EXECUTION_ID);
const RESULT_PATH = path.join(OUTPUT_DIR, 'result.json');
const REPORT_PATH = path.join(OUTPUT_DIR, 'report.md');
const SCREENSHOT_PATH = path.join(OUTPUT_DIR, 'screenshot.png');
const LOG_PATH = path.join(OUTPUT_DIR, 'execution-log.json');
const MAX_DURATION_MS = 300_000;
const PNG_MAGIC_BYTES = [0x89, 0x50, 0x4e, 0x47] as const;
const UNHANDLED_ERROR_PATTERNS = [/UnhandledPromiseRejection/i, /(^|\n)\s*Error:/];

const HEURISTIC_PATTERNS = [
  /\bH1\b|visibilidade do status do sistema|visibility of system status/i,
  /\bH2\b|correspondencia entre o sistema e o mundo real|match between system and the real world/i,
  /\bH3\b|controle e liberdade do usuario|user control and freedom/i,
  /\bH4\b|consistencia e padroes|consistency and standards/i,
  /\bH5\b|prevencao de erros|error prevention/i,
  /\bH6\b|reconhecimento em vez de memorizacao|recognition rather than recall/i,
  /\bH7\b|flexibilidade e eficiencia de uso|flexibility and efficiency of use/i,
  /\bH8\b|design estetico e minimalista|aesthetic and minimalist design/i,
  /\bH9\b|ajudar usuarios a reconhecer|recognize, diagnose, and recover from errors/i,
  /\bH10\b|ajuda e documentacao|help and documentation/i,
];

interface CommandResult {
  exitCode: number | null;
  stdout: string;
  stderr: string;
  error?: Error;
}

interface Validation {
  id: string;
  passed: boolean;
  reason?: string;
}

const beforeProcesses = await listBrowserProcesses();
const executeCommand = npmRunCommand([
  'execute',
  '--',
  '--skill',
  'usabilidade',
  '--input',
  'inputs/execution-local.json',
]);
const executeResult = await runCommand(executeCommand.command, executeCommand.args);
await delay(1_000);
const afterProcesses = await listBrowserProcesses();

const [resultJson, report, screenshot, executionLog] = await Promise.all([
  readJsonFile(RESULT_PATH),
  readTextFile(REPORT_PATH),
  readBinaryFile(SCREENSHOT_PATH),
  readJsonFile(LOG_PATH),
]);

const validations: Validation[] = [
  validate('G0-1', executeResult.exitCode === 0, commandFailureReason(executeResult)),
  validate(
    'G0-2',
    isRecord(resultJson.value) && resultJson.value.status === 'completed',
    resultJson.error ?? 'result.json ausente ou status diferente de completed',
  ),
  validate(
    'G0-3',
    report.value !== undefined && report.value.length > 500,
    report.error ?? 'report.md ausente ou com 500 caracteres ou menos',
  ),
  validate(
    'G0-4',
    screenshot.value !== undefined && hasPngMagicBytes(screenshot.value),
    screenshot.error ?? 'screenshot.png ausente ou magic bytes PNG invalidos',
  ),
  validate(
    'G0-5',
    isRecord(executionLog.value) &&
      Array.isArray(executionLog.value.events) &&
      executionLog.value.events.length >= 5,
    executionLog.error ?? 'execution-log.json ausente ou events.length menor que 5',
  ),
  validate(
    'G0-6',
    isRecord(resultJson.value) &&
      isRecord(resultJson.value.metrics) &&
      numberValue(resultJson.value.metrics.llm_calls) >= 1,
    resultJson.error ?? 'result.json metrics.llm_calls ausente ou menor que 1',
  ),
  validate(
    'G0-7',
    isRecord(resultJson.value) &&
      numberValue(resultJson.value.duration_ms) >= 0 &&
      numberValue(resultJson.value.duration_ms) < MAX_DURATION_MS,
    resultJson.error ?? 'result.json duration_ms ausente ou >= 300000',
  ),
  validate(
    'G0-8',
    report.value !== undefined && countNielsenHeuristics(report.value) >= 3,
    report.error ?? 'report.md menciona menos de 3 heuristicas Nielsen',
  ),
  validate(
    'G0-9',
    !hasUnhandledError(executeResult.stderr),
    'stderr contem erro nao-tratado',
  ),
  validate(
    'G0-10',
    afterProcesses.error === undefined &&
      browserProcessDelta(beforeProcesses.processes, afterProcesses.processes).length === 0,
    afterProcesses.error ?? zombieReason(beforeProcesses.processes, afterProcesses.processes),
  ),
];

for (const validation of validations) {
  console.log(formatValidation(validation));
}

process.exitCode = validations.every((validation) => validation.passed) ? 0 : 1;

function npmRunCommand(args: string[]): { command: string; args: string[] } {
  const npmArgs = ['run', ...args];

  if (process.platform === 'win32') {
    return { command: 'cmd.exe', args: ['/d', '/s', '/c', 'npm', ...npmArgs] };
  }

  return { command: 'npm', args: npmArgs };
}

function validate(id: string, passed: boolean, reason: string): Validation {
  return passed ? { id, passed } : { id, passed, reason };
}

function formatValidation(validation: Validation): string {
  if (validation.passed) {
    return `${validation.id} PASS`;
  }

  return `${validation.id} FAIL — ${validation.reason ?? 'criterio nao atendido'}`;
}

function commandFailureReason(result: CommandResult): string {
  if (result.exitCode === 0) {
    return '';
  }

  if (result.error !== undefined) {
    return `execute falhou ao iniciar: ${result.error.message}`;
  }

  return `execute retornou exit code ${result.exitCode ?? 'desconhecido'}`;
}

async function runCommand(command: string, args: string[]): Promise<CommandResult> {
  return new Promise((resolve) => {
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    let spawnError: Error | undefined;
    let child: ReturnType<typeof spawn>;

    try {
      child = spawn(command, args, {
        cwd: process.cwd(),
        windowsHide: true,
      });
    } catch (error) {
      resolve({
        exitCode: null,
        stdout: '',
        stderr: '',
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return;
    }

    child.stdout.on('data', (chunk: Buffer) => stdout.push(chunk));
    child.stderr.on('data', (chunk: Buffer) => stderr.push(chunk));
    child.on('error', (error) => {
      spawnError = error;
    });
    child.on('close', (exitCode) => {
      resolve({
        exitCode,
        stdout: Buffer.concat(stdout).toString('utf8'),
        stderr: Buffer.concat(stderr).toString('utf8'),
        ...(spawnError === undefined ? {} : { error: spawnError }),
      });
    });
  });
}

async function readJsonFile(filePath: string): Promise<{ value?: unknown; error?: string }> {
  try {
    const content = await readFile(filePath, 'utf8');

    return { value: JSON.parse(content) as unknown };
  } catch (error) {
    return { error: readErrorMessage(filePath, error) };
  }
}

async function readTextFile(filePath: string): Promise<{ value?: string; error?: string }> {
  try {
    return { value: await readFile(filePath, 'utf8') };
  } catch (error) {
    return { error: readErrorMessage(filePath, error) };
  }
}

async function readBinaryFile(filePath: string): Promise<{ value?: Buffer; error?: string }> {
  try {
    return { value: await readFile(filePath) };
  } catch (error) {
    return { error: readErrorMessage(filePath, error) };
  }
}

function readErrorMessage(filePath: string, error: unknown): string {
  if (isNodeError(error) && error.code === 'ENOENT') {
    return `${path.basename(filePath)} nao existe`;
  }

  if (error instanceof SyntaxError) {
    return `${path.basename(filePath)} contem JSON invalido`;
  }

  return `falha ao ler ${path.basename(filePath)}`;
}

function hasPngMagicBytes(buffer: Buffer): boolean {
  return PNG_MAGIC_BYTES.every((byte, index) => buffer[index] === byte);
}

function countNielsenHeuristics(report: string): number {
  return HEURISTIC_PATTERNS.filter((pattern) => pattern.test(report)).length;
}

function hasUnhandledError(stderr: string): boolean {
  return UNHANDLED_ERROR_PATTERNS.some((pattern) => pattern.test(stderr));
}

function numberValue(value: unknown): number {
  return typeof value === 'number' ? value : Number.NaN;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}

async function listBrowserProcesses(): Promise<{ processes: string[]; error?: string }> {
  const result =
    process.platform === 'win32'
      ? await runCommand('tasklist', [])
      : await runCommand('ps', ['-eo', 'pid=,comm=,args=']);

  if (result.exitCode !== 0 || result.error !== undefined) {
    return {
      processes: [],
      error: result.error?.message ?? `checagem de processos retornou ${result.exitCode}`,
    };
  }

  return {
    processes: result.stdout
      .split(/\r?\n/)
      .map((line) => line.trim())
      .flatMap(normalizeBrowserProcessLine),
  };
}

function normalizeBrowserProcessLine(line: string): string[] {
  if (!/\b(chrome|chromium|playwright)\b/i.test(line)) {
    return [];
  }

  const windowsMatch = /^(\S+)\s+(\d+)\s+/.exec(line);

  if (windowsMatch?.[1] !== undefined && windowsMatch[2] !== undefined) {
    return [`${windowsMatch[1].toLowerCase()}:${windowsMatch[2]}`];
  }

  const posixMatch = /^(\d+)\s+(\S+)/.exec(line);

  if (posixMatch?.[1] !== undefined && posixMatch[2] !== undefined) {
    return [`${posixMatch[2].toLowerCase()}:${posixMatch[1]}`];
  }

  return [line.toLowerCase()];
}

function browserProcessDelta(before: string[], after: string[]): string[] {
  const remaining = new Map<string, number>();

  for (const processLine of before) {
    remaining.set(processLine, (remaining.get(processLine) ?? 0) + 1);
  }

  return after.filter((processLine) => {
    const count = remaining.get(processLine) ?? 0;

    if (count > 0) {
      remaining.set(processLine, count - 1);
      return false;
    }

    return true;
  });
}

function zombieReason(before: string[], after: string[]): string {
  const delta = browserProcessDelta(before, after);

  if (delta.length === 0) {
    return '';
  }

  return `${delta.length} processo(s) Chromium/Playwright novo(s) ainda ativo(s)`;
}

async function delay(ms: number): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
