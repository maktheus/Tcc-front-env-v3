"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search, Filter, SlidersHorizontal, ArrowUpDown, BarChart2,
  Zap, TrendingUp, Plus, X, GitCompare, ChevronRight,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BenchmarkCard } from "@/components/BenchmarkCard";
import { FeatureGate } from "@/components/FeatureGate";
import { UsageMeter } from "@/components/UsageMeter";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { UpgradeModal } from "@/components/UpgradeModal";
import { usePlan } from "@/lib/planContext";
import { BENCHMARKS, HARDWARE_PROFILES } from "@/lib/data";

const HARDWARE_OPTIONS = ["Todos", "Jetson Orin Nano", "Jetson AGX Orin", "Raspberry Pi 5", "ESP32-S3", "STM32H7"];
const METRIC_OPTIONS = ["Mais upvotes", "Maior tokens/s", "Menor consumo", "Menor latência", "Maior acurácia"];
const TAG_OPTIONS = ["int4", "int8", "fp16", "tensorrt", "tflite", "onnx", "llm", "slm", "mcu", "vision"];

export default function DashboardPage() {
  const { isProOrAbove, profile } = usePlan();
  const [search, setSearch] = useState("");
  const [hardware, setHardware] = useState("Todos");
  const [sort, setSort] = useState("Mais upvotes");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const maxCompare = isProOrAbove ? 5 : 2;

  const toggleTag = (tag: string) => {
    setActiveTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      if (selectedIds.length >= maxCompare) {
        if (!isProOrAbove) { setUpgradeOpen(true); return; }
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  const filtered = BENCHMARKS
    .filter((b) => {
      if (search && !b.model.toLowerCase().includes(search.toLowerCase()) &&
          !b.hardware.toLowerCase().includes(search.toLowerCase()) &&
          !b.technique.toLowerCase().includes(search.toLowerCase())) return false;
      if (hardware !== "Todos" && b.hardware !== hardware) return false;
      if (activeTags.length > 0 && !activeTags.some((t) => b.tags.includes(t))) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "Mais upvotes") return b.upvotes - a.upvotes;
      if (sort === "Maior tokens/s") return b.tokensPerSec - a.tokensPerSec;
      if (sort === "Menor consumo") return a.energyW - b.energyW;
      if (sort === "Menor latência") return a.latencyMs - b.latencyMs;
      if (sort === "Maior acurácia") return b.accuracyPct - a.accuracyPct;
      return 0;
    });

  const selected = BENCHMARKS.filter((b) => selectedIds.includes(b.id));

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="hidden lg:flex flex-col gap-4 w-64 flex-shrink-0">
            <Card>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Hardware</p>
              <div className="space-y-1">
                {HARDWARE_OPTIONS.map((hw) => (
                  <button
                    key={hw}
                    onClick={() => setHardware(hw)}
                    className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${
                      hardware === hw ? "bg-brand-500/10 text-brand-400" : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                    }`}
                  >
                    {hw}
                  </button>
                ))}
              </div>
            </Card>

            <Card>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {TAG_OPTIONS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`rounded px-2 py-1 text-xs font-mono transition-colors ${
                      activeTags.includes(tag)
                        ? "bg-brand-500/20 text-brand-400 ring-1 ring-brand-500/40"
                        : "bg-zinc-800 text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </Card>

            <Card>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Perfis de Hardware</p>
              <div className="space-y-1">
                {HARDWARE_PROFILES.map((hw) => (
                  <Link
                    key={hw.id}
                    href={`/hardware/${hw.id}`}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors group"
                  >
                    <span className="truncate">{hw.name}</span>
                    <ChevronRight size={13} className="text-zinc-700 group-hover:text-zinc-400 flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </Card>

            <UsageMeter />

            {/* Sidebar upgrade nudge */}
            {!isProOrAbove && (
              <div className="rounded-xl border border-violet-800/50 bg-violet-950/30 p-4">
                <p className="text-xs font-semibold text-violet-300 mb-1">Pro: Benchmarks privados</p>
                <p className="text-xs text-zinc-500 mb-3">
                  Publique e acesse benchmarks internos da sua organização sem expor dados.
                </p>
                <Button variant="upgrade" size="sm" className="w-full" onClick={() => setUpgradeOpen(true)}>
                  <Zap size={12} /> Ver Pro
                </Button>
              </div>
            )}

            <Link href="/simulator">
              <Button variant="primary" size="md" className="w-full">
                <Zap size={14} /> Simulador de Viabilidade
              </Button>
            </Link>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Top bar */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl font-bold text-zinc-100">Benchmarks Públicos</h1>
                <p className="text-sm text-zinc-500">{filtered.length} resultados · validados pela comunidade</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar modelo, hardware..."
                    className="h-9 w-56 rounded-lg border border-zinc-700 bg-zinc-800 pl-8 pr-3 text-sm text-zinc-200 placeholder-zinc-600 focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="h-9 rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm text-zinc-300 focus:border-brand-500 focus:outline-none"
                >
                  {METRIC_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>

            {/* Compare bar */}
            {selectedIds.length > 0 && (
              <div className="mb-4 flex items-center justify-between rounded-xl border border-brand-700/50 bg-brand-950/30 px-4 py-3 animate-slide-up">
                <div className="flex items-center gap-2">
                  <GitCompare size={16} className="text-brand-400" />
                  <span className="text-sm text-zinc-300">
                    <span className="font-semibold text-brand-400">{selectedIds.length}</span> selecionado{selectedIds.length > 1 ? "s" : ""} para comparar
                  </span>
                  {!isProOrAbove && (
                    <Badge variant="gray" className="text-[10px]">máx 2 no Free</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="primary" size="sm" onClick={() => setShowCompare(true)}>
                    Comparar lado a lado
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
                    <X size={14} />
                  </Button>
                </div>
              </div>
            )}

            {/* Benchmark list */}
            <div className="space-y-3">
              {filtered.map((b) => (
                <BenchmarkCard
                  key={b.id}
                  benchmark={b}
                  selected={selectedIds.includes(b.id)}
                  onToggleSelect={() => toggleSelect(b.id)}
                  showSelect
                />
              ))}
              {filtered.length === 0 && (
                <div className="py-16 text-center text-zinc-600">
                  <BarChart2 size={32} className="mx-auto mb-3 opacity-40" />
                  <p>Nenhum benchmark encontrado para os filtros selecionados.</p>
                </div>
              )}
            </div>

            {/* Pro feature: private benchmarks */}
            <div className="mt-8">
              <FeatureGate
                requiredPlan="pro"
                feature="Benchmarks Privados"
                reason="Publique resultados internos sem expor dados da sua organização."
              >
                <Card>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-zinc-200">Seus Benchmarks Privados</p>
                      <p className="text-xs text-zinc-500 mt-0.5">0 benchmarks privados publicados</p>
                    </div>
                    <Button variant="secondary" size="sm">
                      <Plus size={14} /> Publicar resultado
                    </Button>
                  </div>
                </Card>
              </FeatureGate>
            </div>
          </div>
        </div>
      </div>

      {/* Compare Modal */}
      {showCompare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowCompare(false)} />
          <div className="relative z-10 w-full max-w-5xl rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between border-b border-zinc-800 px-6 py-4 bg-zinc-900">
              <h2 className="font-semibold text-zinc-100">Comparação lado a lado</h2>
              <button onClick={() => setShowCompare(false)} className="text-zinc-500 hover:text-zinc-200">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="py-2 text-left text-zinc-500 font-medium pr-6">Métrica</th>
                      {selected.map((b) => (
                        <th key={b.id} className="py-2 text-center text-zinc-200 font-semibold min-w-[140px]">
                          <div className="font-mono">{b.model}</div>
                          <div className="text-xs text-zinc-500 font-normal">{b.hardware}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {[
                      { label: "Tokens/s", key: "tokensPerSec", unit: "" },
                      { label: "Latência", key: "latencyMs", unit: "ms" },
                      { label: "Consumo", key: "energyW", unit: "W" },
                      { label: "Acurácia", key: "accuracyPct", unit: "%" },
                      { label: "Técnica", key: "technique", unit: "" },
                      { label: "Runtime", key: "runtime", unit: "" },
                    ].map((row) => {
                      const values = selected.map((b) => b[row.key as keyof typeof b]);
                      const nums = values.filter((v) => typeof v === "number") as number[];
                      const best = nums.length > 0
                        ? (row.key === "energyW" || row.key === "latencyMs") ? Math.min(...nums) : Math.max(...nums)
                        : null;
                      return (
                        <tr key={row.label}>
                          <td className="py-3 text-zinc-500 pr-6">{row.label}</td>
                          {selected.map((b) => {
                            const v = b[row.key as keyof typeof b];
                            const isBest = typeof v === "number" && v === best;
                            return (
                              <td key={b.id} className={`py-3 text-center font-mono ${isBest ? "text-brand-400 font-bold" : "text-zinc-300"}`}>
                                {typeof v === "number" ? `${v}${row.unit}` : String(v)}
                                {isBest && <span className="ml-1 text-[10px]">★</span>}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {!isProOrAbove && (
                <div className="mt-4 rounded-xl border border-violet-800/50 bg-violet-950/20 p-3 flex items-center justify-between">
                  <p className="text-xs text-zinc-400">Pro: compare até 5 modelos e exporte este relatório em PDF</p>
                  <Button variant="upgrade" size="sm" onClick={() => { setShowCompare(false); setUpgradeOpen(true); }}>
                    <Zap size={12} /> Upgrade
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </div>
  );
}
