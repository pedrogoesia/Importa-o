"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, User } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { perguntasRapidas, respostasIa, respostaPadrao } from "@/data/ia";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
}

function findResposta(pergunta: string): string {
  const match = respostasIa.find(
    (r) => r.pergunta.toLowerCase() === pergunta.toLowerCase().trim()
  );
  if (match) return match.resposta;
  // loose keyword matching for free typing
  const q = pergunta.toLowerCase();
  const fuzzy = respostasIa.find((r) =>
    r.pergunta
      .toLowerCase()
      .split(" ")
      .filter((w) => w.length > 4)
      .some((w) => q.includes(w))
  );
  return fuzzy?.resposta ?? respostaPadrao;
}

export default function CentralIaPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "intro",
      role: "ai",
      text: "Olá, Marina! Sou o copiloto operacional da Importa.AI. Posso analisar processos, finanças, documentos, cargas e compliance. Pergunte algo ou escolha uma das sugestões abaixo.",
    },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function send(text: string) {
    const value = text.trim();
    if (!value) return;
    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", text: value };
    const aiMsg: Message = {
      id: `a-${Date.now()}`,
      role: "ai",
      text: findResposta(value),
    };
    setMessages((m) => [...m, userMsg, aiMsg]);
    setInput("");
  }

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col lg:h-[calc(100vh-7rem)]">
      <PageHeader
        title="Central de IA — Copiloto Operacional"
        description="Pergunte sobre empresas, processos, financeiro, documentos e cargas"
      />

      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
        <div className="flex-1 space-y-4 overflow-y-auto scrollbar-thin p-5">
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  m.role === "ai" ? "bg-brand-600 text-white" : "bg-slate-800 text-white"
                )}
              >
                {m.role === "ai" ? <Sparkles className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>
              <div
                className={cn(
                  "max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  m.role === "ai"
                    ? "rounded-tl-sm bg-slate-50 text-slate-700"
                    : "rounded-tr-sm bg-brand-600 text-white"
                )}
              >
                {m.text}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* Suggested prompts */}
        <div className="border-t border-slate-100 px-5 py-3">
          <div className="mb-3 flex flex-wrap gap-2">
            {perguntasRapidas.map((p) => (
              <button
                key={p}
                onClick={() => send(p)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
              >
                {p}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte ao copiloto…"
              className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-brand-300 focus:bg-white focus:ring-2 focus:ring-brand-100"
            />
            <button
              type="submit"
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white transition hover:bg-brand-700"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
