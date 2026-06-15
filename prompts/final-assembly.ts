import { runPrompt } from "@/lib/llm/run-prompt";
import { LlmAssemblyResponseSchema } from "@/lib/llm/response-schemas";
import type { JobDescriptionProfile, ResumeProfile } from "@/lib/schemas";

export async function assembleTailoredSections(
  resume: ResumeProfile,
  jobDescription: JobDescriptionProfile,
  runId?: string
) {
  return runPrompt({
    stage: "final-assembly",
    schema: LlmAssemblyResponseSchema,
    runId,
    temperature: 0.2,
    userPrompt: `Produce a tailored professional summary and reordered skills list.

Rules:
- Use only skills and experience themes present in the resume.
- Do not add technologies, degrees, certifications, employers, or metrics the resume does not support.
- Never invent MBA/PhD/certifications or cloud tools absent from the resume.
- Summary: 2-3 sentences, ATS-friendly, at least 40 characters.
- tailoredSkills: JSON array of strings (not a comma-separated string); only reorder/emphasize existing skills.

Return JSON only:
{ "tailoredSummary": "...", "tailoredSkills": ["skill1", "skill2"] }

Resume:
${JSON.stringify(resume)}

Job description:
${JSON.stringify(jobDescription)}`,
  });
}
