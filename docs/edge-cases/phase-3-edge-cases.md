# Phase 3 — PDF Export Edge Cases

**Scope:** HTML templates, Playwright/Puppeteer, `POST /api/export/pdf`, download UX.  
**Reference:** [implementation-plan.md](../implementation-plan.md) — Phase 3 · [architecture.md](../architecture.md) §10

---

## 1. Export API & run state

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P3-E01 | Export without prior tailor (`status: analyzed`) | high | 409 `INVALID_STATE` or export original-only with warning | Early export |
| P3-E02 | Unknown `runId` | high | 404 `RUN_NOT_FOUND` | Bad id |
| P3-E03 | Request `types: []` empty array | medium | 400 or default both PDFs | Empty types |
| P3-E04 | Invalid type e.g. `types: ["resume"]` | medium | 400 `INVALID_INPUT` | Wrong enum |
| P3-E05 | Run body sent in POST instead of runId (serverless store lost) | medium | Accept full `TailoringRun` in body as fallback | Body-only export |
| P3-E06 | Stale run — user tailored again but exports old sessionStorage | high | Always fetch latest by `runId` from store before render | Re-tailor then export |
| P3-E07 | Export twice — idempotent downloads OK | low | `status: exported` idempotent | Double click export |

---

## 2. PDF generator (Playwright / headless)

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P3-E08 | Chromium not installed locally | high | Clear error: run `npx playwright install chromium` | Fresh clone |
| P3-E09 | Vercel serverless: Playwright binary too large | critical | Document Node runtime / external PDF service / local-only export | Deploy test |
| P3-E10 | Function timeout (10s default) generating PDF | high | Increase timeout; simplify template; or queue job | Large run |
| P3-E11 | Concurrent PDF requests exhaust memory | high | Serialize browser instance or reuse single browser with pages | Parallel export |
| P3-E12 | Browser launch fails in CI | high | Skip PDF tests in CI or use docker image with deps | CI pipeline |
| P3-E13 | `page.pdf()` returns empty buffer | high | Validate buffer length > 0; fail with error | Broken template |
| P3-E14 | Wrong paper size / clipped content | medium | `format: 'Letter'`, margins, `@page` CSS | Visual inspect |
| P3-E15 | Fonts not embedded — special chars □□□ | medium | Use system fonts or embed web fonts in template | Unicode name |

---

## 3. HTML templates & data binding

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P3-E16 | User content breaks HTML (`<script>`, unclosed tags) | critical | Escape all dynamic text (`escapeHtml`) | XSS in bullet |
| P3-E17 | `&` in company name breaks entity | high | HTML-encode all interpolations | `AT&T` |
| P3-E18 | Very long job title breaks header layout | medium | CSS `word-break`, truncate with ellipsis | 200-char title |
| P3-E19 | 30+ gaps overflow comparison PDF | medium | Paginate or top-N gaps in PDF | Many gaps |
| P3-E20 | 50+ bullets — multi-page comparison | medium | Page breaks between roles; repeat column headers optional | Long career |
| P3-E21 | `company` missing on tailored experience entry | medium | Show title only | Optional company |
| P3-E22 | Bullet `original === tailored` — highlight? | low | No `<mark>` or subtle “unchanged” style | Unchanged pair |
| P3-E23 | `riskFlag` or `confidence` in PDF | medium | Optional icons/labels in comparison PDF | Phase 4 alignment |
| P3-E24 | Missing `tailoredMatch` when generating comparison | high | Block export or show “N/A” for tailored score | Incomplete run |
| P3-E25 | Date in header timezone wrong | low | Use UTC or user locale consistently | `createdAt` display |
| P3-E26 | External CSS/images blocked in headless | medium | Inline critical CSS; no CDN-only assets | Offline render |

---

## 4. Tailored resume PDF (single column)

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P3-E27 | Skills as long comma-separated line wraps poorly | medium | Column layout or bullet list in template | 40 skills |
| P3-E28 | Education section empty | low | Omit section heading | No education |
| P3-E29 | Contact email/phone invalid format | low | Render as plain text | Odd contact |
| P3-E30 | Multi-page resume — page numbers | low | Optional footer page numbers | 3+ pages |

---

## 5. Comparison PDF (proof artifact)

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P3-E31 | Two-column layout breaks on print narrow width | high | Fixed column widths; test print PDF | Print preview |
| P3-E32 | Highlight color invisible in B&W print | medium | Use underline or border + background | Grayscale |
| P3-E33 | Score explanation truncated | medium | Allow wrap; max 2–3 lines in summary box | Long explanation |
| P3-E34 | JD summary lists 100 skills — unreadable | medium | Top 10–15 in PDF; “+N more” | Huge JD |
| P3-E35 | Disclaimer missing or too small | high | Footer required per architecture §7.3 | Legal review |
| P3-E36 | Side-by-side misaligned bullets (different lengths) | medium | Row per bullet index; blank cell if missing | Uneven counts |
| P3-E37 | Gap table cell with long `suggestedAction` | medium | Wrap text; row height auto | Long action text |

---

## 6. Frontend download

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P3-E38 | Response `application/pdf` vs base64 JSON | medium | Document one approach; blob from binary | Download works |
| P3-E39 | Filename with special chars from job title | medium | Sanitize: `comparison-acme-engineer.pdf` | `Company/Role` |
| P3-E40 | Safari blocks download without user gesture | medium | Export only on button click (not auto) | Safari |
| P3-E41 | Double-click export — duplicate downloads | low | Disable button while loading | Double click |
| P3-E42 | Export succeeds but blob URL not revoked | low | `URL.revokeObjectURL` after download | Memory |
| P3-E43 | Partial failure — one of two PDFs fails | high | Return both or clear error; don’t send corrupt zip | One template error |
| P3-E44 | CORS if PDF served from different origin | medium | Same-origin API or proper headers | Cross-origin |

---

## 7. Content fidelity

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P3-E45 | PDF shows tailored text that differs from on-screen review | critical | Same `build-context(run)` for UI print preview optional | Diff check |
| P3-E46 | Original column shows tailored by mistake | critical | Map `original` from `TailoredBullet`, not resume after merge | Visual QA |
| P3-E47 | Scores in PDF don’t match UI | high | Single source `TailoringRun` fields | Compare numbers |

---

## Phase 3 checklist

- [ ] HTML escape all user-derived template fields
- [ ] Export gated on `status >= tailored`
- [ ] Chromium / deploy constraints documented
- [ ] Comparison PDF includes disclaimer, scores, gaps, highlights
- [ ] Download works Safari + Chrome
- [ ] Empty/missing optional sections don’t crash renderer
