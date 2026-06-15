"use client";

import type { JobDescriptionProfile } from "@/lib/schemas";
import { Badge } from "@/components/ui/badge";

type JDRequirementsSummaryProps = {
  jobDescription: JobDescriptionProfile;
};

export function JDRequirementsSummary({ jobDescription }: JDRequirementsSummaryProps) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-xs">
      <div className="flex flex-wrap items-baseline gap-2">
        <h3 className="text-lg font-semibold">{jobDescription.jobTitle}</h3>
        {jobDescription.company && (
          <span className="text-sm text-muted-foreground">@ {jobDescription.company}</span>
        )}
        {jobDescription.seniorityLevel && (
          <Badge variant="secondary">{jobDescription.seniorityLevel}</Badge>
        )}
      </div>

      <RequirementSection title="Required skills" items={jobDescription.requiredSkills} />
      <RequirementSection title="Preferred skills" items={jobDescription.preferredSkills} />
      <RequirementSection title="Tools" items={jobDescription.tools} />
      <RequirementSection title="Keywords" items={jobDescription.keywords} variant="outline" />

      {jobDescription.responsibilities.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Top responsibilities
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
            {jobDescription.responsibilities.slice(0, 4).map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function RequirementSection({
  title,
  items,
  variant = "secondary",
}: {
  title: string;
  items: string[];
  variant?: "secondary" | "outline";
}) {
  if (items.length === 0) return null;
  return (
    <div className="mt-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {items.map((item) => (
          <Badge key={item} variant={variant}>
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}
