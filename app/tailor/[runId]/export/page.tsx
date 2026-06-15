import { TailorExportView } from "@/components/tailor/TailorExportView";

type PageProps = {
  params: Promise<{ runId: string }>;
};

export default async function TailorExportPage({ params }: PageProps) {
  const { runId } = await params;
  return <TailorExportView runId={runId} />;
}
