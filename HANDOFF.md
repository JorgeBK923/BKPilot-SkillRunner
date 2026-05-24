# HANDOFF - BKPilot-SkillRunner - Pre-Sprint Tecnica

**Data:** 2026-05-23
**Origem:** Guardiao MAIA (skill `03-maia-planejamento`)
**Destino:** Proxima skill MAIA = `06-maia-implementacao` (T03 - skill loader YAML), Codex CLI + GPT-5.3 Codex
**Escopo:** Skill Runner Engine isolado - Gate 0 com skill **Usabilidade**
**Status:** T01 + T02 CONCLUIDOS e no GitHub (commit `f0a9fec`, branch `main`). Core (schemas/erros/logger) implementado e validado. Proximo: T03.
**Ultima skill executada:** `12-maia-code-validator` - T02 (Antigravity + Gemini 3.1 Pro): 21/21 testes; backstop do Guardiao OK.
**Proxima skill recomendada:** `06-maia-implementacao` - T03 (skill loader YAML), Codex CLI + GPT-5.3 Codex
**Bloqueadores atuais:** Nenhum
**Repo:** local `C:\Users\Jorge Alves\IA\Produto\BKPilot-SkillRunner\` + remote `https://github.com/JorgeBK923/BKPilot-SkillRunner.git` (branch `main`)

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

### T01 + T02 - CONCLUIDOS e no GitHub (commit `f0a9fec`, branch `main`)

- **T01** (06-maia-implementacao, Codex/GPT-5.3): `src/core/` - 4 schemas zod (manifest/execution-input/result/execution-log), `types.ts` (z.infer, zero interface manual), `errors.ts` (16 codigos + `SkillRunnerError`), `logger.ts` (pino), `index.ts` (barrel).
- **T02** (12-maia-code-validator, Antigravity + Gemini 3.1 Pro): `tests/unit/schemas.test.ts` - **21/21 passando**, valida os 4 schemas + 16 codigos contra a especificacao (contrato), com fronteiras (timeout/max_attempts), opcionais, negativos e result.error.
- Backstop do Guardiao (Opus): `test`/`typecheck`/`lint`/`build` verdes. **Nenhum bug encontrado no codigo do 06.**

### Proximo - T03 (06-maia-implementacao, Codex/GPT-5.3)

`FileSystemSkillLoader`: le `skills/<id>/manifest.yaml`, parseia YAML, valida com `skillManifestSchema`. Erros `MANIFEST_NOT_FOUND` e `MANIFEST_INVALID`. Arquivos: `src/runtime/skill-loader.ts`, `tests/fixtures/manifests/*`. CAP-1. Done: loader retorna objeto tipado para fixture valida e erro padronizado para ausente/invalida. Depois, T04 (validacao do loader) = Gemini 3.1 Pro.

**Regra de papeis (emenda ADR-004, 2026-05-23):** implementacao (06) = Codex/GPT-5.3; validacao NUNCA e Codex - `12-code-validator` = **Gemini 3.1 Pro** (Antigravity), `07-qa` = **deepseek-v4-pro** + Gemini. Backstop = Guardiao (Opus).

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
Executar 06-maia-implementacao no contexto BKPilot-SkillRunner, alvo T03.
CLI/LLM: Codex CLI + GPT-5.3 Codex (ADR-004).

Ler antes:
- HANDOFF.md (este repo)
- ../BKPilot-Producao_Produt/docs/maia/02-especificacao/especificacao-2026-05-23-skillrunner.md (secao 3 schema do manifest + secao 7 codigos + CAP-1)
- ../BKPilot-Producao_Produt/docs/maia/03-planejamento/planejamento-2026-05-23-skillrunner.md (linha T03)
- src/core/** (schemas/erros/logger JA prontos - reutilizar, nao recriar)

Tarefa T03: implementar FileSystemSkillLoader em src/runtime/skill-loader.ts que le skills/<id>/manifest.yaml, parseia YAML (pacote `yaml`) e valida com skillManifestSchema (zod). Retorna SkillManifest tipado quando valido; lanca SkillRunnerError MANIFEST_NOT_FOUND quando o arquivo nao existe e MANIFEST_INVALID quando falha no schema. Criar fixtures em tests/fixtures/manifests/ (valido + invalido). NAO implementar Playwright/LLM/CLI/Runner.
Done: loader retorna objeto tipado para fixture valida e erro padronizado para ausente/invalida; typecheck/lint sem regressao. NAO commitar, NAO push (Guardiao revisa; depois T04 valida via Gemini 3.1 Pro).
```

---

**Fim do handoff.**


