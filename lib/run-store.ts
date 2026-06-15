import type { TailoringRun, TailoringRunPartial } from "@/lib/schemas";

const runs = new Map<string, TailoringRunPartial | TailoringRun>();

export function getRun(id: string): TailoringRunPartial | TailoringRun | undefined {
  return runs.get(id);
}

export function saveRun(run: TailoringRunPartial | TailoringRun): void {
  runs.set(run.id, run);
}

export function clearRuns(): void {
  runs.clear();
}
