import OpenAI from "openai";
import { LlmError } from "@/lib/llm/errors";

const DEFAULT_BASE_URL = "https://api.groq.com/openai/v1";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

export function isLlmConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY?.trim());
}

export function createLlmClient(): OpenAI {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    throw new LlmError(
      "Groq API key is not configured. Set GROQ_API_KEY in your environment.",
      "LLM_NOT_CONFIGURED",
      503
    );
  }

  return new OpenAI({
    apiKey,
    baseURL: process.env.GROQ_BASE_URL?.trim() || DEFAULT_BASE_URL,
  });
}

export function getLlmModel(): string {
  return process.env.LLM_MODEL?.trim() || DEFAULT_MODEL;
}
