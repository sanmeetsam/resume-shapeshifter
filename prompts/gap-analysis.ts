import { runPrompt } from "@/lib/llm/run-prompt";
import {
  GapAnalysisSchema,
  type JobDescriptionProfile,
  type ResumeProfile,
} from "@/lib/schemas";

export async function analyzeGapsWithLlm(
  resume: ResumeProfile,
  jobDescription: JobDescriptionProfile,
  runId?: string
) {
  return runPrompt({
    stage: "gap-analysis",
    schema: GapAnalysisSchema,
    runId,
    temperature: 0.2,
    userPrompt: `Identify gaps between the resume and job description.

For each gap return:
- name: skill/requirement name
- importance: "high" | "medium" | "low"
- jdEvidence: quote or paraphrase from JD
- resumeEvidence: where resume mentions it weakly, or "Not mentioned"
- suggestedAction: actionable advice (e.g. interview prep, add if true, do not invent)
- canSafelyAdd: false if the candidate should NOT add this unless they truly have it

Do not invent resume content. Focus on the most important gaps (max 12).

Return JSON: { "gaps": [...] }

Resume:
${JSON.stringify(resume)}

Job description:
${JSON.stringify(jobDescription)}`,
  });
}
