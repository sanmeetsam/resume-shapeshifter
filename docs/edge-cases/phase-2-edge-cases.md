# Phase 2 — LLM Integration Edge Cases

**Scope:** Parsers, match/gap/tailor engines, orchestrator, API routes, LLM client. Paste text only.  
**Reference:** [implementation-plan.md](../implementation-plan.md) — Phase 2 · [architecture.md](../architecture.md) §5–6

---

## 1. API routes & request validation

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P2-E01 | `POST /api/analyze` missing `resumeText` or `jdText` | high | 400 `INVALID_INPUT` | Partial body |
| P2-E02 | Body exceeds serverless payload limit (~4–6MB) | high | 413 `PAYLOAD_TOO_LARGE` with max size message | Huge JSON |
| P2-E03 | `POST /api/tailor` with unknown `runId` | high | 404 `RUN_NOT_FOUND` | Random UUID |
| P2-E04 | Tailor called when run `status` is `draft` (not analyzed) | high | 409 `INVALID_STATE` | Skip analyze |
| P2-E05 | Double tailor on same run | medium | Replace `tailoredResume` + `tailoredMatch`; keep original match | Idempotent replace |
| P2-E06 | `GET /api/runs/:id` after server restart (in-memory store) | high | 404; UI falls back to sessionStorage + message | Restart server |
| P2-E07 | Malformed JSON body | high | 400, no stack trace to client | Invalid JSON |
| P2-E08 | Concurrent analyze requests same session | medium | Each creates new `runId` or document behavior | Parallel POST |

---

## 2. LLM client & `run-prompt`

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P2-E09 | OpenAI rate limit (429) | high | Retry with backoff once; then 503 `LLM_RATE_LIMIT` | Mock 429 |
| P2-E10 | OpenAI timeout / gateway timeout | high | 504 `LLM_TIMEOUT`; user retry | Slow mock |
| P2-E11 | Invalid API key (401) | high | 503 `LLM_AUTH_FAILED`; log server-side only | Wrong key |
| P2-E12 | Model returns markdown wrapped JSON ` ```json ` | high | Strip fences before `JSON.parse` | Fixture response |
| P2-E13 | Model returns prose + JSON | high | Extract first `{...}` or use JSON mode | Mixed output |
| P2-E14 | Truncated JSON (max tokens) | high | Zod fail → one retry with “complete the JSON”; else fail | Truncated mock |
| P2-E15 | Valid JSON, fails Zod (wrong types) | high | Retry with validation errors in prompt | Wrong types |
| P2-E16 | Second retry still fails | high | 502 `LLM_VALIDATION_FAILED` + safe message | Two failures |
| P2-E17 | Empty LLM content | high | Treat as failure; retry once | `""` response |
| P2-E18 | Token usage exceeds budget mid-pipeline | high | Fail gracefully at stage X; return partial run if useful | Very long JD |
| P2-E19 | `LLM_MODEL` deprecated or unavailable | high | Clear error; document supported models | Bad model name |

---

## 3. JD parser

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P2-E20 | JD is vague (“team player”, “fast-paced”) | medium | Still extract; gaps may be empty; explanation notes low specificity | Generic JD |
| P2-E21 | JD lists 80+ required skills | high | Truncate/dedupe top N for prompts; store full list if parsed | Amazon-style JD |
| P2-E22 | JD in non-English | medium | Extract anyway or detect language + warn | Non-English JD |
| P2-E23 | JD is actually a rejection email or wrong paste | medium | Low scores, nonsense title; UI “verify JD” hint | Wrong content |
| P2-E24 | Duplicate skills (“Python”, “python”, “Python 3”) | medium | Normalize lowercase in post-process | Dedupe |
| P2-E25 | No job title found | medium | Default `jobTitle: "Unknown role"` | Missing title |
| P2-E26 | Seniority contradictory (“Junior” + “10 years required”) | medium | Pick dominant signal; mention in explanation | Conflicting JD |
| P2-E27 | JD contains only benefits/legal boilerplate | medium | Weak extraction; warn user | Short boilerplate |

---

## 4. Resume parser (plain text)

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P2-E28 | Non-standard section headers (“Where I’ve Worked”) | high | Heuristic + LLM cleanup; `parseWarnings[]` | Creative headers |
| P2-E29 | Multiple jobs under one company block | medium | LLM may merge/split; prefer one entry per role if dates differ | Nested roles |
| P2-E30 | Freelance / contract without company name | medium | Allow `company: "Contract"` or client name from text | Solo contractor |
| P2-E31 | Gaps in employment dates missing | low | Optional dates empty | No dates |
| P2-E32 | Academic CV format (publications first) | medium | Misclassified sections; warning | Academic resume |
| P2-E33 | One-page resume with no “Skills” section | medium | Infer skills from bullets in match engine | No skills block |
| P2-E34 | Bullets use `•`, `-`, `*`, numbered lists | medium | Normalize bullet chars before LLM | Mixed markers |
| P2-E35 | Resume mostly tables (pasted from Word) | medium | Garbled order; warn “paste as plain text” | Tab-separated mess |
| P2-E36 | PII: SSN, full address in contact | medium | Parse as-is; don’t log; optional redact in logs only | Privacy |
| P2-E37 | Empty experience but long projects | medium | Score from projects; tailor project bullets if in scope | Project-heavy |

---

## 5. Match engine

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P2-E38 | Score appears falsely precise (73 vs 72) | medium | Show sub-scores + explanation; avoid implying scientific accuracy | UI copy |
| P2-E39 | Tailored score lower than original | high | Allow; don’t clamp upward; explain in UI | Bad tailor run |
| P2-E40 | All sub-scores 0 but overall > 0 | high | Zod custom refine or recompute overall from subs | Invalid combo |
| P2-E41 | Synonym skills not matched (“K8s” vs “Kubernetes”) | medium | Synonym map in `lib/scoring.ts` seed data | Alias list |
| P2-E42 | Skill in JD as “nice to have” parsed as required | medium | Prompt distinguishes; gap importance reflects | Preferred vs required |
| P2-E43 | User overqualified for JD | medium | Seniority score may be low; don’t penalize harshly in copy | Senior app to junior |
| P2-E44 | JD requires clearance/cert user doesn’t have | high | `criticalMissingRequirements`; gap `canSafelyAdd: false` | Clearance gap |
| P2-E45 | Re-score after tailor uses empty bullets | high | Build virtual resume from `tailored` strings before score | Integration test |

---

## 6. Gap engine

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P2-E46 | Gap suggests “add skill” for required tech user lacks | high | `canSafelyAdd: false`; action “Prepare for interview” | AWS gap |
| P2-E47 | Skill mentioned only in skills list, not bullets | medium | Classify as “weak” not “missing” | Weak representation |
| P2-E48 | 50+ gaps returned | medium | Cap display at top 15 by importance; store full list | Noisy JD |
| P2-E49 | Duplicate gaps same name | medium | Dedupe by normalized name | Duplicate entries |
| P2-E50 | Gap `jdEvidence` empty | low | Fallback to skill name as evidence | Missing evidence field |

---

## 7. Tailoring engine

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P2-E51 | LLM invents new employer | critical | Phase 4 guardrail; Phase 2: prompt + manual review | Adversarial test |
| P2-E52 | LLM adds metrics (“40% increase”) not in original | critical | Prompt forbid; flag in `riskFlag` when detected | Metric injection |
| P2-E53 | LLM keyword-stuffs JD terms unnaturally | high | Prompt + density check Phase 4 | Stuffed bullet |
| P2-E54 | Original bullet unchanged but marked high confidence | medium | Allow `tailored === original`; reason “Already aligned” | No-op rewrite |
| P2-E55 | Batch rewrite drops a bullet | critical | Count bullets in/out per role; fail batch if mismatch | Bullet count test |
| P2-E56 | Role with 20+ bullets — context overflow | high | Batch by 5–8 bullets; merge results | Long tenure |
| P2-E57 | `original` in output doesn’t match source bullet | high | Zod refine: `original` must be in source set | Wrong original |
| P2-E58 | Tailored summary claims experience not in resume | critical | Summary prompt stricter; optional skip summary in MVP | Summary fabrication |
| P2-E59 | Reordering skills implies proficiency user doesn’t have | medium | Order only, don’t add skills | Skills section |
| P2-E60 | Intern resume + senior JD → inflated language | high | Prompt: preserve career level | Student resume |

---

## 8. Orchestrator

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P2-E61 | Failure at gap step after score computed | medium | Return partial? MVP: fail entire analyze | Fail JD parse mid |
| P2-E62 | Failure at bullet 3 of 5 batches | high | Fail tailor with completed batches or all-or-nothing (document) | Partial tailor |
| P2-E63 | Analyze succeeds, tailor fails — run state | high | `status: analyzed`; tailor retryable | State machine |
| P2-E64 | Race: GET run during tailor | low | Immutable snapshot per request or lock | Concurrent GET |

---

## 9. Frontend (Phase 2)

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P2-E65 | Analyze takes 45s+ — user navigates away | medium | AbortController optional; show progress stages | Long wait |
| P2-E66 | sessionStorage out of sync with server run | high | After API success, overwrite local with server response | Compare ids |
| P2-E67 | Error message exposes OpenAI internals | high | Generic user message; log details server-side | Trigger 401 |
| P2-E68 | `keywordsAddressed` empty array always | low | UI hides section if empty | Empty keywords |
| P2-E69 | Very low confidence on all bullets | medium | Banner: “Review carefully” | All low |

---

## 10. Security

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P2-E70 | API key in client bundle | critical | Only server imports `lib/llm` | Build analyze |
| P2-E71 | Prompt injection in resume (“ignore instructions”) | high | System prompt hardening; delimit user content | Injection string |
| P2-E72 | Logging full resume/JD in production | high | Log `runId` + hash only | Log review |

---

## Phase 2 checklist

- [ ] All LLM outputs Zod-validated with single retry
- [ ] API errors use standard shape, no secret leakage
- [ ] run-store 404 handled after restart
- [ ] Bullet count preserved per experience entry
- [ ] Tailored score can be lower than original (handled in UI)
- [ ] Prompt injection test in resume/JD fields
