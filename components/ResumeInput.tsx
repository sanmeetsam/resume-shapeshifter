"use client";

import { useRef, useState } from "react";
import { AlertCircle, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ResumeInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  parseWarnings?: string[];
  onParseWarnings?: (warnings: string[]) => void;
  maxUploadMb?: number;
};

export function ResumeInput({
  value,
  onChange,
  disabled,
  parseWarnings = [],
  onParseWarnings,
  maxUploadMb = 5,
}: ResumeInputProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setUploadError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/parse/resume", {
        method: "POST",
        body: form,
      });
      const data = (await res.json()) as {
        text?: string;
        parseWarnings?: string[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error ?? "Upload failed");
      }
      if (data.text) onChange(data.text);
      onParseWarnings?.(data.parseWarnings ?? []);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Could not parse file"
      );
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor="resume-input" className="text-sm font-medium">
          Resume
        </label>
        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="sr-only"
            id="resume-file"
            disabled={disabled || uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || uploading}
            onClick={() => fileRef.current?.click()}
            aria-label="Upload resume PDF or DOCX"
          >
            {uploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            Upload PDF/DOCX
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Paste plain text or upload PDF/DOCX (max {maxUploadMb} MB).
      </p>
      <Textarea
        id="resume-input"
        placeholder="Paste your resume text here…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || uploading}
        className="min-h-[220px] font-mono text-xs leading-relaxed"
        aria-describedby={
          parseWarnings.length > 0 ? "resume-parse-warnings" : undefined
        }
      />
      {uploadError && (
        <p className="text-sm text-destructive" role="alert">
          {uploadError}
        </p>
      )}
      {parseWarnings.length > 0 && (
        <div
          id="resume-parse-warnings"
          role="status"
          className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-950 dark:text-amber-100"
        >
          <p className="flex items-center gap-1.5 font-medium">
            <AlertCircle className="size-3.5 shrink-0" />
            Parse notes
          </p>
          <ul className="mt-1 list-inside list-disc space-y-0.5">
            {parseWarnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
