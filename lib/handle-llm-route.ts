import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-errors";
import { isLlmError } from "@/lib/llm/errors";

export function handleRouteError(err: unknown) {
  if (isLlmError(err)) {
    return apiError(err.message, err.code, err.status, err.details);
  }

  if (err instanceof Error) {
    console.error("[api]", err.message);
    return apiError(err.message, "INTERNAL_ERROR", 500);
  }

  return apiError("An unexpected error occurred", "INTERNAL_ERROR", 500);
}

export function okJson<T>(data: T) {
  return NextResponse.json(data);
}
