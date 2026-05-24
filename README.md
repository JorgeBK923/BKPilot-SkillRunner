# BKPilot-SkillRunner

Motor de execução de skills do ecossistema BKPilot — **Skill Runner Engine**.

Repositório isolado (ADR-001) em TypeScript strict ESM, Playwright direto (ADR-009), schemas zod (ADR-010), biblioteca + CLI fino (ADR-008).

## Visão geral

O Engine lê manifestos YAML de skills, orquestra tools (browser, filesystem, HTTP, scripts) e produz artefatos em `outputs/<execution_id>/`. O **Gate 0** valida a skill **Usabilidade** end-to-end contra uma URL pública.

**Status atual:** pré-implementação — harness/bootstrap concluído; código de domínio na skill `06-maia-implementacao`.

## Pré-requisitos

- **Node.js 20.x LTS** (ver `.nvmrc` e `engines` no `package.json`)
- npm (gerenciador padrão do ecossistema BKPilot)

## Instalação

```bash
cd BKPilot-SkillRunner
npm install
npx playwright install chromium   # necessário antes de testes com browser
```

## Comando do Gate 0

Após a implementação (`06-maia-implementacao`), o fluxo alvo é:

```bash
npm run execute -- --skill usabilidade --input inputs/execution-local.json
```

Validação dos critérios G0-1..G0-10:

```bash
npm run gate0
```

## Estrutura

```text
src/core/       # domínio puro (schemas zod, errors, logger)
src/runtime/    # orquestração (Runner, skill-loader, artifacts)
src/tools/      # adapters Playwright, FS, HTTP, script
src/llm/        # LLMClient (Mock no Gate 0)
src/cli/        # entrypoint commander
skills/         # manifestos convertidos (usabilidade no Gate 0)
tests/          # unit + integration + fixtures
docs/maia/      # governança MAIA deste repo
```

Documentação de arquitetura e especificação: ver `docs/maia/` e o hub **BKPilot-Producao_Produt**.

## Scripts úteis

| Comando | Função |
|---------|--------|
| `npm run build` | Compila para `dist/` |
| `npm run dev` | CLI em dev via tsx |
| `npm run lint` | ESLint em `src/` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest (unit) |
| `npm run test:coverage` | Vitest + cobertura |

## Governança MAIA

Leia `HANDOFF.md` antes de qualquer alteração. Skill pack oficial: `../BKPilot-Producao_Produt/docs/maia-skill-pack/`.
