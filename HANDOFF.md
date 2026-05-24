# HANDOFF - BKPilot-SkillRunner - Pre-Sprint Tecnica

**Data:** 2026-05-24
**Origem:** Guardiao MAIA (skill `03-maia-planejamento`)
**Destino:** Proxima skill MAIA = `12-maia-code-validator` (T10 - validar Playwright executor), Antigravity + Gemini 3.1 Pro
**Escopo:** Skill Runner Engine isolado - Gate 0 com skill **Usabilidade**
**Status:** T01-T09 CONCLUIDOS. Commit local `78377f3`, branch `main`, NAO pushado. 38 testes unit verdes + PlaywrightExecutor (launch/navigate/snapshot/evaluate/screenshot) smoke OK. Proximo: T10 (validacao integracao).
**Ultima skill executada:** `06-maia-implementacao` - T09 (Codex/GPT-5.3): snapshot/evaluate/screenshot; backstop do Guardiao OK (snapshot texts=9/buttons=2/links=2/fields=3, screenshot PNG magic bytes ok).
**Proxima skill recomendada:** `12-maia-code-validator` - T10 (testes de integracao CAP-2/3/4 do PlaywrightExecutor), Antigravity + Gemini 3.1 Pro
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

### T01-T09 - CONCLUIDOS (commit local `78377f3`, branch `main`, NAO pushado)

- **T01** (06, Codex/GPT-5.3): `src/core/` - 4 schemas zod, `types.ts` (z.infer), `errors.ts` (16 codigos + `SkillRunnerError`), `logger.ts` (pino), barrel.
- **T02** (12, Gemini 3.1 Pro): `tests/unit/schemas.test.ts` - 21/21.
- **T03** (06, Codex): `src/runtime/skill-loader.ts` - `FileSystemSkillLoader` le `skills/<id>/manifest.yaml`, valida com `skillManifestSchema`; erros `MANIFEST_NOT_FOUND`/`MANIFEST_INVALID`. Fixtures valida/invalida/malformada. CAP-1.
- **T04** (12, Gemini): `tests/unit/skill-loader.test.ts` - 4 testes (valido/ausente/schema-invalido/parse-error).
- **T05** (06, Codex): `src/runtime/artifact-manager.ts` - `LocalArtifactManager` cria `outputs/<id>/`, escreve result.json/execution-log.json validados + artefatos com `size_bytes`; erro `ARTIFACT_SAVE_FAILED`. CAP-7.
- **T06** (06, Codex): `src/runtime/status-resolver.ts` - `resolveStatus` (pura) por precedencia timeout>cancelled>failed>completed/partial. CAP-8.
- **T07** (12, Gemini): `tests/unit/artifact-manager.test.ts` + `status-resolver.test.ts` - 13 testes (tmpdir+cleanup; precedencia erro-vence-partial).
- **T08** (06, Codex): `src/tools/browser/playwright-executor.ts` (+ `types.ts`) - `PlaywrightExecutor` launch headless / navigate networkidle+timeout / close idempotente; erros `BROWSER_LAUNCH_FAILED`/`BROWSER_TIMEOUT`/`BROWSER_NAVIGATION_FAILED`; cleanup sem zumbi. CAP-2. Chromium do Playwright instalado na maquina.
- **T09** (06, Codex): mesmos arquivos + fixture `tests/fixtures/pages/usabilidade.html` - metodos `snapshot` (DOM estruturado texts/buttons/links/fields com label), `evaluate<T>`, `screenshot` (full-page PNG); erro `BROWSER_ACTION_FAILED`. CAP-3, CAP-4.
- Backstop do Guardiao (Opus) em cada peca: smoke + `test`/`typecheck`/`lint`/`build` verdes. **38/38 testes unit + smoke browser. Nenhum bug.**

### Proximo - T10 (12-maia-code-validator, Antigravity + Gemini 3.1 Pro)

Criar testes de integracao do `PlaywrightExecutor` cobrindo CAP-2/3/4: launch+navigate (URL real e invalida), snapshot da fixture HTML, evaluate, screenshot PNG, e cleanup de browser em sucesso E erro (sem processo zumbi). Arquivo: `tests/integration/playwright-executor.test.ts`. Done: `npm run test` passa; nenhum processo Playwright zumbi apos o teste. Validacao NUNCA e Codex (ADR-004). Depois T11 (mock LLM client + metricas, Codex).

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
Executar 12-maia-code-validator no contexto BKPilot-SkillRunner, alvo T10.
CLI/LLM: Antigravity + Gemini 3.1 Pro (ADR-004 - validacao NUNCA e Codex).

Ler antes:
- HANDOFF.md (este repo)
- ../BKPilot-Producao_Produt/docs/maia/02-especificacao/especificacao-2026-05-23-skillrunner.md (CAP-2/3/4)
- ../BKPilot-Producao_Produt/docs/maia/03-planejamento/planejamento-2026-05-23-skillrunner.md (linha T10)
- src/tools/browser/playwright-executor.ts e tests/fixtures/pages/usabilidade.html (alvos da validacao - NAO alterar)

Tarefa T10: criar tests/integration/playwright-executor.test.ts (vitest) cobrindo CAP-2/3/4: (a) launch + navigate https://example.com -> status 200; (b) navigate URL invalida -> BROWSER_NAVIGATION_FAILED; (c) snapshot da fixture file:// usabilidade.html -> texts/buttons(2)/links(2)/fields(3) com labels corretas; (d) evaluate retorna valor; (e) screenshot -> PNG magic bytes 89 50 4E 47 e length>0; (f) close idempotente e SEM processo zumbi (sucesso e erro). Usar timeout de teste adequado (browser real e lento). NAO tocar src/**, NAO LLM/CLI/Runner.
Done: npm run test passa (todos os arquivos), typecheck/lint sem regressao, nenhum processo Playwright zumbi apos o teste. NAO commitar, NAO push (Guardiao faz backstop; depois T11 = Codex).
```

---

**Fim do handoff.**


