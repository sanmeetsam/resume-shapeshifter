import { JobDescriptionProfileSchema } from "@/lib/schemas";
import { runPrompt } from "@/lib/llm/run-prompt";
import { truncateText } from "@/lib/text-utils";

export async function extractJobDescription(
  jdText: string,
  runId?: string
) {
  const trimmed = truncateText(jdText, 12_000);

  return runPrompt({
    stage: "jd-extraction",
    schema: JobDescriptionProfileSchema,
    runId,
    userPrompt: `Extract structured job requirements from this job description.

Return JSON matching this shape:
{
  "jobTitle": string (required),
  "company": string (optional),
  "requiredSkills": string[],
  "preferredSkills": string[],
  "responsibilities": string[],
  "qualifications": string[],
  "tools": string[],
  "keywords": string[],
  "seniorityLevel": string,
  "domainSignals": string[]
}

Job description:
"""
${trimmed}
"""`,
  });
}
