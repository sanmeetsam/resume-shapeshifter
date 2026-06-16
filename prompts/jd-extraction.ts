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
  "jobTitle": string (optional, default to "Unknown Position" if not found),
  "company": string (optional),
  "requiredSkills": string[],
  "preferredSkills": string[],
  "responsibilities": string[],
  "qualifications": string[],
  "tools": string[],
  "keywords": string[],
  "seniorityLevel": string (optional),
  "domainSignals": string[]
}

Guidelines:
- If a field is not clearly present in the JD, return an empty array or omit it
- Focus on extracting actual requirements rather than marketing language
- Split complex requirements into individual items
- Include both technical and soft skills in the skills arrays
- If the job title is unclear, use "Unknown Position"

Job description:
"""
${trimmed}
"""`,
  });
}
