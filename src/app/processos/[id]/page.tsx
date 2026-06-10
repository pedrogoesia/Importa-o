import { processos } from "@/data/processos";
import { ProcessoDetail } from "@/components/processo/ProcessoDetail";

export function generateStaticParams() {
  return processos.map((p) => ({ id: p.id }));
}

export default function ProcessoDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <ProcessoDetail id={params.id} />;
}
