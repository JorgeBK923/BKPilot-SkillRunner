# Gate 0 Cursor/Groq - BKPilot-SkillRunner

- Data: 2026-05-25
- Skill: usabilidade
- LLM: Groq (`llama-3.3-70b-versatile`)
- Execution ID: gate0-001-cursor
- Evidencias locais: `outputs/gate0-001-cursor/` (gitignored)

## Comando executado

```bash
npm run gate0:cursor
```

## Metricas reais

| Metrica | Valor |
|---|---:|
| status | completed |
| duration_ms | 8581 |
| llm_calls | 1 |
| tokens | 964 total (175 in, 789 out) |
| report bytes | 7260 |
| eventos | 10 |

Artefatos gerados: 4 (`execution-log.json`, `report.md`, `result.json`, `screenshot.png`).

## Paridade

DUVIDA EXPLICITA: sem baseline Claude Code disponivel; paridade nao calculavel. Execucao real feita com Groq.

## Veredito

APROVADO. Status `completed`; paridade abaixo de 80% e ressalva de prompt, nao falha de Engine.
