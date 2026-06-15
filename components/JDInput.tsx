"use client";

import { Textarea } from "@/components/ui/textarea";

type JDInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function JDInput({ value, onChange, disabled }: JDInputProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="jd-input" className="text-sm font-medium">
        Job description
      </label>
      <Textarea
        id="jd-input"
        placeholder="Paste the full job listing text here…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="min-h-[220px] text-sm leading-relaxed"
        aria-label="Job description text"
      />
    </div>
  );
}
