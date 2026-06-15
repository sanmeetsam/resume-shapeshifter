import { apiError } from "@/lib/api-errors";
import { checkRateLimit, getClientKey } from "@/lib/rate-limit";

export function enforceRateLimit(
  request: Request,
  route: string
): Response | null {
  const key = getClientKey(request);
  const result = checkRateLimit(key, route);
  if (result.allowed) return null;

  return apiError(
    `Rate limit exceeded. Try again in ${result.retryAfterSec} seconds.`,
    "RATE_LIMITED",
    429
  );
}
