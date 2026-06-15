# Manual test — Phase 2 (Groq)

## Prerequisites

1. Node 20+: `nvm use`
2. Copy env: `cp .env.example .env`
3. Set `GROQ_API_KEY` from [console.groq.com](https://console.groq.com)
4. Optional: `LLM_MODEL=llama-3.3-70b-versatile` (default)

## Run

```bash
npm run dev
```

Open http://localhost:3000/tailor

## Test checklist

1. Click **Load samples** → paste fields fill.
2. Click **Analyze** → wait (30–90s) → JD summary, original score, gaps appear.
3. Click **Generate tailored resume** → wait → side-by-side bullets with reasons and confidence.
4. Confirm tailored match score appears (right column).
5. Refresh page → session restores analysis/tailor state (same run id in sessionStorage).
6. Change resume text → warning to re-analyze; tailor disabled until re-analyze.
7. In **Export**, download tailored PDF, comparison PDF, or both — open files and verify layout.
8. If export fails with `PDF_ENGINE_MISSING`, run `npm run pdf:install`.

**Phase 3 PDF-only checklist:** see [manual-test-phase3.md](./manual-test-phase3.md).

## API smoke tests

```bash
# Analyze
curl -s -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"resumeText":"Software engineer...","jdText":"Full stack role..."}' | jq .runId

# Tailor (replace RUN_ID)
curl -s -X POST http://localhost:3000/api/tailor \
  -H "Content-Type: application/json" \
  -d '{"runId":"RUN_ID"}' | jq .tailoredMatch.overallScore
```

## Without API key

Unset `GROQ_API_KEY` → app falls back to Phase 1 fixture mocks (banner still shows Groq in header; responses use sample data).
