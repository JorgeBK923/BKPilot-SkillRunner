# HANDOFF - BKPilot-SkillRunner - Pre-Sprint Tecnica

> **PRE-SPRINT TECNICA ENCERRADA em 2026-05-25 (T24 concluido, ULTIMA tarefa).** 24/24 tarefas concluidas; **Gate 0 APROVADO COM RESSALVAS** (Mock 10/10 + real Groq completed); QA final 10/10 + cobertura Gemini CONCORDA (T22); review final APROVA COM RESSALVAS (T23, zero bloqueador); 50 testes verdes; branch `main`, NAO pushado (nao fixar SHA - ver D10). **Gate 0 encerrado SEM pendencia sem dono** - debitos D1-D10 transferidos p/ Sprint 1 com dono (memoria sec 4). **Proxima etapa = Sprint 1 (Engine real reutilizavel), abre por ESPECIFICACAO:** `02-maia-especificacao` (formalizar Gate 1) ANTES de codar - regra dura do owner: nunca codar sem spec/objetivo. So depois `06` cria `scripts/convert-skill.ts`. Comando na secao 6.

**Data:** 2026-05-25
**Origem:** Guardiao MAIA
**Destino:** Proxima skill MAIA = `02-maia-especificacao` (Sprint 1 - formalizar Gate 1, SEM codigo). Depois 03-planejamento, depois 06-implementacao T01 (`convert-skill.ts`, Codex/GPT-5.3)
**Escopo:** Pre-Sprint Tecnica ENCERRADA (Gate 0 provado e fechado). Abrindo Sprint 1 = Engine real reutilizavel: converter as 12 skills web restantes via `convert-skill.ts`, CursorLLM real como caminho padrao, meta paridade >= 95% vs Claude Code, saldar D1-D8.
**Status:** T01-T24 CONCLUIDOS. Branch `main`, NAO pushado. Gate 0 APROVADO com MockLLM (T20) E com LLM real via Groq (T21); QA final 10/10 (T22); review final APROVA COM RESSALVAS (T23); memoria/encerramento + abertura Sprint 1 (T24). 50 testes verdes. **Gate 0 encerrado sem pendencia sem dono.** Backstop do Guardiao sobre o T24 pendente.
**Ultima skill executada:** `10-maia-memoria` - T24 (Cursor + Opus 4.7): consolidou o Gate 0 (T01-T23) em `docs/maia/10-memoria/memoria-gate0-2026-05-25.md` (+ espelho no hub) - resultado, ADRs 001-012, e os debitos D1-D10 do review como backlog inicial da Sprint 1, cada um com dono. HANDOFFs dos dois repos atualizados apontando a Sprint 1. D10 (HANDOFF pinava SHA que envelhece) mitigado: parar de tratar HEAD como verdade durável.
**Proxima skill recomendada:** `02-maia-especificacao` - Sprint 1 (formalizar Gate 1 = criterios de aceite mensuraveis, analogo a G0-1..G0-10). REGRA DURA do owner: nunca codar sem spec/objetivo. So apos spec+planejamento -> `06-maia-implementacao` T01 (`convert-skill.ts`, Codex/GPT-5.3; validacao Gemini 3.1 Pro; QA deepseek+Gemini; review Opus; backstop/commits Guardiao - ADR-004).
**Bloqueadores atuais:** Nenhum. Pendencias humanas p/ iniciar a Sprint 1: definir duracao da sprint; i18n no Engine (Sprint 1 ou 3); fornecer baseline Claude p/ medir paridade (D9); decisao de push remoto.
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

### T01-T23 - CONCLUIDOS (HEAD local `d4c0210`, branch `main`, NAO pushado, ahead 42)

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
- **T22** (07, deepseek-v4-pro [Ollama] executa + Gemini 3.1 Pro cobertura): QA final independente do Gate 0. Em DOIS passos com artefato proprio por modelo:
  - **deepseek** - `docs/maia/07-qa-validacao/relatorio-gate0-2026-05-25.md` (+ espelho no hub): G0-1..G0-10 PASS com evidencia concreta (result.json completed/llm_calls 1/duration 4134ms; report.md 5989B; screenshot.png PNG 10402B magic `89 50 4E 47`; execution-log.json 10 eventos; stderr limpo; zero zumbi via tasklist delta).
  - **Gemini (cobertura)** - `docs/maia/07-qa-validacao/cobertura-gemini-gate0-2026-05-25.md` (+ espelho no hub): segunda lente independente; rodou `npm run gate0` proprio (exit 0, 10/10); valores batem com o relatorio deepseek (duration 4084ms = variancia natural); G0-1..G0-10 CONFIRMO, sem divergencias/alucinacoes. **Veredito: CONCORDA.** Fecha ADR-004 (autor != validador).
  - Groq nao reproduzido (GROQ_API_KEY/CURSOR_LLM_* ausentes) -> graceful degradation OK (DUVIDA EXPLICITA + exit 1); T21 ja aprovado pelo owner. Paridade nao calculavel (sem baseline Claude) - nao bloqueia (spec sec 9). Codigo NAO alterado.
  - **Correcao de processo (2026-05-25):** a cobertura Gemini NAO havia rodado quando o relatorio deepseek foi inicialmente commitado (Guardiao deu comando combinado em vez de tarefa separada por modelo; owner pegou). Corrigido: tarefa Gemini dada em passo proprio, artefato distinto, backstop confirmou execucao real. Regra nova: 1 modelo = 1 tarefa = 1 arquivo; backstop nunca assina papel de modelo sem trace em disco.
- **T23** (08, Cursor + Opus 4.7; autor != revisor): review final do Gate 0 e do codigo do Engine (T01-T22) - `docs/maia/08-review/review-gate0-2026-05-25.md` (+ espelho no hub). Verificacao independente reproduzida (typecheck exit 0, lint 0, test 50/50, gate0 10/10, 4 artefatos integros, higiene de segredos OK; leu src/ completo, schemas, scripts, testes). QA T22 + cobertura Gemini validos. ADRs 001-012 aderentes. **Veredito: APROVA COM RESSALVAS. Zero bug/bloqueador.** 10 debitos para Sprint 1 (NAO bloqueiam Gate 0):
  - **D1** timeout global nao enforcado (`manifest.timeout_seconds` ignorado) - MEDIA
  - **D2** retry declarado no manifesto mas nao implementado - MEDIA
  - **D3** fallback LLM ausente (deferido de proposito)
  - **D4** logger pino existe/exportado mas nao consumido pelo Runtime (ADR-011 parcial)
  - **D5** aliasing em `result.outputs`
  - **D6** `metrics` opcional no schema
  - **D7** `llm_override.provider` ignorado
  - **D8** lacunas de teste (caminhos failed/partial, cursor-client)
  - **D9** paridade ADR-005 nao medida (sem baseline Claude)
  - **D10** HANDOFF citava HEAD stale (corrigido neste handoff)
- Backstop do Guardiao (Opus) em cada peca: smoke + `test`/`typecheck`/`lint`/`build`/`gate0` verdes. **50/50 testes + Gate 0 Mock 10/10 + Gate 0 real (Groq) completed + QA final T22 10/10 + cobertura Gemini CONCORDA + review T23 APROVA COM RESSALVAS. Nenhum bug em aberto.** Backstop T23: bateria reproduzida (typecheck exit 0/lint 0/50-50/gate0 10-10), claims conferidos, codigo do Engine nao alterado.

### T24 CONCLUIDO (10-maia-memoria, Cursor + Opus 4.7) - PRE-SPRINT TECNICA ENCERRADA

Memoria/encerramento escrita em `docs/maia/10-memoria/memoria-gate0-2026-05-25.md` (+ espelho no hub): consolida resultado do Gate 0 (T01-T23), ADRs 001-012 e os 10 debitos (D1-D10) como backlog inicial da Sprint 1, **cada um com dono**. HANDOFFs dos DOIS repos atualizados apontando a Sprint 1. Gate 0 encerrado sem pendencia sem dono. **Fim da Pre-Sprint Tecnica.**

### Proximo - SPRINT 1 (Engine real reutilizavel)

Primeira skill: `06-maia-implementacao` - **T01 da Sprint 1 = criar `scripts/convert-skill.ts`** (Codex / GPT-5.3; ainda nao existe no repo). Escopo da Sprint 1:
1. `convert-skill.ts` converte as **12 skills web restantes** do skill pack (`docs/maia-skill-pack/`) em manifestos do Engine.
2. **CursorLLM real** como caminho padrao de qualidade (Mock vira so fluxo/CI).
3. **Meta paridade >= 95%** vs Claude Code (debito D9) - exige baseline Claude.
4. Saldar **D1-D8** (timeout global, retry, fallback LLM, pino wiring, aliasing/schema, cobertura de erro).
5. **Gate 1** como criterio de avanco (formalizar em `02-maia-especificacao` da Sprint 1).

Fora da Sprint 1 (adiado): Worker/Fila (Sprint 2), SaaS Core/multi-tenant/billing/auth (Sprint 3), LLM de producao Papel C (Sprint 3), mobile, MCP no Engine, acoplamento ao BKPilot-Core.

**Regra de papeis (emenda ADR-004, 2026-05-23):** implementacao (06) = Codex/GPT-5.3; validacao NUNCA e Codex - `12-code-validator` = **Gemini 3.1 Pro** (Antigravity), `07-qa` = **deepseek-v4-pro** + Gemini, review (08) = **Opus 4.7**. Backstop + commits = Guardiao (Opus). Commits: 1 por tarefa, sem push.

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

**REGRA DURA (owner, 2026-05-25):** NUNCA codar nada sem especificacao e sem saber o objetivo. Sprint 1 abre por `02-maia-especificacao` (formalizar Gate 1 = criterios de aceite, analogo a G0-1..G0-10) ANTES de qualquer implementacao. So depois `06` codifica `convert-skill.ts`. Decisao A do owner sobre a ressalva do Gate 1.

```text
Executar 02-maia-especificacao no contexto BKPilot-SkillRunner, alvo Sprint 1 (formalizar o Gate 1).
CLI/LLM: a definir por papel MAIA (especificacao). NAO e implementacao - nenhum codigo nesta etapa.

Ler antes:
- HANDOFF.md (este repo)
- docs/maia/10-memoria/memoria-gate0-2026-05-25.md (encerramento Gate 0 + ADRs 001-012 + debitos D1-D10 com dono + escopo Sprint 1)
- docs/maia/08-review/review-gate0-2026-05-25.md (detalhe tecnico dos debitos D1-D10)
- ../BKPilot-Producao_Produt/docs/maia/01-diagnostico/diagnostico-2026-05-23-skillrunner.md (roadmap; Sprint 1 = Engine real reutilizavel)
- ../BKPilot-Producao_Produt/docs/maia/02-especificacao/especificacao-2026-05-23-skillrunner.md (modelo da spec do Gate 0 - replicar formato para Gate 1)
- ../BKPilot-Producao_Produt/docs/maia-skill-pack/ (as 12 skills web restantes - insumo do escopo)

Tarefa: formalizar a Especificacao da Sprint 1 e o Gate 1 - criterios de aceite mensuraveis (G1-1, G1-2, ...) analogos aos G0-1..G0-10, cobrindo: conversao das 12 skills web via convert-skill.ts, CursorLLM real como caminho padrao, meta paridade >= 95% vs Claude Code (D9), e saldar D1-D8. Definir o que prova que a Sprint 1 esta "feita". Saida: docs/maia/02-especificacao/especificacao-sprint1-<data>.md (+ espelho no hub). NAO codar nada (regra dura). NAO incluir Worker/SaaS/billing/auth/mobile/MCP/Core (sprints posteriores). NUNCA versionar segredos. NAO commitar, NAO push (Guardiao faz backstop).

Pendencias humanas a resolver antes/durante: duracao da Sprint 1; i18n no Engine (Sprint 1 ou 3); baseline Claude p/ medir paridade (D9); decisao de push remoto.
SO DEPOIS da spec aprovada: 03-planejamento (quebrar em tarefas) -> 06-implementacao T01 (convert-skill.ts, Codex/GPT-5.3; validacao Gemini).
```

---

**Fim do handoff.**


