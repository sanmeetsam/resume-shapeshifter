"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnalysisSkeleton } from "@/components/AnalysisSkeleton";
import { GapAnalysisList } from "@/components/GapAnalysisList";
import { JDRequirementsSummary } from "@/components/JDRequirementsSummary";
import { PipelineProgress } from "@/components/PipelineProgress";
import { ScoreCard } from "@/components/ScoreCard";
import { TailorRunShell } from "@/components/tailor/TailorRunShell";
import {
  TAILOR_PIPELINE_STAGES,
  useTailoringRun,
} from "@/hooks/useTailoringRun";

type TailorAnalysisViewProps = {
  runId: string;
};

export function TailorAnalysisView({ runId }: TailorAnalysisViewProps) {
  const router = useRouter();
  const {
    run,
    canTailor,
    tailorMutation,
    inputsDirty,
  } = useTailoringRun({ runId });

  useEffect(() => {
    if (!run) return;
    if (run.id !== runId) return;
    if (!run.originalMatch) {
      router.replace("/tailor");
    }
  }, [run, runId, router]);

  if (!run?.originalMatch) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center text-muted-foreground">
        Loading analysis…
      </div>
    );
  }

  const error = tailorMutation.error?.message ?? null;

  return (
    <TailorRunShell
      currentStep="analysis"
      run={run}
      title="Analysis"
      description={`Match and gaps for ${run.jobDescription.jobTitle}${run.jobDescription.company ? ` at ${run.jobDescription.company}` : ""}.`}
    >
      {inputsDirty && (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-200">
          Inputs changed on the Input step. Go back and run Analyze again.
        </p>
      )}

      <PipelineProgress
        stages={[...TAILOR_PIPELINE_STAGES]}
        active={tailorMutation.isPending}
        label="Tailoring with Groq…"
      />

      <JDRequirementsSummary jobDescription={run.jobDescription} />

      <div className="grid gap-4 md:grid-cols-2">
        <ScoreCard label="Original match" score={run.originalMatch} />
        <ScoreCard
          label="Tailored match"
          score={run.tailoredMatch}
          placeholder="Generate tailored resume to see improved score"
        />
      </div>

      {run.gapAnalysis && <GapAnalysisList gapAnalysis={run.gapAnalysis} />}

      {tailorMutation.isPending && <AnalysisSkeleton />}

      {!tailorMutation.isPending && (
        <Button
          type="button"
          disabled={!canTailor}
          onClick={() => tailorMutation.mutate()}
          aria-label="Generate tailored resume from analysis"
        >
          {tailorMutation.isPending && (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          )}
          Generate tailored resume
        </Button>
      )}

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <p>{error}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => tailorMutation.mutate()}
          >
            Retry
          </Button>
        </div>
      )}
    </TailorRunShell>
  );
}
