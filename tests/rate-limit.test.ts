import { describe, expect, it, beforeEach } from "vitest";
import { checkRateLimit, resetRateLimits } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    resetRateLimits();
  });

  it("allows requests under the limit", () => {
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit("test-ip", "api/tailor").allowed).toBe(true);
    }
  });

  it("blocks after exceeding the default limit", () => {
    for (let i = 0; i < 10; i++) {
      checkRateLimit("blocked-ip", "api/export/pdf");
    }
    const result = checkRateLimit("blocked-ip", "api/export/pdf");
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.retryAfterSec).toBeGreaterThan(0);
    }
  });
});
