import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Building2,
  ShieldCheck,
  FileText,
  Ship,
  AlertCircle,
} from "lucide-react";
import { getEmpresaById, empresas } from "@/data/empresas";
import { getProcessosByEmpresa } from "@/data/processos";
import { getDocumentosByEmpresa } from "@/data/documentos";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card, CardHeader } from "@/components/ui/Card";
import { ProcessCard } from "@/components/ui/ProcessCard";
import { DocumentCard } from "@/components/ui/DocumentCard";
import { formatDate } from "@/lib/utils";

export function generateStaticParams() {
  return empresas.map((e) => ({ id: e.id }));
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-800">{value || "—"}</p>
    </div>
  );
}

export default function EmpresaDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const empresa = getEmpresaById(params.id);
  if (!empresa) notFound();

  const processos = getProcessosByEmpresa(empresa.id);
  const documentos = getDocumentosByEmpresa(empresa.id);
  const pendencias = processos.flatMap((p) =>
    p.documentosPendentes.map((d) => ({ processo: p.numeroInterno, doc: d }))
  );

  return (
    <div className="space-y-6">
      <Link
        href="/empresas"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Empresas
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-600 text-lg font-semibold text-white shadow-sm">
            {empresa.nomeFantasia.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                {empresa.nomeFantasia}
              </h1>
              <StatusBadge status={empresa.status} />
            </div>
            <p className="text-sm text-slate-500">{empresa.razaoSocial}</p>
            <p className="text-xs text-slate-400">
              {empresa.cnpj} · {empresa.tipo} · {empresa.municipio}/{empresa.uf}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600">
            <Mail className="h-3.5 w-3.5 text-slate-400" /> {empresa.emailOperacional}
          </span>
          <span className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600">
            <Phone className="h-3.5 w-3.5 text-slate-400" /> {empresa.telefone}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Dados cadastrais" icon={Building2} />
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 p-5 sm:grid-cols-3">
              <Field label="Inscrição Estadual" value={empresa.inscricaoEstadual} />
              <Field label="Inscrição Municipal" value={empresa.inscricaoMunicipal} />
              <Field label="Regime tributário" value={empresa.regimeTributario} />
              <Field label="Benefício fiscal" value={empresa.beneficioFiscal} />
              <Field label="Contabilidade" value={empresa.contabilidade} />
              <Field label="Data de abertura" value={formatDate(empresa.dataAbertura)} />
              <Field label="ADM responsável" value={empresa.adm} />
              <Field label="Cliente vinculado" value={empresa.clienteVinculado} />
              <Field label="E-mail financeiro" value={empresa.emailFinanceiro} />
            </div>
            <div className="border-t border-slate-100 px-5 py-4">
              <div className="flex items-start gap-2 text-sm text-slate-600">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <span>
                  {empresa.endereco} — CEP {empresa.cep}, {empresa.municipio}/
                  {empresa.uf}
                </span>
              </div>
            </div>
          </Card>

          <div>
            <div className="mb-3 flex items-center gap-2">
              <Ship className="h-4 w-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-900">
                Processos vinculados ({processos.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {processos.map((p) => (
                <ProcessCard key={p.id} processo={p} />
              ))}
            </div>
          </div>

          {documentos.length > 0 && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-900">
                  Documentos fixos da empresa
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {documentos.map((d) => (
                  <DocumentCard key={d.id} documento={d} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Sócios" />
            <div className="divide-y divide-slate-50">
              {empresa.socios.map((s) => (
                <div key={s.nome} className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm text-slate-700">{s.nome}</span>
                  <span className="text-xs text-slate-400">{s.participacao}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Certificado digital" icon={ShieldCheck} />
            <div className="p-5 text-sm text-slate-600">
              {empresa.certificadoVinculado}
            </div>
          </Card>

          <Card>
            <CardHeader title="Pendências" icon={AlertCircle} />
            <div className="p-5">
              {pendencias.length === 0 ? (
                <p className="text-sm text-slate-400">Sem pendências.</p>
              ) : (
                <ul className="space-y-2">
                  {pendencias.map((p, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-slate-600"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      {p.doc}
                      <span className="text-xs text-slate-400">· {p.processo}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>

          {empresa.observacoes && (
            <Card>
              <CardHeader title="Observações" />
              <p className="p-5 text-sm text-slate-600">{empresa.observacoes}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
