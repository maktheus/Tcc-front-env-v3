import type { Metadata } from "next";
import "./globals.css";
import { PlanProvider } from "@/lib/planContext";

export const metadata: Metadata = {
  title: "EdgeBench — Benchmarking de LLMs para Edge",
  description: "Descubra, compare e otimize modelos de linguagem para hardware embarcado. Do Jetson ao ESP32.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <PlanProvider>{children}</PlanProvider>
      </body>
    </html>
  );
}
