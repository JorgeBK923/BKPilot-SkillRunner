# HANDOFF - BKPilot-SkillRunner - Pre-Sprint Tecnica

**Data:** 2026-05-24
**Origem:** Guardiao MAIA (skill `03-maia-planejamento`)
**Destino:** Proxima skill MAIA = `07-maia-qa-validacao` (T22 - QA final Gate 0), deepseek-v4-pro (Ollama) + Gemini 3.1 Pro
**Escopo:** Skill Runner Engine isolado - Gate 0 com skill **Usabilidade**
**Status:** T01-T21 CONCLUIDOS. Commit local `661a386`, branch `main`, NAO pushado. Gate 0 APROVADO com MockLLM (T20) E com LLM real via Groq (T21). 50 testes verdes. Proximo: T22 (QA final).
**Ultima skill executada:** `06-maia-implementacao` - T21 (Codex/GPT-5.3): Gate 0 real com CursorLLMClient via Groq (script dedicado gate0:cursor); backstop do Guardiao OK (sem-env -> duvida explicita exit 1; com-env status completed confirmado pelo owner; apiKey nao vazada).
**Proxima skill recomendada:** `07-maia-qa-validacao` - T22 (QA final cobrindo G0-1..G0-10, outputs, logs, stderr, processo Playwright), deepseek-v4-pro (Ollama) + Gemini 3.1 Pro. Validacao NUNCA e Codex (ADR-004).
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

### T01-T21 - CONCLUIDOS (commit local `661a386`, branch `main`, NAO pushado)

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
- **T20** (06, Codex): Gate 0 oficial com MockLLM - `docs/maia/06-implementacao/gate0-mock-2026-05-25.md`; execute exit 0 + gate0 10/10 PASS, reprodutivel no backstop. **Gate 0 APROVADO.**
- **T21** (06, Codex): Gate 0 real com CursorLLMClient via Groq - `scripts/gate0-cursor.ts` + script `gate0:cursor` + `docs/maia/06-implementacao/gate0-cursor-2026-05-25.md`. LLM real status completed; sem config -> duvida explicita exit 1; paridade nao calculavel (sem baseline Claude); apiKey nunca versionada.
- Backstop do Guardiao (Opus) em cada peca: smoke + `test`/`typecheck`/`lint`/`build`/`gate0` verdes. **50/50 testes + Gate 0 Mock 10/10 + Gate 0 real (Groq) completed. Nenhum bug em aberto.**

### Proximo - T22 (07-maia-qa-validacao, deepseek-v4-pro [Ollama] + Gemini 3.1 Pro)

QA final do Gate 0 (primeira entrada do deepseek; NUNCA Codex - ADR-004). Validacao independente cobrindo G0-1..G0-10, outputs (result.json/report.md/screenshot.png/execution-log.json), logs, stderr e ausencia de processo Playwright zumbi - nas duas passadas (Mock T20 e real Groq T21). Produzir `docs/maia/07-qa-validacao/relatorio-gate0-2026-05-25.md` declarando CADA G0 como pass/fail COM evidencia e listando bloqueadores (se houver). Done: relatorio QA completo; nenhum bloqueador aberto para o review. Depois T23 (review final = Cursor + Opus 4.7) e T24 (memoria/encerramento = Cursor + Opus 4.7).

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
Executar 07-maia-qa-validacao no contexto BKPilot-SkillRunner, alvo T22.
CLI/LLM: deepseek-v4-pro (Ollama) executa/escreve a validacao + Gemini 3.1 Pro cobertura (ADR-004 - validacao NUNCA e Codex).

Ler antes:
- HANDOFF.md (este repo)
- ../BKPilot-Producao_Produt/docs/maia/02-especificacao/especificacao-2026-05-23-skillrunner.md (secao 9 Gate 0 - G0-1..G0-10)
- ../BKPilot-Producao_Produt/docs/maia/03-planejamento/planejamento-2026-05-23-skillrunner.md (linha T22)
- docs/maia/06-implementacao/gate0-mock-2026-05-25.md e gate0-cursor-2026-05-25.md (evidencias das 2 passadas)
- scripts/gate0-validate.ts, src/runtime/runner.ts

Tarefa T22 (QA final independente do Gate 0): revisar criticamente a prova de vida do Engine. Executar/conferir: `npm run gate0` (passada Mock) e, se env Groq disponivel, `npm run gate0:cursor` (passada real). Para CADA criterio G0-1..G0-10, declarar PASS/FAIL com EVIDENCIA concreta (valor observado, nao so "passou"). Cobrir tambem: integridade dos 4 outputs, conteudo dos logs, ausencia de erro nao-tratado no stderr, e nenhum processo Playwright zumbi. Apontar qualquer bloqueador para o review (T23). Produzir docs/maia/07-qa-validacao/relatorio-gate0-2026-05-25.md. NAO alterar codigo do Engine (so reportar); se achar bug, registrar como bloqueador. NUNCA versionar segredos. NAO commitar, NAO push (Guardiao faz backstop; depois T23 review = Cursor + Opus, T24 memoria).
```

---

**Fim do handoff.**


