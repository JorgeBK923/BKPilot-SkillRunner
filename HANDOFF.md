# HANDOFF - BKPilot-SkillRunner - Pre-Sprint Tecnica

**Data:** 2026-05-24
**Origem:** Guardiao MAIA (skill `03-maia-planejamento`)
**Destino:** Proxima skill MAIA = `06-maia-implementacao` (T18 - gate0 validator), Codex CLI + GPT-5.3 Codex
**Escopo:** Skill Runner Engine isolado - Gate 0 com skill **Usabilidade**
**Status:** T01-T17 CONCLUIDOS (+ fix Runner template CAP-6). Commit local `16c26ee`, branch `main`, NAO pushado. 49 testes verdes; E2E real via CLI gera report 6KB com H1..H10. Proximo: T18.
**Ultima skill executada:** `06-maia-implementacao` - T17 (Codex/GPT-5.3) + fix Runner; backstop do Guardiao OK (E2E completed, report com Nielsen H1..H10/Score/Quick Wins via template da skill).
**Proxima skill recomendada:** `06-maia-implementacao` - T18 (scripts/gate0-validate.ts, G0-1..G0-10), Codex CLI + GPT-5.3 Codex
**Bloqueadores atuais:** Nenhum
**Repo:** local `C:\Users\Jorge\IA\Produto\BKPilot-SkillRunner\` + remote `https://github.com/JorgeBK923/BKPilot-SkillRunner.git` (branch `main`, remote ainda nao recebeu push da Pre-Sprint)

---

## 1. Resumo

Repo materializado conforme arquitetura aprovada no hub Producao. Bootstrap mecanico concluido: estrutura de pastas, configs, CI minima e stubs TypeScript. Sem codigo de dominio alem dos stubs.

Smoke test local da harness (2026-05-23): `npm install`, `lint`, `typecheck`, `build` - todos passaram.

Backlog da Pre-Sprint Tecnica esta pronto no hub Producao: `C:\Users\Jorge Alves\IA\Produto\BKPilot-Producao_Produt\docs\maia\03-planejamento\planejamento-2026-05-23-skillrunner.md`.

---

## 2. Decisoes cravadas (ADRs 001-012)

Herda ADRs do ciclo no hub `../BKPilot-Producao_Produt/HANDOFF.md`. Relevantes neste repo:

| ADR | Decisao relevante |
|-----|-------------------|
| 001 | Repo separado, local primeiro |
| 002 | TypeScript 5.4+ strict ESM |
| 003 | `docs/maia/` proprio; skill pack no Producao |
| 008 | Biblioteca + CLI fino |
| 009 | Playwright direto |
| 010 | zod fonte de verdade |
| 011 | pino logs |
| 012 | Sem DI framework |

---

## 3. Estado e proxima acao

### T01-T17 - CONCLUIDOS (commit local `16c26ee`, branch `main`, NAO pushado)

- **T01** (06, Codex/GPT-5.3): `src/core/` - 4 schemas zod, `types.ts` (z.infer), `errors.ts` (16 codigos + `SkillRunnerError`), `logger.ts` (pino), barrel.
- **T02** (12, Gemini 3.1 Pro): `tests/unit/schemas.test.ts` - 21/21.
- **T03** (06, Codex): `src/runtime/skill-loader.ts` - `FileSystemSkillLoader` le `skills/<id>/manifest.yaml`, valida com `skillManifestSchema`; erros `MANIFEST_NOT_FOUND`/`MANIFEST_INVALID`. Fixtures valida/invalida/malformada. CAP-1.
- **T04** (12, Gemini): `tests/unit/skill-loader.test.ts` - 4 testes (valido/ausente/schema-invalido/parse-error).
- **T05** (06, Codex): `src/runtime/artifact-manager.ts` - `LocalArtifactManager` cria `outputs/<id>/`, escreve result.json/execution-log.json validados + artefatos com `size_bytes`; erro `ARTIFACT_SAVE_FAILED`. CAP-7.
- **T06** (06, Codex): `src/runtime/status-resolver.ts` - `resolveStatus` (pura) por precedencia timeout>cancelled>failed>completed/partial. CAP-8.
- **T07** (12, Gemini): `tests/unit/artifact-manager.test.ts` + `status-resolver.test.ts` - 13 testes (tmpdir+cleanup; precedencia erro-vence-partial).
- **T08** (06, Codex): `src/tools/browser/playwright-executor.ts` (+ `types.ts`) - `PlaywrightExecutor` launch headless / navigate networkidle+timeout / close idempotente; erros `BROWSER_LAUNCH_FAILED`/`BROWSER_TIMEOUT`/`BROWSER_NAVIGATION_FAILED`; cleanup sem zumbi. CAP-2. Chromium do Playwright instalado na maquina.
- **T09** (06, Codex): mesmos arquivos + fixture `tests/fixtures/pages/usabilidade.html` - metodos `snapshot` (DOM estruturado texts/buttons/links/fields com label), `evaluate<T>`, `screenshot` (full-page PNG); erro `BROWSER_ACTION_FAILED`. CAP-3, CAP-4.
- **T10** (12, Gemini): `tests/integration/playwright-executor.test.ts` - 7 testes integracao CAP-2/3/4 com browser real (navigate valida/invalida, snapshot fixture, evaluate, screenshot PNG, close idempotente sem zumbi).
- **T11** (06, Codex): `src/llm/llm-client.interface.ts` + `mock-llm-client.ts` + `cursor-llm-client.ts` + fixture `tests/fixtures/llm-responses/usabilidade.md` - interface `LLMClient`; Mock offline com model_used/tokens/latencia; Cursor OpenAI-compativel por config/env sem credencial embutida. Erros `LLM_CALL_FAILED`/`LLM_RESPONSE_INVALID`. CAP-5.
- **T12** (06, Codex): `src/runtime/report-generator.ts` - `generateReport` (puro) monta report.md via template ou formato generico (cabecalho/analise/conclusao), combinando LLMResponse + snapshot + screenshot metadata; placeholders nao resolvidos removidos; erro `REPORT_GENERATION_FAILED`. CAP-6.
- **T13** (12, Gemini): `tests/unit/mock-llm-client.test.ts` + `report-generator.test.ts` - 4 testes (mock offline + LLM_CALL_FAILED; report generico/template sem placeholder cru).
- **T14** (06, Codex): `src/runtime/runner.ts` - `Runner.run` orquestra CAP-1..CAP-8 (loader->validar inputs->browser->LLM->report->artifacts->status->metrics->cleanup em finally), injecao por construtor + `createDefault()`, result.json gerado mesmo em erro, options output_dir/timeout_override/llm_override.
- **T15** (06, Codex): `src/cli/index.ts` - comando `execute --skill --input` (commander), valida input JSON, roda Runner.createDefault, exit 0/1 por status, erros amigaveis sem stacktrace/segredo. `outputs/` ja gitignored. CAP-8.
- **T16** (06, Codex): `skills/usabilidade/{manifest.yaml,prompt.md,report-template.md}` - manifest valida no loader (input target_url, outputs report.md/screenshot.png); template Nielsen H1..H10 + Score/Quick Wins/Parecer com placeholders {{...}} (corrigido placeholder cru). CAP-1/5/6.
- **T17** (06, Codex): `inputs/execution-local.json` (gate0-001, usabilidade, inputs.target_url/language) - valida no schema, dispara E2E via CLI.
- **FIX (06, Codex):** Runner agora usa `report-template.md` da skill (novo `FileSystemSkillLoader.loadReportTemplate`); antes ignorava o template (violava CAP-6). Report da usabilidade sobe para ~6KB com H1..H10.
- Backstop do Guardiao (Opus) em cada peca: smoke + `test`/`typecheck`/`lint`/`build` verdes. **49/49 testes + E2E CLI real (report com Nielsen). Nenhum bug em aberto.**

### Proximo - T18 (06-maia-implementacao, Codex/GPT-5.3)

Implementar `scripts/gate0-validate.ts` (script `gate0` ja existe no package.json) validando G0-1..G0-10 sobre `outputs/gate0-001/`. Executar a skill (ou validar artefatos existentes), capturar stdout/stderr. Checagens: G0-1 exit 0; G0-2 result.json status=completed; G0-3 report.md >500 chars; G0-4 screenshot.png magic bytes 89 50 4E 47; G0-5 execution-log.json >=5 eventos; G0-6 metrics.llm_calls>=1; G0-7 duration_ms<300000; G0-8 report cita >=3 heuristicas Nielsen; G0-9 sem erro nao-tratado no stderr; G0-10 sem processo Playwright zumbi. CAP-2..CAP-8. Done: `npm run gate0` retorna exit 1 com mensagens por G0 ANTES da execucao (outputs ausentes) e exit 0 quando todos os outputs validos existem. Depois T19 (validacao em lote, Gemini) e T20 (Gate 0 com MockLLM, Codex).

**Regra de papeis (emenda ADR-004, 2026-05-23):** implementacao (06) = Codex/GPT-5.3; validacao NUNCA e Codex - `12-code-validator` = **Gemini 3.1 Pro** (Antigravity), `07-qa` (T22) = **deepseek-v4-pro** + Gemini. Backstop + commits = Guardiao (Opus). Commits: 1 por tarefa, sem push.

---

## 4. Resultado da `05-maia-harness` (concluida)

- **Decisao:** APROVADO
- **Entregue:** estrutura completa secao 3 da arquitetura, package.json, tsconfigs, lint/format, CI 4 jobs, stubs `src/index.ts` + `src/cli/index.ts`
- **Nao entregue (escopo 06):** Runner, schemas zod, Playwright executor, skill usabilidade convertida, gate0-validate.ts
- **Relatorio:** `docs/maia/05-harness/relatorio-harness-2026-05-23.md`

## 4.1 Resultado da `03-maia-planejamento` (concluida)

- **Decisao:** APROVADO COM RESSALVAS
- **Backlog:** 24 tarefas (`T01` a `T24`), todas <= 1 dia
- **Caminho critico:** 8.5 dias uteis com paralelismo; excede R1 por manter QA, review e memoria separados
- **Cobertura:** CAP-1..CAP-8 e G0-1..G0-10 cobertos
- **Riscos novos:** P1-P5
- **Plano:** `C:\Users\Jorge Alves\IA\Produto\BKPilot-Producao_Produt\docs\maia\03-planejamento\planejamento-2026-05-23-skillrunner.md`

---

## 5. Restricoes criticas

- NUNCA push remoto sem decisao do owner (remote ainda nao configurado)
- NUNCA `.env` versionado
- NUNCA acoplar BKPilot-Core
- NUNCA introduzir DI framework, MCP no Engine, Worker, SaaS ou billing nesta Pre-Sprint
- Seguir backlog T01-T24; se mudar ordem, registrar no HANDOFF

---

## 6. Comando de chamada para proxima skill

```text
Executar 06-maia-implementacao no contexto BKPilot-SkillRunner, alvo T18.
CLI/LLM: Codex CLI + GPT-5.3 Codex (ADR-004).

Ler antes:
- HANDOFF.md (este repo)
- ../BKPilot-Producao_Produt/docs/maia/02-especificacao/especificacao-2026-05-23-skillrunner.md (secao 9 Gate 0 - tabela G0-1..G0-10)
- ../BKPilot-Producao_Produt/docs/maia/03-planejamento/planejamento-2026-05-23-skillrunner.md (linha T18)
- src/cli/index.ts, inputs/execution-local.json, src/core/schemas (result/log)

Tarefa T18: implementar scripts/gate0-validate.ts (script "gate0" ja existe em package.json: tsx scripts/gate0-validate.ts). Deve: executar a skill via o pipeline (rodar a CLI execute com inputs/execution-local.json, capturando stdout/stderr e exit code) e depois validar os 10 criterios sobre outputs/gate0-001/:
  G0-1 exit code 0 do execute
  G0-2 result.json existe e status === 'completed'
  G0-3 report.md existe e > 500 caracteres
  G0-4 screenshot.png existe e magic bytes 89 50 4E 47
  G0-5 execution-log.json existe e events.length >= 5
  G0-6 result.json metrics.llm_calls >= 1
  G0-7 result.json duration_ms < 300000
  G0-8 report.md menciona >= 3 das 10 heuristicas de Nielsen (grep por nomes/H1..H10)
  G0-9 nenhum erro nao-tratado no stderr capturado
  G0-10 nenhum processo Playwright/Chromium zumbi apos a execucao (checagem cross-platform; no Windows usar tasklist)
Imprimir uma linha por G0 (PASS/FAIL + motivo). Exit 0 SE todos passam; exit 1 se qualquer um falha (inclusive ANTES da execucao quando os outputs ainda nao existem). NAO vazar segredos. NAO mexer em src/**, so criar scripts/gate0-validate.ts (ajustar package.json so se necessario).
Done: `npm run gate0` retorna exit 1 com mensagens por G0 quando outputs ausentes; exit 0 quando o pipeline roda e todos os 10 passam. NAO commitar, NAO push (Guardiao faz backstop; depois T19 valida em lote via Gemini, T20 = Gate 0 MockLLM Codex).
```

---

**Fim do handoff.**


