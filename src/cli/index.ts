import { readFile } from 'node:fs/promises';

import { Command } from 'commander';

import { executionInputSchema, SkillRunnerError, type ExecutionInput } from '../core/index.js';
import { Runner } from '../runtime/runner.js';

const program = new Command();

interface ExecuteOptions {
  skill: string;
  input: string;
}

program.name('skillrunner').description('BKPilot Skill Runner Engine CLI').version('0.0.0');

program
  .command('execute')
  .description('Executa uma skill a partir de um execution-input.json')
  .requiredOption('--skill <id>', 'ID da skill (ex: usabilidade)')
  .requiredOption('--input <path>', 'Caminho para execution-input.json')
  .action(async (options: ExecuteOptions) => {
    try {
      const input = await readExecutionInput(options.input, options.skill);
      const result = await Runner.createDefault().run(input);

      printSummary(result);
      process.exitCode = result.status === 'completed' ? 0 : 1;
    } catch (error) {
      printFriendlyError(error);
      process.exitCode = 1;
    }
  });

async function readExecutionInput(inputPath: string, skillId: string): Promise<ExecutionInput> {
  let content: string;

  try {
    content = await readFile(inputPath, 'utf8');
  } catch (error) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      throw new CliError(`Arquivo de input nao encontrado: ${inputPath}`);
    }

    throw new CliError(`Nao foi possivel ler o arquivo de input: ${inputPath}`);
  }

  let payload: unknown;

  try {
    payload = JSON.parse(content) as unknown;
  } catch {
    throw new CliError(`JSON invalido no arquivo de input: ${inputPath}`);
  }

  if (!isRecord(payload)) {
    throw new CliError('Input invalido: o JSON raiz deve ser um objeto.');
  }

  // O parametro CLI e a fonte de verdade operacional para permitir reuso do mesmo JSON.
  const parsed = executionInputSchema.safeParse({ ...payload, skill_id: skillId });

  if (!parsed.success) {
    throw new CliError('Input invalido: informe execution_id, skill_id e inputs validos.');
  }

  return parsed.data;
}

function printSummary(result: Awaited<ReturnType<Runner['run']>>): void {
  console.log(`status: ${result.status}`);
  console.log(`execution_id: ${result.execution_id}`);

  if (result.outputs.length === 0) {
    console.log('outputs: nenhum');
    return;
  }

  console.log('outputs:');

  for (const output of result.outputs) {
    console.log(`- ${output.name} -> ${output.path}`);
  }
}

function printFriendlyError(error: unknown): void {
  if (error instanceof CliError) {
    console.error(error.message);
    return;
  }

  if (error instanceof SkillRunnerError) {
    console.error(`${error.code}: ${error.message}`);
    return;
  }

  if (error instanceof Error) {
    console.error(`Erro: ${error.message}`);
    return;
  }

  console.error('Erro desconhecido ao executar a skill.');
}

class CliError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CliError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}

await program.parseAsync();
