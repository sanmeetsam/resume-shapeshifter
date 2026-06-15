import { checkTailoredResume } from "@/lib/guardrails";
import { assembleTailoredSections } from "@/prompts/final-assembly";
import { rewriteBulletsWithLlm } from "@/prompts/bullet-rewriter";
import type {
  GapAnalysis,
  JobDescriptionProfile,
  ResumeProfile,
  TailoredBullet,
  TailoredResume,
} from "@/lib/schemas";

export type TailorResumeResult = {
  tailoredResume: TailoredResume;
  warnings: string[];
  hasCriticalGuardrails: boolean;
};

const BATCH_SIZE = 6;

function reconcileBullets(
  originals: string[],
  fromLlm: TailoredBullet[]
): TailoredBullet[] {
  return originals.map((original, i) => {
    const b = fromLlm[i];
    if (b) {
      return {
        ...b,
        original: b.original.trim() || original,
        tailored: b.tailored.trim() || original,
      };
    }
    return {
      original,
      tailored: original,
      changeReason: "Kept original (LLM returned fewer bullets than expected).",
      keywordsAddressed: [],
      confidence: "high" as const,
    };
  });
}

export async function tailorResume(
  resume: ResumeProfile,
  jobDescription: JobDescriptionProfile,
  gapAnalysis: GapAnalysis,
  runId?: string
): Promise<TailorResumeResult> {
  const gaps = gapAnalysis.gaps;
  const tailoredExperience: TailoredResume["tailoredExperience"] = [];

  for (const role of resume.experience) {
    if (role.bullets.length === 0) {
      tailoredExperience.push({
        company: role.company,
        title: role.title,
        bullets: [],
      });
      continue;
    }

    const allBullets = [...role.bullets];
    const mergedBullets = [];

    for (let i = 0; i < allBullets.length; i += BATCH_SIZE) {
      const batch = allBullets.slice(i, i + BATCH_SIZE);
      const batchRole = { ...role, bullets: batch };
      const { bullets } = await rewriteBulletsWithLlm(
        batchRole,
        jobDescription,
        gaps,
        runId
      );

      if (bullets.length !== batch.length) {
        console.warn(
          `[tailoring-engine] bullet count mismatch for ${role.company}: expected ${batch.length}, got ${bullets.length}`
        );
      }

      mergedBullets.push(...reconcileBullets(batch, bullets));
    }

    tailoredExperience.push({
      company: role.company,
      title: role.title,
      bullets: mergedBullets,
    });
  }

  const assembly = await assembleTailoredSections(
    resume,
    jobDescription,
    runId
  );

  const raw: TailoredResume = {
    tailoredSummary: assembly.tailoredSummary,
    tailoredSkills: assembly.tailoredSkills,
    tailoredExperience,
  };

  const jdKeywords = [
    ...jobDescription.keywords,
    ...jobDescription.requiredSkills,
    ...jobDescription.tools,
  ];
  const guardrails = checkTailoredResume(resume, raw, jdKeywords);

  return {
    tailoredResume: guardrails.tailoredResume,
    warnings: guardrails.warnings,
    hasCriticalGuardrails: guardrails.hasCritical,
  };
}
