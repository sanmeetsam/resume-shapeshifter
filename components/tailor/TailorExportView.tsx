"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PDFExportButton } from "@/components/PDFExportButton";
import { GuardrailWarningsBanner } from "@/components/GuardrailWarningsBanner";
import { ScoreCard } from "@/components/ScoreCard";
import { TailorRunShell } from "@/components/tailor/TailorRunShell";
import { useTailoringRun } from "@/hooks/useTailoringRun";

type TailorExportViewProps = {
  runId: string;
};

export function TailorExportView({ runId }: TailorExportViewProps) {
  const router = useRouter();
  const { run, persistRun } = useTailoringRun({ runId });

  useEffect(() => {
    if (!run) return;
    if (!run.tailoredResume) {
      router.replace(`/tailor/${runId}/analysis`);
    }
  }, [run, runId, router]);

  if (!run?.tailoredResume) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center text-muted-foreground">
        Loading export…
      </div>
    );
  }

  return (
    <TailorRunShell
      currentStep="export"
      run={run}
      title="Export"
      description="Download tailored resume and comparison PDFs after verifying content."
    >
      <GuardrailWarningsBanner
        warnings={run.guardrailWarnings ?? []}
        hasCritical={run.hasCriticalGuardrails}
      />

      {run.tailoredMatch && run.originalMatch && (
        <div className="grid gap-4 md:grid-cols-2">
          <ScoreCard label="Original match" score={run.originalMatch} />
          <ScoreCard label="Tailored match" score={run.tailoredMatch} />
        </div>
      )}

      <PDFExportButton
        run={run}
        onExported={() => {
          persistRun({ ...run, status: "exported" });
        }}
      />
    </TailorRunShell>
  );
}
