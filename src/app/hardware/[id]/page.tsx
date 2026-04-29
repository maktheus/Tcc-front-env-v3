"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Cpu, Battery, MemoryStick, Zap, ChevronRight, ArrowLeft, BarChart2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BenchmarkCard } from "@/components/BenchmarkCard";
import { HARDWARE_PROFILES, BENCHMARKS } from "@/lib/data";

const HW_DETAILS: Record<string, {
  description: string;
  specs: { label: string; value: string }[];
  useCases: string[];
  category: string;
}> = {
  "jetson-orin-nano": {
    description: "Plataforma NVIDIA para edge AI com GPU Ampere de 1024 núcleos e suporte a TensorRT. Ideal para inferência de LLMs de 3B–8B com quantização INT4.",
    specs: [
      { label: "CPU", value: "6-core Arm Cortex-A78AE" },
      { label: "GPU", value: "1024-core NVIDIA Ampere" },
      { label: "RAM", value: "8 GB LPDDR5" },
      { label: "TDP", value: "5W / 10W (configurável)" },
      { label: "Storage", value: "microSD / NVMe M.2" },
      { label: "OS", value: "Ubuntu 22.04 (JetPack 6)" },
    ],
    useCases: ["LLMs 3B–8B", "Visão computacional", "NLU offline", "Robótica"],
    category: "jetson",
  },
  "jetson-agx-orin": {
    description: "A plataforma NVIDIA Jetson mais poderosa para edge AI. Suporta modelos de até 70B em configuração multi-dispositivo com TensorRT-LLM.",
    specs: [
      { label: "CPU", value: "12-core Arm Cortex-A78AE" },
      { label: "GPU", value: "2048-core NVIDIA Ampere" },
      { label: "DLA", value: "2x NVDLA v3.0" },
      { label: "RAM", value: "64 GB LPDDR5" },
      { label: "TDP", value: "15W – 60W (configurável)" },
      { label: "OS", value: "Ubuntu 22.04 (JetPack 6)" },
    ],
    useCases: ["LLMs 7B–70B", "Multi-modal", "Autonomous vehicles", "Industria 4.0"],
    category: "jetson",
  },
  "rpi5": {
    description: "Single-board computer mais popular do mundo. Com o Cortex-A76, o Pi 5 é capaz de rodar SLMs de 1B–4B com llama.cpp e baixo consumo de energia.",
    specs: [
      { label: "CPU", value: "4-core Arm Cortex-A76 @ 2.4GHz" },
      { label: "GPU", value: "VideoCore VII (gráficos, sem CUDA)" },
      { label: "RAM", value: "4 GB / 8 GB LPDDR4X" },
      { label: "TDP", value: "~5W (típico)" },
      { label: "Storage", value: "microSD / USB / NVMe HAT" },
      { label: "OS", value: "Raspberry Pi OS / Ubuntu" },
    ],
    useCases: ["SLMs 1B–4B", "ASR (Whisper)", "NLU offline", "IoT gateway"],
    category: "raspberry",
  },
  "esp32s3": {
    description: "Microcontrolador de ultra-baixo consumo com 512KB de SRAM. Adequado apenas para modelos TinyML e SLMs extremamente reduzidos (<1B parâmetros).",
    specs: [
      { label: "CPU", value: "Dual-core Xtensa LX7 @ 240MHz" },
      { label: "RAM", value: "512 KB SRAM + 8 MB PSRAM (externo)" },
      { label: "Flash", value: "8 MB (interno)" },
      { label: "TDP", value: "~0.24W (ativo) / ~0.001W (deep sleep)" },
      { label: "Conectividade", value: "Wi-Fi 802.11 b/g/n + Bluetooth 5" },
      { label: "OS", value: "FreeRTOS / ESP-IDF" },
    ],
    useCases: ["TinyML", "Keyword spotting", "Anomaly detection", "Ultra-low power"],
    category: "mcu",
  },
  "stm32h7": {
    description: "MCU de alta performance da ST com Cortex-M7. Referência para TinyML de visão computacional com o framework STM32Cube.AI e CMSIS-NN.",
    specs: [
      { label: "CPU", value: "Arm Cortex-M7 @ 480MHz" },
      { label: "RAM", value: "1 MB SRAM" },
      { label: "Flash", value: "2 MB" },
      { label: "TDP", value: "~0.045W (típico)" },
      { label: "FPU", value: "Double-precision + SIMD" },
      { label: "OS", value: "FreeRTOS / bare-metal" },
    ],
    useCases: ["Visão (YOLOv8n)", "Audio classification", "Anomaly detection", "Industrial IoT"],
    category: "mcu",
  },
  "m2-macbook": {
    description: "Referência de performance/watt para ML no edge. O chip M2 Pro com Neural Engine de 16 núcleos é a baseline para benchmarks de desenvolvimento.",
    specs: [
      { label: "CPU", value: "12-core Apple M2 Pro" },
      { label: "GPU", value: "19-core Apple GPU" },
      { label: "Neural Engine", value: "16-core @ 15.8 TOPS" },
      { label: "RAM", value: "32 GB Unified Memory" },
      { label: "TDP", value: "~20W (típico ML)" },
      { label: "OS", value: "macOS Ventura+" },
    ],
    useCases: ["Desenvolvimento", "Baseline benchmark", "LLMs 7B–70B", "Fine-tuning"],
    category: "pc",
  },
};

export default function HardwarePage() {
  const { id } = useParams<{ id: string }>();
  const hardware = HARDWARE_PROFILES.find((h) => h.id === id);
  const detail = HW_DETAILS[id];

  if (!hardware || !detail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-500 mb-4">Hardware não encontrado.</p>
          <Link href="/dashboard"><Button variant="secondary" size="sm">Voltar ao Dashboard</Button></Link>
        </div>
      </div>
    );
  }

  const relatedBenchmarks = BENCHMARKS.filter((b) =>
    b.hardware.toLowerCase().includes(hardware.name.split(" ")[0].toLowerCase())
  );

  const chartData = relatedBenchmarks
    .filter((b) => b.tokensPerSec > 0)
    .map((b) => ({ model: b.model.split("-")[0], tps: b.tokensPerSec, W: b.energyW }));

  const categoryBadge: Record<string, { label: string; variant: "blue" | "green" | "yellow" | "gray" }> = {
    jetson: { label: "NVIDIA Jetson", variant: "green" },
    raspberry: { label: "SBC", variant: "blue" },
    mcu: { label: "Microcontrolador", variant: "yellow" },
    pc: { label: "Computador", variant: "gray" },
  };
  const cb = categoryBadge[detail.category] ?? categoryBadge.gray;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 py-8 lg:px-6">

        <Link href="/dashboard" className="mb-6 flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-200 transition-colors">
          <ArrowLeft size={15} /> Dashboard
        </Link>

        {/* Hero */}
        <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800">
                  <Cpu size={24} className="text-brand-400" />
                </div>
                <div>
                  <Badge variant={cb.variant} className="text-[10px] mb-1">{cb.label}</Badge>
                  <h1 className="text-2xl font-extrabold text-zinc-100">{hardware.name}</h1>
                </div>
              </div>
              <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">{detail.description}</p>
            </div>
            <div className="grid grid-cols-3 gap-3 flex-shrink-0">
              {[
                { icon: MemoryStick, label: "RAM", value: hardware.ram, color: "text-blue-400" },
                { icon: Battery, label: "TDP", value: hardware.tdp, color: "text-yellow-400" },
                { icon: Zap, label: "Benchmarks", value: String(relatedBenchmarks.length), color: "text-brand-400" },
              ].map((s) => (
                <div key={s.label} className="text-center rounded-xl bg-zinc-800 p-3">
                  <s.icon size={16} className={`${s.color} mx-auto mb-1`} />
                  <p className="text-sm font-bold text-zinc-100">{s.value}</p>
                  <p className="text-[10px] text-zinc-600">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Gráfico throughput vs modelo */}
            {chartData.length > 0 && (
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <BarChart2 size={15} className="text-brand-400" />
                  <p className="text-sm font-semibold text-zinc-200">Throughput por modelo (tokens/s)</p>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="model" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} />
                    <YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: "8px" }} labelStyle={{ color: "#e4e4e7" }} itemStyle={{ color: "#a1a1aa" }} />
                    <Bar dataKey="tps" name="tok/s" fill="#22a36b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Benchmarks relacionados */}
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                Benchmarks neste hardware ({relatedBenchmarks.length})
              </p>
              {relatedBenchmarks.length > 0 ? (
                <div className="space-y-3">
                  {relatedBenchmarks.map((b) => (
                    <BenchmarkCard key={b.id} benchmark={b} />
                  ))}
                </div>
              ) : (
                <Card className="text-center py-10 text-zinc-600">
                  <p>Nenhum benchmark público neste hardware ainda.</p>
                  <Link href="/simulator" className="mt-2 block text-sm text-brand-400 hover:underline">
                    Simular viabilidade →
                  </Link>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Especificações</p>
              <dl className="space-y-2">
                {detail.specs.map((s) => (
                  <div key={s.label} className="flex flex-col gap-0.5">
                    <dt className="text-[10px] text-zinc-600 uppercase tracking-wide">{s.label}</dt>
                    <dd className="text-xs text-zinc-300 font-mono">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </Card>

            <Card>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Casos de uso</p>
              <div className="flex flex-wrap gap-1.5">
                {detail.useCases.map((u) => (
                  <Badge key={u} variant="gray" className="text-[10px]">{u}</Badge>
                ))}
              </div>
            </Card>

            <Link href={`/simulator?hardware=${id}`}>
              <Card hover className="cursor-pointer border-brand-700/40 bg-brand-950/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-zinc-200">Simular neste hardware</p>
                    <p className="text-xs text-zinc-500">Estime viabilidade de qualquer modelo</p>
                  </div>
                  <ChevronRight size={16} className="text-brand-400" />
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
