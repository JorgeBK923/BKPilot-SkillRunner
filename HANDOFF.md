# HANDOFF - BKPilot-SkillRunner - Pre-Sprint Tecnica

**Data:** 2026-05-23
**Origem:** Guardiao MAIA (skill `03-maia-planejamento`)
**Destino:** Proxima skill MAIA = `06-maia-implementacao`
**Escopo:** Skill Runner Engine isolado - Gate 0 com skill **Usabilidade**
**Status:** APROVADO COM RESSALVAS - backlog pronto, pronto para `06-maia-implementacao` (alvo: T01)
**Ultima skill executada:** `03-maia-planejamento` (relatorio no hub Producao em `C:\Users\Jorge Alves\IA\Produto\BKPilot-Producao_Produt\docs\maia\03-planejamento\planejamento-2026-05-23-skillrunner.md`)
**Proxima skill recomendada:** `06-maia-implementacao` (alvo: T01 - Schemas, erros e logger core)
**Bloqueadores atuais:** Nenhum
**Repo local:** `C:\Users\Jorge Alves\IA\Produto\BKPilot-SkillRunner\` (sem remote - owner adiciona GitHub manualmente)

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

## 3. Proxima acao - `06-maia-implementacao`

Comecar por **T01 - Schemas, erros e logger core**:

- Criar schemas zod de `manifest.yaml`, `execution-input.json`, `result.json`, `execution-log.json`.
- Derivar tipos TS via `z.infer`; nao criar interfaces manuais para schemas.
- Registrar os 16 codigos de erro da especificacao.
- Nao implementar runtime, Playwright, LLM ou CLI em T01.

CLI/LLM: Codex CLI + GPT-5.3 Codex conforme ADR-004.

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
Executar 06-maia-implementacao no contexto BKPilot-SkillRunner, alvo T01.

Ler:
- HANDOFF.md (este arquivo)
- ../BKPilot-Producao_Produt/HANDOFF.md (hub)
- ../BKPilot-Producao_Produt/docs/maia/03-planejamento/planejamento-2026-05-23-skillrunner.md
- ../BKPilot-Producao_Produt/docs/maia/04-arquitetura/arquitetura-2026-05-23-skillrunner.md
- ../BKPilot-Producao_Produt/docs/maia/02-especificacao/especificacao-2026-05-23-skillrunner.md

Produzir T01: schemas zod + tipos derivados + 16 codigos de erro + wrapper pino core. Nao implementar runtime nesta tarefa.
```

---

**Fim do handoff.**


