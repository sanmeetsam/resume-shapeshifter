import { runPrompt } from "@/lib/llm/run-prompt";
import { LlmTailoredBulletsResponseSchema } from "@/lib/llm/response-schemas";
import type {
  ExperienceEntry,
  JobDescriptionProfile,
  ResumeGap,
} from "@/lib/schemas";

export async function rewriteBulletsWithLlm(
  role: ExperienceEntry,
  jobDescription: JobDescriptionProfile,
  gaps: ResumeGap[],
  runId?: string
) {
  const gapSummary = gaps
    .slice(0, 8)
    .map((g) => `- ${g.name} (${g.importance}): ${g.suggestedAction}`)
    .join("\n");

  return runPrompt({
    stage: "bullet-rewriter",
    schema: LlmTailoredBulletsResponseSchema,
    runId,
    temperature: 0.25,
    userPrompt: `Rewrite these resume bullets to better align with the job description.

Rules:
- Return exactly ${role.bullets.length} bullets in the same order as the input.
- Set "original" to the exact original bullet text (copy verbatim).
- Do not invent metrics, employers, tools, or scope not supported by the original.
- confidence MUST be exactly one of: "high", "medium", "low" (lowercase).
- riskFlag: optional string only (omit or use a short phrase; never boolean).

Forbidden transformations (never do these):
- "Collaborated on APIs" → "Led organization-wide platform architecture at Google" (new employer + inflated scope)
- "Improved performance" → "Increased revenue 40%" (new metric not in original)
- "Built React apps" → "Expert in Kubernetes, GraphQL, and AWS" (tools not in resume)
- "Software Engineer" → "Staff Engineer" at the same company unless that title exists in the source resume
- Adding "MBA", "AWS Solutions Architect certified", or degrees/certs not in the resume

Allowed:
- Rephrase with JD keywords already supported by the original bullet
- "JavaScript" ↔ "JS" when the resume uses the same technology
- Active voice and clearer alignment without new facts

Return JSON only, this shape:
{
  "bullets": [
    {
      "original": "...",
      "tailored": "...",
      "changeReason": "...",
      "keywordsAddressed": ["..."],
      "confidence": "high",
      "riskFlag": "optional short note"
    }
  ]
}

Role: ${role.title} at ${role.company}

Original bullets:
${role.bullets.map((b, i) => `${i + 1}. ${b}`).join("\n")}

Job description:
${JSON.stringify(jobDescription)}

Gap context:
${gapSummary || "None"}`,
  });
}
