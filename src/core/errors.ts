export const SKILL_RUNNER_ERROR_CODES = [
  'MANIFEST_INVALID',
  'MANIFEST_NOT_FOUND',
  'INPUT_VALIDATION_FAILED',
  'BROWSER_LAUNCH_FAILED',
  'BROWSER_NAVIGATION_FAILED',
  'BROWSER_ACTION_FAILED',
  'BROWSER_TIMEOUT',
  'LLM_CALL_FAILED',
  'LLM_TIMEOUT',
  'LLM_RESPONSE_INVALID',
  'LLM_FALLBACK_EXHAUSTED',
  'REPORT_GENERATION_FAILED',
  'ARTIFACT_SAVE_FAILED',
  'EXECUTION_TIMEOUT',
  'EXECUTION_CANCELLED',
  'UNKNOWN_ERROR',
] as const;

export type SkillRunnerErrorCode = (typeof SKILL_RUNNER_ERROR_CODES)[number];

export const ERROR_MESSAGES = {
  MANIFEST_INVALID: 'Manifesto YAML invalido ou incompleto.',
  MANIFEST_NOT_FOUND: 'Skill nao encontrada.',
  INPUT_VALIDATION_FAILED: 'Input obrigatorio ausente ou tipo errado.',
  BROWSER_LAUNCH_FAILED: 'Falha ao abrir o browser.',
  BROWSER_NAVIGATION_FAILED: 'URL nao respondeu ou excedeu o timeout de navegacao.',
  BROWSER_ACTION_FAILED: 'Acao de browser falhou.',
  BROWSER_TIMEOUT: 'Acao de browser excedeu o timeout.',
  LLM_CALL_FAILED: 'Chamada ao LLM retornou erro.',
  LLM_TIMEOUT: 'LLM nao respondeu no tempo esperado.',
  LLM_RESPONSE_INVALID: 'Resposta do LLM invalida.',
  LLM_FALLBACK_EXHAUSTED: 'LLM primario e fallback falharam.',
  REPORT_GENERATION_FAILED: 'Erro ao gerar relatorio.',
  ARTIFACT_SAVE_FAILED: 'Erro ao salvar artefato.',
  EXECUTION_TIMEOUT: 'Execucao excedeu o timeout global.',
  EXECUTION_CANCELLED: 'Execucao cancelada externamente.',
  UNKNOWN_ERROR: 'Erro nao classificado.',
} as const satisfies Record<SkillRunnerErrorCode, string>;

export const CLIENT_RETURNABLE_ERROR_CODES = [
  'INPUT_VALIDATION_FAILED',
  'BROWSER_NAVIGATION_FAILED',
  'BROWSER_ACTION_FAILED',
  'BROWSER_TIMEOUT',
  'EXECUTION_TIMEOUT',
  'EXECUTION_CANCELLED',
] as const satisfies readonly SkillRunnerErrorCode[];

export class SkillRunnerError extends Error {
  readonly code: SkillRunnerErrorCode;

  readonly details?: unknown;

  constructor(code: SkillRunnerErrorCode, message = ERROR_MESSAGES[code], details?: unknown) {
    super(message);
    this.name = 'SkillRunnerError';
    this.code = code;

    if (details !== undefined) {
      this.details = details;
    }
  }
}

export const isSkillRunnerErrorCode = (value: string): value is SkillRunnerErrorCode =>
  SKILL_RUNNER_ERROR_CODES.includes(value as SkillRunnerErrorCode);

export const isClientReturnableErrorCode = (code: SkillRunnerErrorCode): boolean =>
  CLIENT_RETURNABLE_ERROR_CODES.some((clientCode) => clientCode === code);
