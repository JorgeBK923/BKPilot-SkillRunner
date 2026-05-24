# AGENTS.md — BKPilot-SkillRunner

## Quick Start

```bash
# Sempre ler primeiro
cat HANDOFF.md

npm install
npm run lint && npm run typecheck && npm run build
```

## Contexto obrigatório

| Arquivo | Propósito |
|---------|-----------|
| `HANDOFF.md` | Handoff vivo deste repo — status do ciclo Pré-Sprint Técnica |
| `docs/maia/` | Artefatos MAIA locais (diagnóstico, especificação, arquitetura, etc.) |
| `../BKPilot-Producao_Produt/docs/maia-skill-pack/` | 12 skills MAIA oficiais (referenciado, não duplicado — ADR-003) |
| `../BKPilot-Producao_Produt/HANDOFF.md` | Hub central do ciclo Skill Runner |

## Stack (ADRs 002, 008–012)

- Node 20 LTS, TypeScript 5.4+ strict ESM
- Playwright **direto** (não MCP)
- zod = fonte de verdade de schemas (`z.infer`, sem interfaces manuais)
- pino para logs JSON
- commander CLI fino; Engine = biblioteca em `src/index.ts`
- Sem framework de DI — wiring manual em `src/cli/index.ts`
- **Sem** dependência do BKPilot-Core nesta fase

## Restrições críticas

- **NUNCA** commitar `.env` real (só `.env.example`)
- **NUNCA** acoplar ao BKPilot-Core
- **NUNCA** usar MCP no Engine
- **NUNCA** criar `interface SkillManifest` à mão — derivar de zod
- **NUNCA** avançar para Sprint 1 sem passar Gate 0 (Usabilidade E2E)
- Artefatos de execução vão em `outputs/<execution_id>/` (gitignored)

## Gate 0

```bash
npm run execute -- --skill usabilidade --input inputs/execution-local.json
npm run gate0
```

## Testes

- Unit: `npm run test`
- Integration (Playwright): `npm run test:coverage` — headless, fechar browser em `afterEach`
- CI: 4 jobs — lint-format, typecheck, unit, integration

## Próxima skill MAIA

Após harness: **`03-maia-planejamento`** → quebrar Pré-Sprint em tarefas de 1–2 dias.

Implementação de código: **`06-maia-implementacao`**.
