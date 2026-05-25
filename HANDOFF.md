# HANDOFF - BKPilot-SkillRunner - Pre-Sprint Tecnica

**Data:** 2026-05-24
**Origem:** Guardiao MAIA (skill `03-maia-planejamento`)
**Destino:** Proxima skill MAIA = `06-maia-implementacao` (T20 - Gate 0 com MockLLM), Codex CLI + GPT-5.3 Codex
**Escopo:** Skill Runner Engine isolado - Gate 0 com skill **Usabilidade**
**Status:** T01-T19 CONCLUIDOS. Commit local `14f03a7`, branch `main`, NAO pushado. 50 testes verdes (lint/typecheck/build/test); Gate 0 10/10. Proximo: T20 (executar e registrar Gate 0 oficial).
**Ultima skill executada:** `12-maia-code-validator` - T19 (Antigravity + Gemini 3.1 Pro): tests/integration/runner-e2e.test.ts; backstop do Guardiao OK (50/50, build verde, 0 zumbi Playwright).
**Proxima skill recomendada:** `06-maia-implementacao` - T20 (Gate 0 oficial com MockLLM + doc de evidencias), Codex CLI + GPT-5.3 Codex
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

### T01-T19 - CONCLUIDOS (commit local `14f03a7`, branch `main`, NAO pushado)

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
- **T18** (06, Codex): `scripts/gate0-validate.ts` - executa o pipeline e valida G0-1..G0-10; exit 0 com 10/10, exit 1 em falha; G0-10 via delta de processos. CAP-2..CAP-8.
- **T19** (12, Gemini): `tests/integration/runner-e2e.test.ts` - E2E do Runner com skill usabilidade em tmpdir (status completed, 4 artefatos, >=3 Nielsen, log>=5, sem zumbi). Suite 50/50; lint/typecheck/build/test verdes.
- Backstop do Guardiao (Opus) em cada peca: smoke + `test`/`typecheck`/`lint`/`build`/`gate0` verdes. **50/50 testes + Gate 0 10/10. Nenhum bug em aberto.**

### Proximo - T20 (06-maia-implementacao, Codex/GPT-5.3)

Gate 0 oficial com MockLLMClient: rodar `npm run execute -- --skill usabilidade --input inputs/execution-local.json` (exit 0) e `npm run gate0` (exit 0, 10/10), capturar stdout/stderr e registrar evidencias num doc `docs/maia/06-implementacao/gate0-mock-2026-05-25.md` (data real). Corrigir APENAS bugs bloqueantes (o pipeline ja passa 10/10 no backstop do Guardiao; nao refatorar). CAP-1..CAP-8. NOTA: `outputs/gate0-001/*` e gitignored (evidencia local, nao versionar) - o doc de evidencias descreve os resultados/metricas (sem segredos). Done: execute exit 0, gate0 exit 0, doc de evidencias criado. Depois T21 (paridade Claude Code, se baseline existir) e T22 (QA final = deepseek+Gemini).

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
Executar 06-maia-implementacao no contexto BKPilot-SkillRunner, alvo T20.
CLI/LLM: Codex CLI + GPT-5.3 Codex (ADR-004).

Ler antes:
- HANDOFF.md (este repo)
- ../BKPilot-Producao_Produt/docs/maia/02-especificacao/especificacao-2026-05-23-skillrunner.md (secao 9 Gate 0)
- ../BKPilot-Producao_Produt/docs/maia/03-planejamento/planejamento-2026-05-23-skillrunner.md (linha T20)
- scripts/gate0-validate.ts, inputs/execution-local.json, skills/usabilidade/**

Tarefa T20 (Gate 0 oficial com MockLLM): rodar o pipeline real e registrar evidencias.
1. `npm run execute -- --skill usabilidade --input inputs/execution-local.json` -> deve sair exit 0, status completed.
2. `npm run gate0` -> deve sair exit 0 com G0-1..G0-10 PASS.
3. Capturar stdout/stderr e os valores dos artefatos (status, duration_ms, llm_calls, tamanho do report, nº de eventos, heuristicas citadas).
4. Criar doc docs/maia/06-implementacao/gate0-mock-2026-05-25.md (data real de hoje) com: comando, saida do gate0 (10 linhas G0), metricas e veredito APROVADO. SEM segredos, SEM caminhos absolutos com usuario se possivel.
Corrigir APENAS bugs bloqueantes (o Guardiao ja validou 10/10; nao refatorar nem mudar pecas). outputs/gate0-001/* e gitignored (evidencia local) - NAO versionar; versionar so o doc .md.
Done: execute exit 0, gate0 exit 0, doc de evidencias criado em docs/maia/06-implementacao/. NAO commitar, NAO push (Guardiao faz backstop; depois T21/T22).
```

---

**Fim do handoff.**


