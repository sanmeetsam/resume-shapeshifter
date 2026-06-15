import { TailorReviewView } from "@/components/tailor/TailorReviewView";

type PageProps = {
  params: Promise<{ runId: string }>;
};

export default async function TailorReviewPage({ params }: PageProps) {
  const { runId } = await params;
  return <TailorReviewView runId={runId} />;
}
