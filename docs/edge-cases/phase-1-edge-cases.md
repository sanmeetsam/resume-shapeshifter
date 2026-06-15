# Phase 1 — Static Prototype Edge Cases

**Scope:** Mock orchestrator, paste-only UI, sessionStorage, stub APIs, side-by-side preview.  
**Reference:** [implementation-plan.md](../implementation-plan.md) — Phase 1

---

## 1. User input (resume & JD textareas)

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P1-E01 | Empty resume, user clicks Analyze | high | Disable button; inline hint “Paste your resume” | Click disabled |
| P1-E02 | Empty JD only | high | Same for JD field | — |
| P1-E03 | Whitespace-only input (`"   \n\t"`) | high | Treat as empty after `trim()` | Trim before validate |
| P1-E04 | Extremely long paste (500k+ chars) | medium | Optional client max length + message; don’t freeze browser | Paste large text |
| P1-E05 | Resume with only contact block, no experience | medium | Mock still returns run; UI shows empty experience section | Short resume |
| P1-E06 | JD is a URL string only, not job text | medium | Phase 1: no URL fetch; show mock anyway; Phase 2+ warn “paste full description” | URL in JD field |
| P1-E07 | Copy-paste from PDF with broken line breaks | low | Display raw; Phase 2 parser handles | Visual check |
| P1-E08 | HTML/rich text pasted into textarea | medium | Strip tags on paste optional, or store as plain text | `<script>` in paste |
| P1-E09 | Duplicate analyze clicks while “loading” | medium | Disable Analyze during in-flight mock delay | Double-click |
| P1-E10 | Special characters: `&`, `<`, quotes in bullets | medium | React escapes by default; no `dangerouslySetInnerHTML` | XSS-safe render |

---

## 2. Mock orchestrator

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P1-E11 | Mock ignores actual resume/JD content — user confusion | medium | UI label: “Demo data” or “Preview mode” until Phase 2 | Copy on page |
| P1-E12 | Mock returns same scores every time | low | Acceptable for Phase 1; vary slightly optional | — |
| P1-E13 | `createMockTailoringRun` throws on null input | high | Guard at hook level before calling mock | Null safe |
| P1-E14 | Mock `TailoringRun` missing fields UI expects | high | Mock must satisfy full Zod schema for tailored state | Parse mock output |
| P1-E15 | Heuristic parse splits wrong sections | low | Phase 1 optional; don’t block on accuracy | Weird section headers |

---

## 3. sessionStorage & runId

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P1-E16 | `sessionStorage` unavailable (private mode, quota) | high | Try/catch; fall back to in-memory React state only; warn user refresh loses data | Safari private |
| P1-E17 | Quota exceeded storing large run JSON | medium | Store runId + fetch from stub API in Phase 1.4; or trim raw text from stored object | Huge resume |
| P1-E18 | Corrupt JSON in sessionStorage | medium | `JSON.parse` try/catch; clear key; show “session expired, start over” | Manual corrupt key |
| P1-E19 | Stale schema version in storage after deploy | medium | Add `schemaVersion` to stored run; mismatch → clear | Bump version |
| P1-E20 | User opens two tabs, overwrites same key | medium | Key by `runId`; new analyze creates new id | Two tabs |
| P1-E21 | Refresh mid-flow — which step restores? | medium | Persist `status` + scroll to last completed section | Refresh on review |
| P1-E22 | Invalid UUID in URL (Phase 1 single page may not use URL) | low | If `runId` in query, validate format | Bad query param |

---

## 4. UI components

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P1-E23 | `SideBySideDiff` with unequal bullet counts | high | Pair by index; extra bullets in one column still render | Mock uneven arrays |
| P1-E24 | Bullet with empty `original` or `tailored` | medium | Show placeholder “—”; don’t crash | Empty string bullet |
| P1-E25 | Very long bullet (500+ words) | medium | Scroll/truncate with expand; mobile stack | Long text |
| P1-E26 | `GapAnalysis` empty array | medium | Empty state: “No gaps identified (mock)” | Zero gaps |
| P1-E27 | Score exactly 0 or 100 in mock | low | Display without breaking gauges | Boundary scores |
| P1-E28 | Missing `company` on JD profile | medium | Show “Company not specified” | Optional field |
| P1-E29 | Mobile: side-by-side unreadable | medium | Stack columns vertically under `md` breakpoint | Responsive test |
| P1-E30 | Tailored score shown before tailor clicked | medium | Hide tailored `ScoreCard` until `status === tailored` | State gating |
| P1-E31 | Export section clicked in Phase 1 | low | Disabled or “Coming in Phase 3” toast | Stub export |

---

## 5. Stub API routes (if implemented)

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P1-E32 | `POST /api/analyze` wrong Content-Type | medium | 415 or parse JSON safely | `text/plain` body |
| P1-E33 | Missing body fields `{ resumeText, jdText }` | high | 400 `{ error, code: "INVALID_INPUT" }` | Empty POST |
| P1-E34 | GET vs POST misuse | low | 405 Method Not Allowed | GET analyze |
| P1-E35 | Network failure from client | medium | TanStack Query error state + retry | Offline devtools |
| P1-E36 | Fixture file missing on disk | high | 500 with log; CI ensures fixtures exist | Delete fixture |

---

## 6. State machine / flow

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P1-E37 | User clicks Tailor before Analyze | high | Disable Tailor until `status >= analyzed` | Order enforcement |
| P1-E38 | User edits resume after analyze without re-analyze | medium | Warn “Inputs changed” or reset status to `draft` | Edit after analyze |
| P1-E39 | Multiple rapid Tailor clicks | medium | Idempotent mock; disable button while loading | Double tailor |
| P1-E40 | Browser back button from `/tailor` | low | State from sessionStorage or reset | Navigation |

---

## 7. Accessibility & UX (baseline)

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P1-E41 | Analyze button not keyboard reachable | medium | Focus order; Enter submits from textarea optional | Tab + Enter |
| P1-E42 | Loading state without screen reader text | medium | `aria-busy` on main panel | a11y audit |
| P1-E43 | Color-only confidence indicators | medium | Add text label: High / Medium / Low | Colorblind check |

---

## Phase 1 checklist

- [ ] Empty/whitespace inputs blocked
- [ ] sessionStorage failures handled gracefully
- [ ] UI gates tailor behind analyze
- [ ] Mock data validates against Zod
- [ ] Side-by-side handles uneven bullet lists
- [ ] Mobile layout stacks columns
