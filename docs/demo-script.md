# Portfolio demo script — Resume Shapeshifter

Target runtime: **under 2 minutes** narrated. Use **Load demo (portfolio)** on `/tailor` for a curated resume + JD pair.

## Before recording

1. `nvm use` && `npm install`
2. Set `GROQ_API_KEY` in `.env`
3. `npm run dev` → http://localhost:3000
4. Optional: `npm run pdf:install` if you will export PDFs on camera

## Scene 1 — Problem (15s)

- Open landing page.
- Say: “Applying with one static resume misses JD keywords; inventing experience is risky.”

## Scene 2 — Input (20s)

- Click **Get started** → `/tailor`.
- Click **Load demo (portfolio)** (fills resume + JD).
- Mention you can also **upload PDF/DOCX** or paste text.
- Click **Analyze**.

## Scene 3 — Analysis (30s)

- Redirect lands on `/tailor/[runId]/analysis`.
- Point out: JD requirements summary, **original match score**, gap list (filter by high/medium).
- Click **Generate tailored resume**.

## Scene 4 — Review (35s)

- On `/tailor/[runId]/review`: side-by-side bullets, confidence badges, guardrail warnings if any.
- Highlight one bullet: what changed and why (change reason + keywords).
- Note tailored score vs original.

## Scene 5 — Export (20s)

- **Continue to export** → `/tailor/[runId]/export`.
- Check **I have verified all content is truthful**.
- Download **Comparison PDF** — portfolio proof artifact with disclaimer footer.

## Closing (10s)

- “Truthful tailoring with scores, gaps, guardrails, and exportable proof — not a black-box rewrite.”

## Fallbacks

| Issue | Action |
|-------|--------|
| Groq key missing | App uses mock data; say “offline demo mode” |
| PDF export fails | Run `npm run pdf:install`; or export locally only |
| Rate limit | Wait 60s or restart dev server |
