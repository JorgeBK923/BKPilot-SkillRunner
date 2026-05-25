import { SkillRunnerError, type OutputFile } from '../core/index.js';
import type { PageSnapshot } from '../tools/browser/types.js';

export interface ReportInput {
  skillId: string;
  targetUrl: string;
  generatedAt?: Date;
  llm: { content: string; modelUsed?: string };
  snapshot?: PageSnapshot;
  screenshot?: { name: OutputFile['name']; path: OutputFile['path'] };
  template?: string;
}

const PLACEHOLDER_PATTERN = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/gu;

const buildSnapshotSummary = (snapshot: PageSnapshot | undefined): string => {
  if (snapshot === undefined) {
    return '';
  }

  return [
    `Textos identificados: ${snapshot.texts.length}`,
    `Campos identificados: ${snapshot.fields.length}`,
    `Botoes identificados: ${snapshot.buttons.length}`,
    `Links identificados: ${snapshot.links.length}`,
  ].join('\n');
};

const buildConclusion = (input: ReportInput): string =>
  `Relatorio gerado para a skill ${input.skillId}. A analise acima consolida os achados do LLM e os dados coletados da pagina avaliada.`;

const buildAnalysis = (input: ReportInput): string => {
  const snapshotSummary = buildSnapshotSummary(input.snapshot);
  const screenshotSummary =
    input.screenshot === undefined
      ? ''
      : [`Screenshot: ${input.screenshot.name}`, `Caminho: ${input.screenshot.path}`].join('\n');

  return [input.llm.content.trim(), snapshotSummary, screenshotSummary]
    .filter((section) => section.length > 0)
    .join('\n\n');
};

const buildTemplateValues = (input: ReportInput, generatedAt: Date): Record<string, string> => {
  const analysis = buildAnalysis(input);
  const conclusion = buildConclusion(input);
  const snapshotSummary = buildSnapshotSummary(input.snapshot);

  return {
    skill_id: input.skillId,
    skillId: input.skillId,
    target_url: input.targetUrl,
    targetUrl: input.targetUrl,
    generated_at: generatedAt.toISOString(),
    generatedAt: generatedAt.toISOString(),
    analysis,
    conclusion,
    model_used: input.llm.modelUsed ?? '',
    modelUsed: input.llm.modelUsed ?? '',
    llm_content: input.llm.content,
    snapshot_summary: snapshotSummary,
    screenshot_name: input.screenshot?.name ?? '',
    screenshot_path: input.screenshot?.path ?? '',
  };
};

const renderTemplate = (template: string, values: Record<string, string>): string =>
  template.replace(PLACEHOLDER_PATTERN, (_match: string, key: string) => values[key] ?? '').trim();

const renderGenericReport = (input: ReportInput, generatedAt: Date): string => {
  const modelLine = input.llm.modelUsed === undefined ? '' : `\n- Modelo: ${input.llm.modelUsed}`;
  const analysis = buildAnalysis(input);
  const conclusion = buildConclusion(input);

  return `# Relatorio - ${input.skillId}

## Cabecalho

- Data: ${generatedAt.toISOString()}
- URL: ${input.targetUrl}
- Skill: ${input.skillId}${modelLine}

## Analise

${analysis}

## Conclusao

${conclusion}
`.trim();
};

export function generateReport(input: ReportInput): string {
  try {
    const generatedAt = input.generatedAt ?? new Date();

    if (input.template !== undefined) {
      return renderTemplate(input.template, buildTemplateValues(input, generatedAt));
    }

    return renderGenericReport(input, generatedAt);
  } catch (cause) {
    throw new SkillRunnerError('REPORT_GENERATION_FAILED', undefined, { cause });
  }
}
