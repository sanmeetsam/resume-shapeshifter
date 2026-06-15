import type {
  ResumeProfile,
  TailoredResume,
} from "@/lib/schemas";

/** Build a resume-shaped profile using tailored bullet text for re-scoring. */
export function applyTailoredToResume(
  resume: ResumeProfile,
  tailored: TailoredResume
): ResumeProfile {
  const experience = resume.experience.map((exp) => {
    const tailoredRole = tailored.tailoredExperience.find(
      (t) =>
        t.company.toLowerCase() === exp.company.toLowerCase() &&
        t.title.toLowerCase() === exp.title.toLowerCase()
    ) ?? tailored.tailoredExperience.find(
      (t) => t.company.toLowerCase() === exp.company.toLowerCase()
    );

    if (!tailoredRole) return exp;

    return {
      ...exp,
      bullets: tailoredRole.bullets.map((b) => b.tailored),
    };
  });

  return {
    ...resume,
    summary: tailored.tailoredSummary || resume.summary,
    skills:
      tailored.tailoredSkills.length > 0
        ? tailored.tailoredSkills
        : resume.skills,
    experience,
  };
}
