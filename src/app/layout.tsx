import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PlanProvider } from "@/lib/planContext";
import { BenchmarkProvider } from "@/lib/benchmarkContext";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "EdgeBench — Benchmarking de LLMs para Edge",
  description: "Descubra, compare e otimize modelos de linguagem para hardware embarcado. Do Jetson ao ESP32.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <PlanProvider>
          <BenchmarkProvider>{children}</BenchmarkProvider>
        </PlanProvider>
      </body>
    </html>
  );
}
