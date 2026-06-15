import { describe, expect, it } from "vitest";
import { computeSkillOverlapHints } from "@/lib/scoring";
import type { JobDescriptionProfile, ResumeProfile } from "@/lib/schemas";

const baseResume: ResumeProfile = {
  contact: {},
  summary: "Engineer with React and Node experience",
  skills: ["TypeScript", "React", "Node.js"],
  experience: [
    {
      company: "Acme",
      title: "Developer",
      bullets: ["Built REST APIs in Node.js", "Shipped React dashboards"],
    },
  ],
  projects: [],
  education: [],
  certifications: [],
};

const baseJd: JobDescriptionProfile = {
  jobTitle: "Full Stack Engineer",
  requiredSkills: ["TypeScript", "React", "PostgreSQL"],
  preferredSkills: ["Docker", "AWS"],
  responsibilities: [],
  qualifications: [],
  tools: [],
  keywords: [],
  seniorityLevel: "Mid",
  domainSignals: [],
};

describe("computeSkillOverlapHints", () => {
  it("matches required skills present in resume corpus", () => {
    const hints = computeSkillOverlapHints(baseResume, baseJd);
    expect(hints.requiredMatched).toContain("TypeScript");
    expect(hints.requiredMatched).toContain("React");
    expect(hints.requiredMissing).toContain("PostgreSQL");
  });

  it("detects missing preferred skills", () => {
    const hints = computeSkillOverlapHints(baseResume, baseJd);
    expect(hints.preferredMissing).toContain("Docker");
    expect(hints.preferredMissing).toContain("AWS");
  });

  it("matches skill aliases (k8s / kubernetes)", () => {
    const resume: ResumeProfile = {
      ...baseResume,
      skills: ["Kubernetes"],
    };
    const jd: JobDescriptionProfile = {
      ...baseJd,
      requiredSkills: ["k8s"],
    };
    const hints = computeSkillOverlapHints(resume, jd);
    expect(hints.requiredMatched).toContain("k8s");
  });
});
