/** Coerce common LLM JSON quirks before Zod domain validation. */

export function toNonEmptyString(val: unknown, fallback = ""): string {
  if (typeof val === "string") return val.trim() || fallback;
  if (val == null) return fallback;
  return String(val).trim() || fallback;
}

export function normalizeConfidence(val: unknown): "high" | "medium" | "low" {
  const s = toNonEmptyString(val).toLowerCase();
  if (s === "high" || s === "medium" || s === "low") return s;
  if (s.includes("high")) return "high";
  if (s.includes("low")) return "low";
  return "medium";
}

export function normalizeStringArray(val: unknown): string[] {
  if (Array.isArray(val)) {
    return val.map((v) => toNonEmptyString(v)).filter(Boolean);
  }
  if (typeof val === "string" && val.trim()) {
    return val
      .split(/[,;|\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

export function normalizeRiskFlag(val: unknown): string | undefined {
  if (val === false || val === null || val === undefined || val === "") {
    return undefined;
  }
  if (val === true) return "Review for possible overstatement";
  return toNonEmptyString(val);
}

export function normalizeScore(val: unknown): number {
  const n = typeof val === "number" ? val : Number(val);
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, Math.round(n)));
}

export function unwrapBulletsArray(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw !== "object" || raw === null) return [];

  const obj = raw as Record<string, unknown>;
  for (const key of ["bullets", "tailoredBullets", "rewrittenBullets", "data", "items"]) {
    if (Array.isArray(obj[key])) return obj[key] as unknown[];
  }
  return [];
}
