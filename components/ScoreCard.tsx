"use client";

import type { MatchScore } from "@/lib/schemas";
import { Badge } from "@/components/ui/badge";

type ScoreCardProps = {
  label: string;
  score?: MatchScore;
  placeholder?: string;
};

export function ScoreCard({ label, score, placeholder }: ScoreCardProps) {
  if (!score) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">{label}</p>
        <p className="mt-1">{placeholder ?? "Not available yet"}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-4 shadow-xs">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">{label}</p>
        <Badge variant="default" className="text-base tabular-nums">
          {score.overallScore}
        </Badge>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{score.explanation}</p>
      <dl className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
        <ScoreItem label="Skills" value={score.skillCoverageScore} />
        <ScoreItem label="Responsibilities" value={score.responsibilityAlignmentScore} />
        <ScoreItem label="Keywords" value={score.keywordScore} />
        <ScoreItem label="Seniority" value={score.seniorityScore} />
      </dl>
      {score.criticalMissingRequirements.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-destructive">Critical gaps</p>
          <ul className="mt-1 list-inside list-disc text-xs text-muted-foreground">
            {score.criticalMissingRequirements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ScoreItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-muted/50 px-2 py-1">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium tabular-nums">{value}</dd>
    </div>
  );
}
