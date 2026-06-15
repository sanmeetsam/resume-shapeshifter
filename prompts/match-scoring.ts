import { runPrompt } from "@/lib/llm/run-prompt";
import { LlmMatchScoreResponseSchema } from "@/lib/llm/response-schemas";
import type { JobDescriptionProfile, ResumeProfile } from "@/lib/schemas";
import type { SkillOverlapHints } from "@/lib/scoring";

export async function scoreMatchWithLlm(
  resume: ResumeProfile,
  jobDescription: JobDescriptionProfile,
  hints: SkillOverlapHints,
  runId?: string
) {
  return runPrompt({
    stage: "match-scoring",
    schema: LlmMatchScoreResponseSchema,
    runId,
    userPrompt: `Score how well this resume matches the job description (0-100 each field).

Return JSON:
{
  "overallScore": number,
  "skillCoverageScore": number,
  "responsibilityAlignmentScore": number,
  "keywordScore": number,
  "seniorityScore": number,
  "criticalMissingRequirements": string[],
  "explanation": string (2-4 sentences, honest and specific)
}

Do not inflate scores or imply credentials the resume does not support.

Deterministic skill overlap hints (use as input, you may adjust slightly):
- Required matched: ${hints.requiredMatched.join(", ") || "none"}
- Required missing: ${hints.requiredMissing.join(", ") || "none"}
- Preferred matched: ${hints.preferredMatched.join(", ") || "none"}

Resume JSON:
${JSON.stringify(resume)}

Job description JSON:
${JSON.stringify(jobDescription)}`,
  });
}
