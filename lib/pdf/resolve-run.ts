import { TailoringRunSchema, type TailoringRun, type TailoringRunPartial } from "@/lib/schemas";

export function toExportableRun(
  runId: string,
  source?: TailoringRunPartial | TailoringRun | null
): TailoringRun {
  if (!source || source.id !== runId) {
    throw new Error("RUN_NOT_FOUND");
  }

  if (source.status !== "tailored" && source.status !== "exported") {
    throw new Error("INVALID_STATE");
  }

  const parsed = TailoringRunSchema.safeParse({
    ...source,
    status: source.status === "exported" ? "exported" : "tailored",
  });

  if (!parsed.success) {
    throw new Error("INCOMPLETE_RUN");
  }

  return parsed.data;
}
