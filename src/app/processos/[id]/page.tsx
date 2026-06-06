import { notFound } from "next/navigation";
import { getProcessoById, processos } from "@/data/processos";
import { ProcessoDetail } from "@/components/processo/ProcessoDetail";

export function generateStaticParams() {
  return processos.map((p) => ({ id: p.id }));
}

export default function ProcessoDetailPage({
  params,
}: {
  params: { id: string };
}) {
  if (!getProcessoById(params.id)) notFound();
  return <ProcessoDetail id={params.id} />;
}
