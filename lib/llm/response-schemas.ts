import { z } from "zod";
import {
  MatchScoreSchema,
  TailoredBulletSchema,
  type MatchScore,
  type TailoredBullet,
} from "@/lib/schemas";
import {
  normalizeConfidence,
  normalizeRiskFlag,
  normalizeScore,
  normalizeStringArray,
  toNonEmptyString,
  unwrapBulletsArray,
} from "@/lib/llm/normalize-llm-output";

function pickTailoredText(obj: Record<string, unknown>): string {
  for (const key of ["tailored", "rewritten", "revised", "text", "bullet"]) {
    const v = obj[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

function normalizeTailoredBullet(raw: unknown): TailoredBullet {
  const obj =
    typeof raw === "object" && raw !== null
      ? (raw as Record<string, unknown>)
      : {};

  const original = toNonEmptyString(obj.original ?? obj.source ?? obj.before);
  const tailored = pickTailoredText(obj) || original;

  return {
    original,
    tailored,
    changeReason:
      toNonEmptyString(obj.changeReason ?? obj.reason ?? obj.explanation) ||
      "Aligned wording with the job description.",
    keywordsAddressed: normalizeStringArray(
      obj.keywordsAddressed ?? obj.keywords ?? obj.tags
    ),
    confidence: normalizeConfidence(obj.confidence),
    riskFlag: normalizeRiskFlag(obj.riskFlag ?? obj.risk),
  };
}

/** Lenient parser for bullet-rewriter LLM output → domain TailoredBullet[]. */
export const LlmTailoredBulletsResponseSchema = z.unknown().transform((raw) => {
  const bullets = unwrapBulletsArray(raw).map(normalizeTailoredBullet);
  return { bullets: z.array(TailoredBulletSchema).parse(bullets) };
});

const AssemblyOutputSchema = z.object({
  tailoredSummary: z.string().min(40),
  tailoredSkills: z.array(z.string().min(1)),
});

/** Lenient parser for final-assembly LLM output. */
export const LlmAssemblyResponseSchema = z.unknown().transform((raw) => {
  const obj =
    typeof raw === "object" && raw !== null
      ? (raw as Record<string, unknown>)
      : {};
  const tailoredSummary = toNonEmptyString(
    obj.tailoredSummary ?? obj.summary ?? obj.professionalSummary
  );
  return AssemblyOutputSchema.parse({
    tailoredSummary:
      tailoredSummary ||
      "Professional with experience aligned to the target role. Verify all claims before use.",
    tailoredSkills: normalizeStringArray(
      obj.tailoredSkills ?? obj.skills ?? obj.skillList
    ),
  });
});

/** Lenient parser for match-scoring LLM output. */
export const LlmMatchScoreResponseSchema = z.unknown().transform((raw) => {
  const obj =
    typeof raw === "object" && raw !== null
      ? (raw as Record<string, unknown>)
      : {};

  return MatchScoreSchema.parse({
    overallScore: normalizeScore(obj.overallScore ?? obj.overall),
    skillCoverageScore: normalizeScore(
      obj.skillCoverageScore ?? obj.skillCoverage
    ),
    responsibilityAlignmentScore: normalizeScore(
      obj.responsibilityAlignmentScore ?? obj.responsibilityAlignment
    ),
    keywordScore: normalizeScore(obj.keywordScore ?? obj.keywords),
    seniorityScore: normalizeScore(obj.seniorityScore ?? obj.seniority),
    criticalMissingRequirements: normalizeStringArray(
      obj.criticalMissingRequirements ?? obj.missingRequirements
    ),
    explanation: toNonEmptyString(
      obj.explanation,
      "Score based on resume–JD alignment."
    ),
  } satisfies MatchScore);
});
