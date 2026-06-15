import { afterEach, describe, expect, it } from "vitest";
import { isServerlessHost } from "@/lib/is-serverless";

describe("isServerlessHost", () => {
  const originalVercel = process.env.VERCEL;
  const originalLambda = process.env.AWS_LAMBDA_FUNCTION_NAME;

  afterEach(() => {
    if (originalVercel === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = originalVercel;
    if (originalLambda === undefined) delete process.env.AWS_LAMBDA_FUNCTION_NAME;
    else process.env.AWS_LAMBDA_FUNCTION_NAME = originalLambda;
  });

  it("returns false locally by default", () => {
    delete process.env.VERCEL;
    delete process.env.AWS_LAMBDA_FUNCTION_NAME;
    expect(isServerlessHost()).toBe(false);
  });

  it("returns true when VERCEL=1", () => {
    process.env.VERCEL = "1";
    delete process.env.AWS_LAMBDA_FUNCTION_NAME;
    expect(isServerlessHost()).toBe(true);
  });

  it("returns true on AWS Lambda", () => {
    delete process.env.VERCEL;
    process.env.AWS_LAMBDA_FUNCTION_NAME = "fn";
    expect(isServerlessHost()).toBe(true);
  });
});
