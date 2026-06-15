# PDF HTML templates

Phase 3 uses static HTML shells with dynamic sections injected by `lib/pdf/build-context.ts`.

| Template | Purpose |
|----------|---------|
| `tailored-resume.html` | ATS-friendly single-column tailored resume |
| `comparison-pdf.html` | Portfolio comparison report (scores, JD summary, diff, gaps) |

Placeholders use `{{name}}` syntax. Section builders in `build-context.ts` produce escaped HTML fragments for experience, scores, tags, etc.

Playwright converts the merged HTML to PDF via `lib/pdf/renderer.ts`. Set `PDF_RENDERER=playwright` in `.env`.
