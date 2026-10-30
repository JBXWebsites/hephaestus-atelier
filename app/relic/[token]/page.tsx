import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { decodeRelic } from "@/lib/server-relics";
import { recipeTitle } from "@/lib/relics";
import SimpleHeader from "@/components/SimpleHeader";
import RelicRecordView from "@/components/RelicRecordView";
export const runtime = "nodejs";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const record = decodeRelic(token);
  return {
    title: record ? recipeTitle(record.recipe) : "Relic not found",
    robots: { index: false, follow: false },
  };
}
export default async function RelicPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const record = decodeRelic(token);
  if (!record) notFound();
  return (
    <>
      <SimpleHeader />
      <main className="record-page">
        <RelicRecordView record={record} />
      </main>
    </>
  );
}
