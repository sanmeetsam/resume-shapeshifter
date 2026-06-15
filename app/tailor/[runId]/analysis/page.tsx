import { TailorAnalysisView } from "@/components/tailor/TailorAnalysisView";

type PageProps = {
  params: Promise<{ runId: string }>;
};

export default async function TailorAnalysisPage({ params }: PageProps) {
  const { runId } = await params;
  return <TailorAnalysisView runId={runId} />;
}
