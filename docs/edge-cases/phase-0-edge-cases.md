# Phase 0 — Bootstrap Edge Cases

**Scope:** Project setup, Zod schemas, folder skeleton, fixtures, env config.  
**Reference:** [implementation-plan.md](../implementation-plan.md) — Phase 0

---

## 1. Tooling & project setup

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P0-E01 | `create-next-app` with `src/` vs flat `app/` mismatch vs docs | medium | Pick one layout; update architecture paths in README once | Dev server starts |
| P0-E02 | Node version below Next.js minimum | high | Document `engines.node` in `package.json`; fail CI with clear message | `node -v` check |
| P0-E03 | Shadcn init conflicts with existing Tailwind config | medium | Follow Shadcn docs; don’t duplicate `tailwind.config` plugins | `npm run build` |
| P0-E04 | Path alias `@/` not configured | medium | Set `paths` in `tsconfig.json` + Next config | Import from `@/lib/schemas` |
| P0-E05 | ESLint/Prettier not aligned — inconsistent imports | low | Run lint on commit or document format command | `npm run lint` |

---

## 2. Environment & secrets

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P0-E06 | `.env` committed with real API key | critical | `.gitignore` includes `.env`; only `.env.example` in repo | `git status` |
| P0-E07 | Missing `OPENAI_API_KEY` at runtime (Phase 2+) | high | Server routes fail with `503` + code `LLM_NOT_CONFIGURED`, not stack trace | Start without key |
| P0-E08 | Empty string env vars (`LLM_MODEL=""`) | medium | Fall back to documented default in code | Unit test default |
| P0-E09 | `MAX_UPLOAD_MB` non-numeric | low | Parse with fallback `5` | Invalid env |

---

## 3. Zod schemas (`lib/schemas.ts`)

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P0-E10 | Optional fields omitted vs `null` vs `undefined` from LLM | high | Use `.nullish()` or `.transform()` to normalize; document canonical empty as `[]` or `""` | Fixture with `null` arrays |
| P0-E11 | `overallScore` outside 0–100 | high | `.min(0).max(100)` on all score fields | Parse `{ overallScore: 150 }` → fail |
| P0-E12 | `confidence` typo (`"High"`, `"HIGH"`) | high | `z.enum(["high", "medium", "low"])` or `.transform(toLowerCase)` | Invalid enum fails |
| P0-E13 | Empty `experience` array — valid resume? | medium | Allow; UI shows “no experience parsed” warning later | Valid schema, empty array |
| P0-E14 | Extra unknown keys in LLM JSON | medium | `.strict()` on LLM outputs OR `.strip()` with logging | Extra key stripped/fails |
| P0-E15 | Very long strings (100k+ char resume in schema) | medium | Optional `.max()` on text fields at API layer, not necessarily schema | API rejects over limit |
| P0-E16 | Unicode names, emoji, RTL text in contact | medium | Schema accepts UTF-8; no ASCII-only regex on names | Fixture with `José`, `北京` |
| P0-E17 | `TailoringRun` missing `tailoredResume` before tailor step | high | Make `tailoredResume` optional until `status >= tailored` OR use partial type | `status: analyzed` without tailor |
| P0-E18 | Invalid ISO date strings in `createdAt` | low | `z.string().datetime()` or custom date validator | Bad date fails |
| P0-E19 | Duplicate skill strings differing only by case | medium | Normalizer in service layer (Phase 2), not schema | `Java` vs `java` |
| P0-E20 | `importance` on gaps not in enum | high | Strict enum `high \| medium \| low` | Invalid gap fails |

---

## 4. Fixtures & tests

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P0-E21 | Fixture JSON doesn’t match latest schema | high | `schemas.test.ts` loads every fixture on CI | All fixtures parse |
| P0-E22 | `mock-tailoring-run.json` missing required nested fields | high | Test fails at CI | CI green |
| P0-E23 | Fixture uses snake_case vs camelCase | medium | Standardize on camelCase per architecture | Rename keys |
| P0-E24 | Test runner not configured (Vitest vs Jest) | medium | Document `npm test` in README | `npm test` passes |

---

## 5. Repository layout

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P0-E25 | Circular imports between `lib/schemas` and `services` | high | Schemas only in `lib/`; services import schemas, never reverse | Build succeeds |
| P0-E26 | Client component importing server-only LLM client | critical | `lib/llm/*` only imported from `app/api` or `services` | ESLint boundary or build error |
| P0-E27 | Missing `tests/fixtures/` in git | low | Commit minimal fixtures in Phase 0 | Clone fresh repo → tests pass |

---

## 6. README & developer experience

| ID | Edge case | Severity | Expected handling | Test |
|----|-----------|----------|-------------------|------|
| P0-E28 | README env vars out of sync with `.env.example` | medium | Single source: comment each var in `.env.example` | Manual compare |
| P0-E29 | `npm run dev` port already in use | low | Document `PORT=3001` override | — |

---

## Phase 0 checklist (before Phase 1)

- [ ] All fixtures validate with Zod
- [ ] `.env` gitignored; `.env.example` complete
- [ ] No server-only code importable from client components
- [ ] `TailoringRun` supports partial state for `analyzed` without tailor
