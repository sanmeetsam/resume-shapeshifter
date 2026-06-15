# Manual test — Phase 3 (PDF export)

## Prerequisites

1. Complete Phase 2 flow at least once (analyze + tailor), or use sample data with a tailored run.
2. Install Chromium for Playwright:

```bash
npm run pdf:install
```

3. `.env` should include `PDF_RENDERER=playwright` (default in `.env.example`).

## Run

```bash
npm run dev
```

Open http://localhost:3000/tailor

## Test checklist

### Setup

1. **Load samples** → **Analyze** → **Generate tailored resume** (or use an existing tailored session).
2. Confirm section **4. Export** is visible after tailoring.

> If **Generate tailored resume** returns 404 after a dev-server restart, click **Analyze** again (the client sends the run from session storage, but a fresh analyze is safest after long idle).

### Tailored resume PDF

3. Click **Tailored resume PDF** → file downloads (`*-tailored-resume.pdf`).
4. Open PDF: contact, summary, skills, experience, education sections present.
5. Text is readable (Letter size, no clipped margins).

### Comparison PDF

6. Click **Comparison PDF** → file downloads (`*-comparison.pdf`).
7. Open PDF and verify:
   - Header: job title, company, date
   - Original vs tailored match scores and explanations
   - JD summary tags: skills, **tools**, keywords
   - Side-by-side bullets; changed lines highlighted (`<mark>` in HTML → yellow in PDF)
   - Gap analysis table (up to 12 rows)
   - Footer disclaimer (truthfulness + no ATS guarantee)

### Both + re-export

8. Click **Download both** → two files download.
9. Export again after download → section **4. Export** remains visible (status `exported`).
10. Refresh page → session restores; export still works.

### Error paths

11. **Without Chromium:** rename/move Playwright browser cache or use fresh clone without `pdf:install` → export shows `PDF_ENGINE_MISSING` with install hint.
12. **Unsupported renderer:** set `PDF_RENDERER=react-pdf` in `.env`, restart dev server → `PDF_RENDERER_UNSUPPORTED` error.
13. **Export before tailor:** analyze only, no tailor → export buttons disabled.

## API smoke test

After tailor, note `runId` from browser devtools / sessionStorage, then:

```bash
curl -s -X POST http://localhost:3000/api/export/pdf \
  -H "Content-Type: application/json" \
  -d '{"runId":"YOUR_RUN_ID","types":["comparison"]}' | jq '.files[0].filename'
```

Expect a JSON response with `files[].base64` (not an HTML error page).

## Unit tests (optional)

```bash
npm test -- tests/pdf-build-context.test.ts tests/pdf-renderer.test.ts
```

## Exit gate (portfolio)

- [ ] Save one comparison PDF from a real JD + sample resume for portfolio review.
- [ ] Confirm PDF generation works in your target deploy environment (or document local-only export per README).
