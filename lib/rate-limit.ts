type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60_000;
const DEFAULT_LIMIT = 10;

function getLimit(): number {
  const raw = process.env.API_RATE_LIMIT_PER_MIN;
  const n = raw ? Number.parseInt(raw, 10) : DEFAULT_LIMIT;
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_LIMIT;
}

export function getClientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return request.headers.get("x-real-ip") ?? "local";
}

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSec: number };

export function checkRateLimit(
  key: string,
  route: string
): RateLimitResult {
  const limit = getLimit();
  const bucketKey = `${route}:${key}`;
  const now = Date.now();
  const existing = buckets.get(bucketKey);

  if (!existing || now >= existing.resetAt) {
    buckets.set(bucketKey, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count += 1;
  return { allowed: true };
}

/** Test helper */
export function resetRateLimits(): void {
  buckets.clear();
}
