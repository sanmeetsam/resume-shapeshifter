import type { JobDescriptionProfile, ResumeProfile } from "@/lib/schemas";

const SKILL_ALIASES: Record<string, string[]> = {
  javascript: ["js"],
  typescript: ["ts"],
  kubernetes: ["k8s"],
  k8s: ["kubernetes"],
  postgres: ["postgresql"],
  postgresql: ["postgres"],
  node: ["node.js", "nodejs"],
  nodejs: ["node.js", "node"],
};

export type SkillOverlapHints = {
  requiredMatched: string[];
  requiredMissing: string[];
  preferredMatched: string[];
  preferredMissing: string[];
};

function normalizeToken(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9+#.]/g, "").trim();
}

function buildResumeCorpus(resume: ResumeProfile): string {
  const parts: string[] = [
    resume.summary,
    ...resume.skills,
    ...resume.experience.flatMap((e) => [
      e.company,
      e.title,
      ...e.bullets,
    ]),
    ...resume.projects.flatMap((p) => [
      p.name,
      p.description ?? "",
      ...(p.bullets ?? []),
      ...(p.technologies ?? []),
    ]),
  ];
  return parts.join(" ").toLowerCase();
}

function matchesSkill(corpus: string, skill: string): boolean {
  const norm = normalizeToken(skill);
  if (!norm) return false;
  if (corpus.includes(norm)) return true;

  const aliases = SKILL_ALIASES[norm] ?? [];
  return aliases.some((a) => corpus.includes(normalizeToken(a)));
}

function partitionSkills(
  skills: string[],
  corpus: string
): { matched: string[]; missing: string[] } {
  const matched: string[] = [];
  const missing: string[] = [];

  for (const skill of skills) {
    if (matchesSkill(corpus, skill)) matched.push(skill);
    else missing.push(skill);
  }

  return { matched, missing };
}

export function computeSkillOverlapHints(
  resume: ResumeProfile,
  jobDescription: JobDescriptionProfile
): SkillOverlapHints {
  const corpus = buildResumeCorpus(resume);
  const required = partitionSkills(jobDescription.requiredSkills, corpus);
  const preferred = partitionSkills(jobDescription.preferredSkills, corpus);

  return {
    requiredMatched: required.matched,
    requiredMissing: required.missing,
    preferredMatched: preferred.matched,
    preferredMissing: preferred.missing,
  };
}
