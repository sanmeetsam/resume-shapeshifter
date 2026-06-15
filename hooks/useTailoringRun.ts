"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  loadCurrentRunFromSession,
  loadRunFromSession,
  saveRunToSession,
} from "@/lib/run-storage";
import type {
  AnalyzeResponse,
  TailorRequest,
  TailorResponse,
} from "@/lib/api-types";
import type { TailoringRunPartial } from "@/lib/schemas";

export type WorkflowStep = "input" | "analysis" | "review" | "export";

export const ANALYZE_PIPELINE_STAGES = [
  "Parsing resume",
  "Extracting job requirements",
  "Scoring original match",
  "Analyzing gaps",
] as const;

export const TAILOR_PIPELINE_STAGES = [
  "Rewriting experience bullets",
  "Assembling summary and skills",
  "Running truthfulness guardrails",
  "Scoring tailored match",
] as const;

async function postAnalyze(
  resumeText: string,
  jdText: string
): Promise<AnalyzeResponse> {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resumeText, jdText }),
  });
  const data = (await res.json()) as AnalyzeResponse & { error?: string };
  if (!res.ok) throw new Error(data.error ?? "Analyze failed");
  return data;
}

async function postTailor(run: TailoringRunPartial): Promise<TailorResponse> {
  const payload: TailorRequest = { runId: run.id, run };
  const res = await fetch("/api/tailor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json()) as TailorResponse & {
    error?: string;
    details?: string;
  };
  if (!res.ok) {
    const detail =
      typeof data.details === "string" ? ` (${data.details.slice(0, 200)})` : "";
    throw new Error((data.error ?? "Tailor failed") + detail);
  }
  return data;
}

type UseTailoringRunOptions = {
  runId?: string;
};

export function useTailoringRun(options: UseTailoringRunOptions = {}) {
  const router = useRouter();
  const { runId: routeRunId } = options;

  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");
  const [run, setRun] = useState<TailoringRunPartial | null>(null);
  const [storageWarning, setStorageWarning] = useState(false);
  const [inputsDirty, setInputsDirty] = useState(false);
  const [localParseWarnings, setLocalParseWarnings] = useState<string[]>([]);

  useEffect(() => {
    if (routeRunId) {
      const saved = loadRunFromSession(routeRunId);
      if (saved) {
        setRun(saved);
        if (saved.rawText) setResumeText(saved.rawText);
      }
      return;
    }
    const saved = loadCurrentRunFromSession();
    if (saved) {
      setRun(saved);
      if (saved.rawText) setResumeText(saved.rawText);
    }
  }, [routeRunId]);

  const persistRun = useCallback((next: TailoringRunPartial) => {
    setRun(next);
    if (!saveRunToSession(next)) setStorageWarning(true);
  }, []);

  const analyzeMutation = useMutation({
    mutationFn: () => postAnalyze(resumeText.trim(), jdText.trim()),
    onSuccess: (data) => {
      const next: TailoringRunPartial = {
        schemaVersion: 1,
        id: data.runId,
        createdAt: new Date().toISOString(),
        rawText: resumeText.trim(),
        resumeParseWarnings: [
          ...localParseWarnings,
          ...(data.resumeParseWarnings ?? []),
        ],
        resume: data.resume,
        jobDescription: data.jobDescription,
        originalMatch: data.originalMatch,
        gapAnalysis: data.gapAnalysis,
        guardrailWarnings: [],
        status: "analyzed",
      };
      persistRun(next);
      setInputsDirty(false);
      router.push(`/tailor/${data.runId}/analysis`);
    },
  });

  const tailorMutation = useMutation({
    mutationFn: () => {
      if (!run?.id) throw new Error("No active run");
      return postTailor(run);
    },
    onSuccess: (data) => {
      if (!run) return;
      const next: TailoringRunPartial = {
        ...run,
        tailoredResume: data.tailoredResume,
        tailoredMatch: data.tailoredMatch,
        guardrailWarnings: data.warnings ?? [],
        hasCriticalGuardrails: data.hasCriticalGuardrails,
        status: "tailored",
      };
      persistRun(next);
      router.push(`/tailor/${run.id}/review`);
    },
  });

  const onResumeChange = (v: string) => {
    setResumeText(v);
    if (run) setInputsDirty(true);
  };

  const onJdChange = (v: string) => {
    setJdText(v);
    if (run) setInputsDirty(true);
  };

  const canAnalyze =
    resumeText.trim().length > 0 &&
    jdText.trim().length > 0 &&
    !analyzeMutation.isPending;

  const canTailor =
    run?.status === "analyzed" &&
    !inputsDirty &&
    !tailorMutation.isPending;

  const parseWarnings = [
    ...localParseWarnings,
    ...(run?.resumeParseWarnings ?? []),
  ];

  const dedupedParseWarnings = [...new Set(parseWarnings)];

  return {
    resumeText,
    jdText,
    setResumeText: onResumeChange,
    setJdText: onJdChange,
    setLocalParseWarnings,
    run,
    storageWarning,
    inputsDirty,
    parseWarnings: dedupedParseWarnings,
    canAnalyze,
    canTailor,
    analyzeMutation,
    tailorMutation,
    loadResumeSample: (text: string) => {
      setResumeText(text);
      setInputsDirty(!!run);
    },
    loadJdSample: (text: string) => {
      setJdText(text);
      setInputsDirty(!!run);
    },
    loadDemo: (resume: string, jd: string) => {
      setResumeText(resume);
      setJdText(jd);
      setLocalParseWarnings([]);
      setInputsDirty(!!run);
    },
    persistRun,
    router,
  };
}
