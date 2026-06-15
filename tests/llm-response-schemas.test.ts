import { describe, expect, it } from "vitest";
import {
  LlmAssemblyResponseSchema,
  LlmMatchScoreResponseSchema,
  LlmTailoredBulletsResponseSchema,
} from "@/lib/llm/response-schemas";

describe("LlmTailoredBulletsResponseSchema", () => {
  it("normalizes confidence casing and boolean riskFlag", () => {
    const result = LlmTailoredBulletsResponseSchema.safeParse({
      bullets: [
        {
          original: "Built internal APIs for reporting.",
          tailored: "Built REST APIs for reporting dashboards.",
          changeReason: "Added JD keyword",
          keywordsAddressed: "REST, APIs",
          confidence: "High",
          riskFlag: true,
        },
      ],
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.bullets[0].confidence).toBe("high");
    expect(result.data.bullets[0].riskFlag).toContain("overstatement");
    expect(result.data.bullets[0].keywordsAddressed).toEqual(["REST", "APIs"]);
  });

  it("accepts a top-level bullets array", () => {
    const result = LlmTailoredBulletsResponseSchema.safeParse([
      {
        original: "Maintained legacy modules.",
        tailored: "Maintained legacy JavaScript modules.",
        changeReason: "x",
        confidence: "low",
      },
    ]);
    expect(result.success).toBe(true);
    expect(result.data?.bullets).toHaveLength(1);
  });
});

describe("LlmAssemblyResponseSchema", () => {
  it("coerces skills from comma-separated string", () => {
    const result = LlmAssemblyResponseSchema.safeParse({
      tailoredSummary:
        "Full stack software engineer with experience building web applications using TypeScript and React.",
      tailoredSkills: "TypeScript, React, Node.js",
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.tailoredSkills).toEqual([
      "TypeScript",
      "React",
      "Node.js",
    ]);
  });
});

describe("LlmMatchScoreResponseSchema", () => {
  it("coerces string scores to numbers", () => {
    const result = LlmMatchScoreResponseSchema.safeParse({
      overallScore: "72",
      skillCoverageScore: 80,
      responsibilityAlignmentScore: "65",
      keywordScore: 70,
      seniorityScore: 60,
      criticalMissingRequirements: "AWS",
      explanation: "Good overlap.",
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.overallScore).toBe(72);
    expect(result.data.criticalMissingRequirements).toEqual(["AWS"]);
  });
});
