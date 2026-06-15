import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { checkTailoredResume } from "@/lib/guardrails";
import type { ResumeProfile, TailoredResume } from "@/lib/schemas";
import { TailoredResumeSchema } from "@/lib/schemas";

const fixturesDir = join(__dirname, "fixtures");

function loadFixture<T>(filename: string): T {
  const raw = readFileSync(join(fixturesDir, filename), "utf-8");
  return JSON.parse(raw) as T;
}

describe("checkTailoredResume", () => {
  const resume = loadFixture<ResumeProfile>("sample-resume.json");

  it("flags fabricated employer not in source resume", () => {
    const bad = TailoredResumeSchema.parse(
      loadFixture("bad-tailored-resume.json")
    );
    const result = checkTailoredResume(resume, bad);

    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.hasCritical).toBe(true);
    expect(
      result.issues.some((i) => i.code === "NEW_EMPLOYER")
    ).toBe(true);
    expect(result.warnings.some((w) => w.includes("Acme Corp"))).toBe(true);
  });

  it("flags new numeric metrics not in original bullet or resume", () => {
    const tailored: TailoredResume = {
      tailoredSummary: resume.summary,
      tailoredSkills: resume.skills,
      tailoredExperience: [
        {
          company: "Northwind Labs",
          title: "Software Engineer",
          bullets: [
            {
              original:
                "Built customer-facing dashboards in React and TypeScript used by 12 internal teams.",
              tailored:
                "Delivered dashboards in React and TypeScript, driving 40% revenue growth across the org.",
              changeReason: "Test",
              keywordsAddressed: [],
              confidence: "high",
            },
          ],
        },
      ],
    };

    const result = checkTailoredResume(resume, tailored);
    expect(result.issues.some((i) => i.code === "NEW_METRIC")).toBe(true);
    expect(
      result.tailoredResume.tailoredExperience[0].bullets[0].riskFlag
    ).toContain("New metric");
    expect(
      result.tailoredResume.tailoredExperience[0].bullets[0].confidence
    ).toBe("low");
  });

  it("flags unverified technology in tailored bullet", () => {
    const tailored: TailoredResume = {
      tailoredSummary: resume.summary,
      tailoredSkills: resume.skills,
      tailoredExperience: [
        {
          company: "Northwind Labs",
          title: "Software Engineer",
          bullets: [
            {
              original:
                "Designed REST APIs in Node.js backed by PostgreSQL, reducing report generation time by 30%.",
              tailored:
                "Architected GraphQL and Kubernetes services in Node.js with PostgreSQL, reducing latency 30%.",
              changeReason: "Test",
              keywordsAddressed: ["GraphQL"],
              confidence: "high",
            },
          ],
        },
      ],
    };

    const result = checkTailoredResume(resume, tailored);
    expect(result.issues.some((i) => i.code === "UNVERIFIED_TECH")).toBe(true);
    expect(
      result.tailoredResume.tailoredExperience[0].bullets[0].riskFlag
    ).toMatch(/Unverified technology/i);
  });

  it("dedupes warning messages", () => {
    const bad = TailoredResumeSchema.parse(
      loadFixture("bad-tailored-resume.json")
    );
    const first = checkTailoredResume(resume, bad);
    const second = checkTailoredResume(resume, bad);
    expect(first.warnings.length).toBe(second.warnings.length);
    expect(new Set(first.warnings).size).toBe(first.warnings.length);
  });

  it("clean tailored resume from mock fixture has no critical issues", () => {
    const run = loadFixture<{ tailoredResume: TailoredResume }>(
      "mock-tailoring-run.json"
    );
    const result = checkTailoredResume(resume, run.tailoredResume);
    expect(result.hasCritical).toBe(false);
  });
});
