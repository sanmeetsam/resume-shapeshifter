import { apiError } from "@/lib/api-errors";
import { okJson } from "@/lib/handle-llm-route";
import { getRun } from "@/lib/run-store";
import { TailoringRunPartialSchema } from "@/lib/schemas";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const run = getRun(id);

  if (!run) {
    return apiError("Run not found", "RUN_NOT_FOUND", 404);
  }

  const parsed = TailoringRunPartialSchema.safeParse(run);
  if (!parsed.success) {
    return apiError("Invalid run data", "INVALID_RUN", 500);
  }

  return okJson(parsed.data);
}
