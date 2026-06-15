import { runPrompt } from "@/lib/llm/run-prompt";
import { ResumeProfileSchema } from "@/lib/schemas";
import { truncateText } from "@/lib/text-utils";

export async function parseResumeWithLlm(
  rawText: string,
  heuristicHint?: string,
  runId?: string
) {
  const trimmed = truncateText(rawText, 14_000);
  const hint = heuristicHint
    ? `\n\nHeuristic pre-parse hint (may be incomplete):\n${truncateText(heuristicHint, 4000)}`
    : "";

  return runPrompt({
    stage: "resume-parser",
    schema: ResumeProfileSchema,
    runId,
    userPrompt: `Parse this resume plain text into structured JSON.

Return JSON:
{
  "contact": { "name"?, "email"?, "phone"?, "location"?, "linkedin"?, "website"? },
  "summary": string,
  "skills": string[],
  "experience": [{ "company", "title", "startDate"?, "endDate"?, "bullets": string[] }],
  "projects": [{ "name", "description"?, "bullets"?, "technologies"? }],
  "education": [{ "institution", "degree"?, "field"?, "startDate"?, "endDate"?, "details"? }],
  "certifications": [{ "name", "issuer"?, "date"? }]
}

Use only information present in the resume. Empty arrays/strings are OK.

Resume:
"""
${trimmed}
"""${hint}`,
  });
}
