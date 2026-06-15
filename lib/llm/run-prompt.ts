import type OpenAI from "openai";
import type { ZodType } from "zod";
import { createLlmClient, getLlmModel } from "@/lib/llm/client";
import { LlmError } from "@/lib/llm/errors";
import { logLlmStage } from "@/lib/llm/logger";
import { extractJsonString } from "@/lib/text-utils";
import { TRUTHFULNESS_SYSTEM_PROMPT } from "@/prompts/system";

export type RunPromptOptions<T> = {
  stage: string;
  schema: ZodType<T>;
  userPrompt: string;
  systemPrompt?: string;
  temperature?: number;
  jsonMode?: boolean;
  runId?: string;
};

function mapOpenAiError(err: unknown): LlmError {
  if (err instanceof LlmError) return err;

  const status = (err as { status?: number })?.status;
  const message =
    (err as { message?: string })?.message ?? "LLM request failed";

  if (status === 401) {
    return new LlmError(
      "Invalid Groq API key.",
      "LLM_AUTH_FAILED",
      503
    );
  }
  if (status === 429) {
    return new LlmError(
      "Groq rate limit reached. Please wait a moment and try again.",
      "LLM_RATE_LIMIT",
      503
    );
  }
  if (status === 408 || message.toLowerCase().includes("timeout")) {
    return new LlmError(
      "The AI request timed out. Please try again.",
      "LLM_TIMEOUT",
      504
    );
  }

  return new LlmError(message, "LLM_ERROR", 502);
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

type CompletionResult = {
  content: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
};

async function callCompletion(
  client: OpenAI,
  model: string,
  system: string,
  user: string,
  temperature: number,
  jsonMode: boolean
): Promise<CompletionResult> {
  const response = await client.chat.completions.create({
    model,
    temperature,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    ...(jsonMode ? { response_format: { type: "json_object" as const } } : {}),
  });

  const content = response.choices[0]?.message?.content;
  if (!content?.trim()) {
    throw new LlmError("Empty response from LLM", "LLM_ERROR", 502);
  }

  return {
    content,
    promptTokens: response.usage?.prompt_tokens,
    completionTokens: response.usage?.completion_tokens,
    totalTokens: response.usage?.total_tokens,
  };
}

export async function runPrompt<T>({
  stage,
  schema,
  userPrompt,
  systemPrompt = TRUTHFULNESS_SYSTEM_PROMPT,
  temperature = 0.2,
  jsonMode = true,
  runId,
}: RunPromptOptions<T>): Promise<T> {
  const started = Date.now();
  let client: OpenAI;
  try {
    client = createLlmClient();
  } catch (err) {
    throw mapOpenAiError(err);
  }

  const model = getLlmModel();
  let lastValidationError: string | undefined;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) await sleep(800);

      const retryNote = lastValidationError
        ? `\n\nYour previous JSON failed validation:\n${lastValidationError}\nReturn corrected JSON only.`
        : "";

      const completion = await callCompletion(
        client,
        model,
        systemPrompt,
        userPrompt + retryNote,
        temperature,
        jsonMode
      );

      const jsonText = extractJsonString(completion.content);
      let parsed: unknown;
      try {
        parsed = JSON.parse(jsonText);
      } catch {
        lastValidationError = "Response was not valid JSON.";
        continue;
      }

      const result = schema.safeParse(parsed);
      if (!result.success) {
        lastValidationError = result.error.message;
        if (process.env.NODE_ENV !== "production") {
          console.error(`[llm:${stage}] validation failed (attempt ${attempt + 1})`, {
            runId,
            error: result.error.flatten(),
            preview: jsonText.slice(0, 500),
          });
        }
        continue;
      }

      logLlmStage(stage, {
        runId,
        model,
        attempt: attempt + 1,
        durationMs: Date.now() - started,
        promptTokens: completion.promptTokens,
        completionTokens: completion.completionTokens,
        totalTokens: completion.totalTokens,
      });

      return result.data;
    } catch (err) {
      const mapped = mapOpenAiError(err);
      if (mapped.code === "LLM_RATE_LIMIT" && attempt === 0) {
        await sleep(1500);
        continue;
      }
      throw mapped;
    }
  }

  throw new LlmError(
    `Could not produce valid structured output (${stage}). Please try again.`,
    "LLM_VALIDATION_FAILED",
    502,
    lastValidationError
  );
}
