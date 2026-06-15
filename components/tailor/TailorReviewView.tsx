"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GuardrailWarningsBanner } from "@/components/GuardrailWarningsBanner";
import { ScoreCard } from "@/components/ScoreCard";
import { SideBySideDiff } from "@/components/SideBySideDiff";
import { TailorRunShell } from "@/components/tailor/TailorRunShell";
import { useTailoringRun } from "@/hooks/useTailoringRun";

type TailorReviewViewProps = {
  runId: string;
};

export function TailorReviewView({ runId }: TailorReviewViewProps) {
  const router = useRouter();
  const { run } = useTailoringRun({ runId });

  useEffect(() => {
    if (!run) return;
    if (!run.tailoredResume) {
      router.replace(`/tailor/${runId}/analysis`);
    }
  }, [run, runId, router]);

  if (!run?.tailoredResume) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center text-muted-foreground">
        Loading review…
      </div>
    );
  }

  return (
    <TailorRunShell
      currentStep="review"
      run={run}
      title="Review changes"
      description="Compare original and tailored bullets. Low-confidence and flagged items are highlighted."
    >
      <GuardrailWarningsBanner
        warnings={run.guardrailWarnings ?? []}
        hasCritical={run.hasCriticalGuardrails}
      />

      {run.tailoredMatch && (
        <div className="grid gap-4 md:grid-cols-2">
          <ScoreCard label="Original match" score={run.originalMatch!} />
          <ScoreCard label="Tailored match" score={run.tailoredMatch} />
        </div>
      )}

      <SideBySideDiff tailoredResume={run.tailoredResume} />

      <div className="flex flex-wrap gap-3">
        <Button
          render={
            <Link
              href={`/tailor/${runId}/export`}
              aria-label="Continue to export PDFs"
            />
          }
          nativeButton={false}
        >
          Continue to export
        </Button>
      </div>
    </TailorRunShell>
  );
}
