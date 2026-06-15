# Resume Shapeshifter

JD-to-resume tailoring engine: match scoring, gap analysis, truthful bullet rewrites, and side-by-side PDF proof artifacts.

## Documentation

- [Problem statement](docs/problemStatement.md)
- [Architecture](docs/architecture.md)
- [Implementation plan](docs/implementation-plan.md)
- [Phase 3 manual test (PDF export)](docs/manual-test-phase3.md)
- [Portfolio demo script](docs/demo-script.md)
- [Deployment plan](docs/deployment-plan.md) (canonical)
- [Deployment quick reference](docs/deploy.md)
- [Edge cases (by phase)](docs/edge-cases/README.md)

## Prerequisites

- **Node.js** 20.9+ (use `nvm use` — see `.nvmrc`)
- **npm** 9+

## Setup

```bash
npm install
cp .env.example .env
# Edit .env and set GROQ_API_KEY when running LLM features (Phase 2+)
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Next.js dev server at [http://localhost:3000](http://localhost:3000) |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint |
| `npm test` | Run Vitest schema/unit tests |
| `npm run pdf:install` | Install Chromium for PDF export (Playwright) |

## Environment variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GROQ_API_KEY` | Phase 2+ | — | Server-side Groq API key (never expose to the client) |
| `GROQ_BASE_URL` | No | `https://api.groq.com/openai/v1` | Groq OpenAI-compatible endpoint |
| `LLM_MODEL` | No | `llama-3.3-70b-versatile` | Groq model for extraction, scoring, and tailoring |
| `MAX_UPLOAD_MB` | No | `5` | Max resume upload size in MB |
| `API_RATE_LIMIT_PER_MIN` | No | `10` | Per-IP limit for tailor/export APIs |
| `PDF_RENDERER` | Phase 3+ | `playwright` | PDF generation backend (`playwright` only for MVP) |
| `DATABASE_URL` | No | — | Optional persistence (future) |

## Project structure (Phase 0)

```
app/              Next.js App Router pages and API routes
components/       UI components (incl. shadcn/ui)
hooks/            React hooks
lib/              Shared utilities and Zod schemas
prompts/          LLM prompt modules (Phase 2+)
services/         Domain services (Phase 2+)
templates/        PDF HTML templates (Phase 3+)
tests/            Vitest tests and JSON fixtures
docs/             Product and engineering docs
```

## Phase status

- [x] **Phase 0** — Bootstrap, schemas, fixtures, tests
- [x] **Phase 1** — Static prototype UI (mock analyze/tailor flow)
- [x] **Phase 2** — Groq LLM integration (parse, score, gap, tailor)
- [x] **Phase 3** — PDF export (Playwright)
- [x] **Phase 4** — Guardrails (deterministic checks, warnings UI, export verification)
- [x] **Phase 5** — Polish (upload, route split, demo script, UX, deploy docs)

## Tailor flow routes

| Route | Step |
|-------|------|
| `/tailor` | Paste/upload resume + JD, analyze |
| `/tailor/[runId]/analysis` | Scores, gaps, generate tailored resume |
| `/tailor/[runId]/review` | Side-by-side diff + guardrail warnings |
| `/tailor/[runId]/export` | PDF download (verification checkbox required) |

Use **Load demo (portfolio)** for a one-click demo path. See [docs/demo-script.md](docs/demo-script.md).

## PDF export (Playwright)

PDF generation runs **server-side only** and requires Chromium:

```bash
npm run pdf:install
```

**Vercel / serverless:** Playwright + Chromium may exceed serverless limits. For production deploy, use a Node.js runtime with sufficient memory/timeout, or run export locally. The export API accepts a full `run` object in the request body so PDFs still work if the in-memory server store was cleared.

## License

Private / portfolio use.
