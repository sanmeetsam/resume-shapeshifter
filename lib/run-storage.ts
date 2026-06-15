import { SCHEMA_VERSION, TailoringRunPartialSchema, type TailoringRunPartial } from "@/lib/schemas";

const CURRENT_RUN_KEY = "resume-shapeshifter:current-run-id";
const runKey = (id: string) => `resume-shapeshifter:run:${id}`;

export function saveRunToSession(run: TailoringRunPartial): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.sessionStorage.setItem(runKey(run.id), JSON.stringify(run));
    window.sessionStorage.setItem(CURRENT_RUN_KEY, run.id);
    return true;
  } catch {
    return false;
  }
}

export function loadRunFromSession(runId: string): TailoringRunPartial | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(runKey(runId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    const result = TailoringRunPartialSchema.safeParse(parsed);
    if (!result.success) return null;
    if (result.data.schemaVersion !== SCHEMA_VERSION) {
      window.sessionStorage.removeItem(runKey(runId));
      return null;
    }
    return result.data;
  } catch {
    return null;
  }
}

export function getCurrentRunIdFromSession(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(CURRENT_RUN_KEY);
}

export function loadCurrentRunFromSession(): TailoringRunPartial | null {
  const id = getCurrentRunIdFromSession();
  if (!id) return null;
  return loadRunFromSession(id);
}

export function clearSessionRun(): void {
  if (typeof window === "undefined") return;
  const id = getCurrentRunIdFromSession();
  if (id) window.sessionStorage.removeItem(runKey(id));
  window.sessionStorage.removeItem(CURRENT_RUN_KEY);
}
