import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppLayout } from "@/components/layout/AppLayout";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Escopo — Sistema Operacional de IA para Importadoras",
  description:
    "ERP moderno com IA para importadoras: processos, documentos, cargas, financeiro, fiscal e compliance em um só lugar.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
