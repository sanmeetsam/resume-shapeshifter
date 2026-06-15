"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PipelineProgress } from "@/components/PipelineProgress";
import { ResumeInput } from "@/components/ResumeInput";
import { JDInput } from "@/components/JDInput";
import { TailorRunShell } from "@/components/tailor/TailorRunShell";
import {
  ANALYZE_PIPELINE_STAGES,
  useTailoringRun,
} from "@/hooks/useTailoringRun";
import {
  DEMO_JD,
  DEMO_RESUME,
  SAMPLE_JD,
  SAMPLE_RESUME,
} from "@/lib/sample-content";

export function TailorInputView() {
  const {
    resumeText,
    jdText,
    setResumeText,
    setJdText,
    setLocalParseWarnings,
    run,
    storageWarning,
    inputsDirty,
    parseWarnings,
    canAnalyze,
    analyzeMutation,
    loadResumeSample,
    loadJdSample,
    loadDemo,
  } = useTailoringRun();

  const error = analyzeMutation.error?.message ?? null;

  return (
    <TailorRunShell
      currentStep="input"
      run={run}
      title="Tailor your resume"
      description="Paste or upload your resume and paste the job description. Groq extracts requirements, scores alignment, and rewrites bullets truthfully."
    >
      {storageWarning && (
        <p className="flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-200">
          <AlertCircle className="size-4 shrink-0" />
          Could not save to session storage. Progress may be lost on refresh.
        </p>
      )}

      {inputsDirty && run && (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-200">
          Inputs changed since last analysis. Run Analyze again before tailoring.
        </p>
      )}

      <PipelineProgress
        stages={[...ANALYZE_PIPELINE_STAGES]}
        active={analyzeMutation.isPending}
        label="Analyzing with Groq…"
      />

      <section aria-labelledby="input-heading" className="space-y-4">
        <h2 id="input-heading" className="text-lg font-medium">
          Resume & job description
        </h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <ResumeInput
            value={resumeText}
            onChange={setResumeText}
            disabled={analyzeMutation.isPending}
            parseWarnings={parseWarnings}
            onParseWarnings={setLocalParseWarnings}
          />
          <JDInput
            value={jdText}
            onChange={setJdText}
            disabled={analyzeMutation.isPending}
          />
        </div>

        {!resumeText.trim() && !jdText.trim() && (
          <p className="text-sm text-muted-foreground">
            Start by pasting your resume and JD, uploading a PDF/DOCX resume, or
            loading demo content below.
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            disabled={!canAnalyze}
            onClick={() => analyzeMutation.mutate()}
            aria-label="Analyze resume against job description"
          >
            {analyzeMutation.isPending && (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            )}
            Analyze
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={analyzeMutation.isPending}
            onClick={() => loadResumeSample(SAMPLE_RESUME)}
            aria-label="Load sample resume text"
          >
            Load sample resume
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={analyzeMutation.isPending}
            onClick={() => loadJdSample(SAMPLE_JD)}
            aria-label="Load sample job description"
          >
            Load sample JD
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={analyzeMutation.isPending}
            onClick={() => loadDemo(DEMO_RESUME, DEMO_JD)}
            aria-label="Load portfolio demo resume and job description"
          >
            Load demo (portfolio)
          </Button>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </div>
      )}
    </TailorRunShell>
  );
}
