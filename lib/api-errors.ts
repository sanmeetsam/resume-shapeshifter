import { NextResponse } from "next/server";

export function apiError(
  message: string,
  code: string,
  status: number,
  details?: unknown
) {
  return NextResponse.json(
    { error: message, code, ...(details !== undefined ? { details } : {}) },
    { status }
  );
}
