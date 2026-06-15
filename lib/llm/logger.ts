type LogFields = Record<string, string | number | boolean | undefined>;

export function logLlmStage(stage: string, fields: LogFields = {}): void {
  const payload = {
    event: "llm_stage_complete",
    stage,
    ts: new Date().toISOString(),
    ...fields,
  };
  console.info(JSON.stringify(payload));
}

export function logApiEvent(
  event: string,
  fields: LogFields = {}
): void {
  console.info(
    JSON.stringify({
      event,
      ts: new Date().toISOString(),
      ...fields,
    })
  );
}
