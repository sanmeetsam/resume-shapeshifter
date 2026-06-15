# Deployment quick reference

**Full plan:** [deployment-plan.md](./deployment-plan.md) — prerequisites, Vercel setup, serverless limits, verification, and troubleshooting.

## Recommended host

- **Vercel** — Next.js App Router + API routes
- **Groq** — `GROQ_API_KEY` server-side only

## Hobby plan limits

- **Memory:** max **2048 MB** per function (`vercel.json` uses 2048 for PDF export, 1024 for others).
- **Duration:** Hobby functions are often capped at **10s**; `/api/tailor` requests **180s** and may need **Pro** for long LLM runs.

## Vercel setup (summary)

1. Import Git repo → Framework: **Next.js** → Node **20** (`.nvmrc`).
2. Set `GROQ_API_KEY` (required). See [.env.example](../.env.example) for optional vars.
3. Deploy → run the [post-deploy checklist](./deployment-plan.md#7-post-deploy-verification) in the deployment plan.

## PDF on Vercel

Serverless PDF uses `playwright-core` + `@sparticuz/chromium` (see `lib/pdf/launch-browser.ts`). If export fails, set `AWS_LAMBDA_JS_RUNTIME=nodejs22.x` in the Vercel dashboard and see [deployment-plan.md §6.2](./deployment-plan.md#62-pdf-export-playwright--chromium).

## Health check

`GET /api/health` — returns `llmConfigured`, `pdfReady`, and `serverless` flags for deploy smoke tests.

## Local smoke test

```bash
npm run build && npm run start
# http://localhost:3000/tailor → Load demo → Analyze → Tailor → Export
```
