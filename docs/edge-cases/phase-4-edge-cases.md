# Phase 4 — Guardrails & Validation Edge Cases

**Scope:** `lib/guardrails.ts`, post-tailor checks, UI risk/confidence, export confirmation.  
**Reference:** [implementation-plan.md](../implementation-plan.md) — Phase 4 · [architecture.md](../architecture.md) §7

---

## 1. Fabrication detection

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P4-E01 | New employer name in tailored bullet | critical | `riskFlag` + warning; block export if policy `block` | Fixture: new company |
| P4-E02 | Company rename (“Google” → “Alphabet”) subsidiary | medium | Allowlist fuzzy match or synonym map | Subsidiary edge |
| P4-E03 | New job title not in resume (“Staff Engineer”) | high | Flag; don’t block if title upgrade in same company | Title inflation |
| P4-E04 | New degree (“MBA”) in summary | critical | Strip or flag critical | Summary injection |
| P4-E05 | New certification (“AWS Solutions Architect”) | critical | Flag; `canSafelyAdd` already false in gaps | Cert in bullet |
| P4-E06 | Technology in tailored text never in resume | high | `riskFlag: "Unverified technology"` | Add “GraphQL” |
| P4-E07 | Technology in gap with “mention if familiar” — user didn’t add | medium | Still flag unless user explicitly accepted gap action (future) | Gap vs bullet |
| P4-E08 | Synonym tech (“JS” vs “JavaScript”) false positive | medium | Normalize aliases before flag | Alias table |
| P4-E09 | Soft skill added (“stakeholder management”) | medium | Warn low severity; often in JD not resume | Soft skill |

---

## 2. Metrics & impact claims

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P4-E10 | New percentage in tailored (“increased revenue 25%”) | critical | Flag; downgrade confidence | New % |
| P4-E11 | Same number different unit (“5” → “5 million”) | critical | Flag | Magnitude change |
| P4-E12 | Rounded number (“~100 users” → “100+ users”) | low | Allow if original has approximate | Tilde |
| P4-E13 | Numbers in words (“five”) vs digits (“5”) | medium | Normalize before compare | Word number |
| P4-E14 | Metric moved from another bullet (still in resume) | medium | Allow if digit exists anywhere in resume corpus | Moved metric |
| P4-E15 | Team size inflated (“team of 3” → “team of 12”) | high | Flag leadership scope | Team size |
| P4-E16 | Time range invented (“over 3 years”) | high | Flag if dates don’t support | Duration claim |

---

## 3. Keyword density & language

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P4-E17 | Keyword count 3x original bullet length | high | Warn `KEYWORD_STUFFING` | Stuffed bullet |
| P4-E18 | JD phrase repeated verbatim 5+ times across bullets | medium | Run-level warning | Repetition |
| P4-E19 | Passive voice → active (no claim change) | low | No flag | Style only |
| P4-E20 | Seniority inflation (“assisted” → “led organization-wide”) | high | Flag + low confidence | Verb inflation |
| P4-E21 | Acronym expansion truthful (“ML” → “machine learning”) | low | Allow | Acronym |
| P4-E22 | Acronym expansion false domain | high | Flag | Wrong expansion |

---

## 4. Confidence & risk metadata

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P4-E23 | LLM says `confidence: high` but guardrail flags risk | high | Override to `low` + set `riskFlag` | Override test |
| P4-E24 | Multiple risk flags on one bullet | medium | Concatenate or use primary | Several issues |
| P4-E25 | `riskFlag` set but empty string | low | Treat as no flag | `""` |
| P4-E26 | All bullets low confidence after guardrails | medium | Block export or require extra checkbox (config) | All low |
| P4-E27 | No bullets flagged but summary is risky | high | Run guardrails on summary/skills too | Summary only |

---

## 5. Orchestrator & API integration

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P4-E28 | Guardrails run before `tailoredMatch` — score reflects unfixed text | high | Order: tailor → guardrails → apply fixes → tailoredMatch | Pipeline order |
| P4-E29 | Auto-strip fabricated employer — user confusion | medium | MVP: warn-only; don’t silent strip without UI notice | Warn vs strip |
| P4-E30 | `warnings[]` duplicates | low | Dedupe messages | Same warning twice |
| P4-E31 | Critical violation — export API still works | high | If `blockExportOnCritical`, 403 on `/api/export/pdf` | Export blocked |
| P4-E32 | Warn-only mode — export allowed with warnings | medium | Default MVP behavior | Export with warnings |
| P4-E33 | Re-tailor clears previous warnings | medium | Recompute guardrails fresh | Second tailor |

---

## 6. Zod & prompt hardening

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P4-E34 | `tailored` shorter than min length (garbage) | high | Zod `.min(10)` or retry | `"Led."` |
| P4-E35 | `original` not exact substring of resume (whitespace diff) | medium | Normalize whitespace before compare | Space diff |
| P4-E36 | `changeReason` empty | medium | Zod require min length | Empty reason |
| P4-E37 | Adversarial bullet rewriter ignores system prompt | high | Guardrails as backstop; log incidents | Red-team prompt |

---

## 7. UI — review & export gate

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P4-E38 | User exports without checking verification box | high | Button disabled until checked | Click export |
| P4-E39 | User checks box without reading | low | Copy must say “verify truthfulness”; legal disclaimer | UX copy |
| P4-E40 | Warnings banner dismissed but risks remain | medium | Persist banner until re-tailor or acknowledge per warning | Dismiss |
| P4-E41 | Low-confidence styling invisible in dark mode | medium | Test theme contrast | Dark mode |
| P4-E42 | Screen reader doesn’t announce risk | medium | `aria-describedby` on flagged bullets | a11y |
| P4-E43 | Export modal closed mid-download | low | Don’t reset checkbox until complete | Cancel modal |
| P4-E44 | Keyboard: export without focusing checkbox | medium | Checkbox in tab order before export | Tab order |

---

## 8. False positives & false negatives

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P4-E45 | Legitimate rephrase flagged as new metric | high | Tune regex; allowlist numbers from same bullet tokens | False positive |
| P4-E46 | Subtle fabrication not caught (“extensive K8s” with no K8s) | high | LLM-assisted guardrail optional; manual review | False negative |
| P4-E47 | Company acronym expansion (“IBM” in JD, “International Business Machines” in resume) | medium | Entity linking optional | Acronym company |
| P4-E48 | User name contains number flagged as metric | low | Exclude contact block from metric scan | Name "Jay2" |

---

## 9. PDF disclaimer (cross-phase)

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P4-E49 | Comparison PDF missing ATS disclaimer | high | Verify template footer text | Open PDF |
| P4-E50 | Disclaimer contradicts UI checkbox text | medium | Align legal copy across surfaces | Copy review |

---

## Phase 4 checklist

- [ ] New employer/degree/cert/metric tests in `guardrails.test.ts`
- [ ] Confidence overridden when risk flagged
- [ ] Export checkbox required
- [ ] Warnings visible and not silently stripped
- [ ] False positive fixtures documented and tuned
- [ ] Pipeline: guardrails before final tailored score
