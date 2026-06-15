# Phase 5 — Polish & Demo Readiness Edge Cases

**Scope:** PDF/DOCX upload, route split, samples, deploy, observability, rate limits, optional persistence.  
**Reference:** [implementation-plan.md](../implementation-plan.md) — Phase 5

---

## 1. File upload (PDF / DOCX)

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P5-E01 | File exceeds `MAX_UPLOAD_MB` | high | 413 before parse; client pre-check size | 10MB file |
| P5-E02 | Wrong MIME type (`.pdf` renamed from `.exe`) | high | Magic-byte sniff + extension check | Fake pdf |
| P5-E03 | Empty PDF (0 pages) | high | 400 `EMPTY_DOCUMENT` | Empty upload |
| P5-E04 | Password-protected PDF | high | Clear error “remove password and retry” | Encrypted pdf |
| P5-E05 | Scanned image PDF (no text layer) | high | Extract returns empty; warn OCR not supported | Scan-only |
| P5-E06 | Multi-column resume PDF — text order scrambled | high | `parseWarnings`: column layout; suggest paste text | Two-column pdf |
| P5-E07 | Headers/footers repeated every line in extract | medium | Post-process dedupe lines | Page headers |
| P5-E08 | DOCX with complex tables | high | mammoth loses structure; warn | Table-heavy docx |
| P5-E09 | `.doc` legacy format uploaded | medium | Reject with “use DOCX or PDF” | Old .doc |
| P5-E10 | Corrupt file — parser throws | high | Catch; 400 `PARSE_FAILED` | Truncated pdf |
| P5-E11 | Upload + paste both provided | medium | Prefer upload or latest action; document precedence | Both inputs |
| P5-E12 | User switches from file to paste mid-flow | medium | Reset parse warnings; new analyze | Switch input mode |
| P5-E13 | Filename with unicode / long name | low | Sanitize stored name | Long filename |
| P5-E14 | Multiple files selected | medium | Accept first only or reject | Multi-select |
| P5-E15 | Virus/malware in upload | medium | Size limit; scan future; don’t execute content | — |

---

## 2. `rawText` retention & privacy

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P5-E16 | `rawText` stored in run — sessionStorage quota | medium | Truncate stored copy client-side; full on server TTL | Large upload |
| P5-E17 | `rawText` logged in observability | critical | Never log body; hash only | Log audit |
| P5-E18 | Temp files on disk not deleted | high | Delete after parse or TTL job | Disk check |
| P5-E19 | Uploaded file retained after parse | medium | Delete within 24h per architecture | Storage policy |

---

## 3. Route split & navigation

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P5-E20 | Direct URL `/tailor/[runId]/review` without analyze | high | Redirect to `/tailor` or analysis if invalid state | Deep link |
| P5-E21 | Invalid `runId` in URL | high | 404 page + link to start | Bad UUID |
| P5-E22 | Browser back from export to review — stale data | medium | Refetch run on focus | Back button |
| P5-E23 | Stepper shows wrong active step after refresh | medium | Derive step from `run.status` | Refresh on export |
| P5-E24 | User bookmarks analysis page — run expired | medium | “Session expired” + restart | Old bookmark |
| P5-E25 | Shared URL leaks PII in runId only — OK if no guessable ids | low | Use UUID v4 | — |

---

## 4. Sample data & demo

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P5-E26 | Load sample overwrites user work without confirm | medium | Confirm dialog if fields non-empty | Sample click |
| P5-E27 | Sample resume outdated vs current schema | high | Validate samples in CI | Schema bump |
| P5-E28 | Demo JD from expired job posting | low | Refresh demo fixtures periodically | Content review |
| P5-E29 | Demo path tailored score doesn’t improve | high | Curate fixtures until demo works; document fallback narration | Demo rehearsal |
| P5-E30 | Sample loads but API key missing | high | Disable tailor with message; samples view-only OK | No API key |

---

## 5. UX hardening

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P5-E31 | Error boundary crash on null `tailoredExperience` | high | Boundary + safe optional chaining | Null run |
| P5-E32 | Progress stuck at “Scoring…” after failure | high | Reset progress on error; show retry | Failed analyze |
| P5-E33 | Gap filter/sort with 0 gaps | low | Disable controls | Empty gaps |
| P5-E34 | Rate limit 429 on tailor — user message | medium | “Try again in a minute” | Hit limit |
| P5-E35 | Offline during export | medium | Network error on fetch | Offline |
| P5-E36 | Very small viewport (320px) | medium | All steps usable | Mobile |
| P5-E37 | prefers-reduced-motion + loading animations | low | Respect `prefers-reduced-motion` | a11y |

---

## 6. Deployment & environment

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P5-E38 | Production missing `OPENAI_API_KEY` | critical | Health check fails; don’t deploy silent | Prod env |
| P5-E39 | PDF works locally, fails on Vercel | critical | README “export locally” or dedicated PDF worker | Prod export |
| P5-E40 | Edge runtime incompatible with Playwright | high | Force `nodejs` runtime on export route | `export const runtime` |
| P5-E41 | Cold start + LLM + PDF exceeds max duration | high | Split routes; stream progress | Cold start |
| P5-E42 | CORS misconfiguration on production domain | medium | Same-site default Next.js | Custom domain |
| P5-E43 | Environment variable drift staging vs prod | medium | Production checklist in README | Checklist |

---

## 7. Observability

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P5-E44 | Logs contain resume snippet on error | critical | Redact; log stage + runId + error code | Error path |
| P5-E45 | Token usage undefined for non-OpenAI provider | low | Optional field in logs | — |
| P5-E46 | High-cardinality runId metrics cost | low | Aggregate counters only | — |

---

## 8. Optional persistence (SQLite / Supabase)

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P5-E47 | Migration not run on deploy | high | Fail startup or auto-migrate documented | Fresh DB |
| P5-E48 | JSON column too large for resume | medium | Compress or store blob storage | Huge JSON |
| P5-E49 | User A guesses User B runId | critical | Auth + RLS before multi-tenant | Security test |
| P5-E50 | Orphan runs never deleted | low | TTL cron optional | — |

---

## 9. Rate limiting & abuse

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P5-E51 | Bot spamming `/api/tailor` | high | IP rate limit; cap per hour | Flood requests |
| P5-E52 | Single IP shared NAT (office) blocked | medium | Softer limits + CAPTCHA future | Office NAT |
| P5-E53 | Huge paste to burn tokens | high | Char limit + rate limit | Attack paste |

---

## 10. End-to-end demo & portfolio

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P5-E54 | Live demo — OpenAI outage | high | Pre-recorded PDF backup; offline mode message | No network |
| P5-E55 | Live demo — slow network | medium | Pre-run analyze before presentation | Rehearsal |
| P5-E56 | Comparison PDF embarrassing typo | medium | Spell-check template labels | QA PDF |
| P5-E57 | Portfolio reviewer tests injection in sample | medium | Samples are static files, not user input | Security |
| P5-E58 | Definition of done: upload path skipped in demo | low | Demo script includes paste path minimum | Script review |

---

## 11. Cross-phase regressions (verify in Phase 5)

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P5-E59 | File upload path bypasses guardrails | critical | Same pipeline after parse to text | Upload → tailor |
| P5-E60 | sessionStorage + DB persistence conflict | medium | Single source of truth documented | Both enabled |
| P5-E61 | Phase 1 mock API still reachable | low | Remove or guard with `NODE_ENV` | Accidental mock |

---

## Phase 5 checklist

- [ ] PDF/DOCX size, MIME, corrupt, encrypted, scanned cases handled
- [ ] Parse warnings shown; paste fallback documented
- [ ] Deep links respect run state machine
- [ ] Sample load confirms overwrite
- [ ] Production deploy checklist complete
- [ ] No PII in logs; temp files cleaned
- [ ] Full demo script passes in &lt; 2 minutes
- [ ] Rate limits on expensive routes
