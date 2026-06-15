# Edge Cases — Phase Reference Index

Use these documents while implementing each phase of [`implementation-plan.md`](../implementation-plan.md). Each file lists edge cases, expected behavior, and suggested tests.

| Phase | Document | When to open |
|-------|----------|--------------|
| **0** | [phase-0-edge-cases.md](./phase-0-edge-cases.md) | Bootstrap, schemas, fixtures |
| **1** | [phase-1-edge-cases.md](./phase-1-edge-cases.md) | Static UI, mocks, sessionStorage |
| **2** | [phase-2-edge-cases.md](./phase-2-edge-cases.md) | LLM, parsers, orchestrator, APIs |
| **3** | [phase-3-edge-cases.md](./phase-3-edge-cases.md) | PDF generation and export |
| **4** | [phase-4-edge-cases.md](./phase-4-edge-cases.md) | Guardrails, risk flags, export gate |
| **5** | [phase-5-edge-cases.md](./phase-5-edge-cases.md) | Upload, routes, deploy, demo |

**Conventions in each file:**

- **Severity:** `critical` (breaks flow / trust), `high` (bad UX or wrong output), `medium` (degraded but recoverable), `low` (cosmetic or rare)
- **Handling:** what the code should do
- **Test:** suggested unit/integration/manual check

Cross-cutting product risks are in [`problemStatement.md`](../problemStatement.md) §17 and [`architecture.md`](../architecture.md) §16.
