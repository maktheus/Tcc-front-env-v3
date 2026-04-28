"use client";

import { useState } from "react";
import {
  TrendingUp, BarChart2, Activity, Calendar,
  Download, Zap, Target, Clock, Battery,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FeatureGate } from "@/components/FeatureGate";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { UpgradeModal } from "@/components/UpgradeModal";
import { usePlan } from "@/lib/planContext";

const ACTIVITY_DATA = [
  { day: "Seg", simulações: 2, benchmarks: 5 },
  { day: "Ter", simulações: 0, benchmarks: 3 },
  { day: "Qua", simulações: 1, benchmarks: 8 },
  { day: "Qui", simulações: 3, benchmarks: 4 },
  { day: "Sex", simulações: 2, benchmarks: 11 },
  { day: "Sáb", simulações: 0, benchmarks: 2 },
  { day: "Dom", simulações: 1, benchmarks: 6 },
];

const ACCURACY_DATA = [
  { month: "Set", estimado: 38, real: 36 },
  { month: "Out", estimado: 22, real: 21 },
  { month: "Nov", estimado: 62, real: 64 },
  { month: "Dez", estimado: 14, real: 15 },
  { month: "Jan", estimado: 38, real: 37 },
];

const HARDWARE_USAGE = [
  { name: "Jetson Orin Nano", runs: 12, fill: "#22a36b" },
  { name: "Raspberry Pi 5", runs: 8, fill: "#60a5fa" },
  { name: "Jetson AGX Orin", runs: 5, fill: "#a78bfa" },
  { name: "ESP32-S3", runs: 3, fill: "#fbbf24" },
];

const KPI_DATA = [
  { label: "Simulações este mês", value: "1", limit: "3", icon: Zap, color: "text-brand-400", pct: 33 },
  { label: "Benchmarks favoritados", value: "4", icon: Target, color: "text-blue-400" },
  { label: "Economia estimada", value: "14h", icon: Clock, color: "text-purple-400", note: "vs. experimentação manual" },
  { label: "Consumo médio otimizado", value: "9.2W", icon: Battery, color: "text-yellow-400" },
];

export default function AnalyticsPage() {
  const { isProOrAbove } = usePlan();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [period, setPeriod] = useState("7d");

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Analytics Pessoal</h1>
            <p className="text-zinc-500 mt-1">Seu histórico de simulações, benchmarks e impacto real no deploy.</p>
          </div>
          <div className="flex items-center gap-2">
            {isProOrAbove && (
              <>
                <div className="flex rounded-lg border border-zinc-700 overflow-hidden">
                  {["7d", "30d", "90d"].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                        period === p ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <Button variant="secondary" size="sm">
                  <Download size={13} /> Exportar PDF
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Basic KPIs — available to all */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {KPI_DATA.map((kpi) => (
            <Card key={kpi.label}>
              <div className="flex items-start justify-between mb-3">
                <kpi.icon size={18} className={kpi.color} />
                {kpi.pct !== undefined && (
                  <span className="text-xs text-zinc-600">{kpi.pct}%</span>
                )}
              </div>
              <div className="text-2xl font-extrabold text-zinc-100">
                {kpi.value}
                {kpi.limit && <span className="text-sm font-normal text-zinc-600">/{kpi.limit}</span>}
              </div>
              <div className="text-xs text-zinc-500 mt-0.5">{kpi.label}</div>
              {kpi.note && <div className="text-[10px] text-zinc-700 mt-1">{kpi.note}</div>}
              {kpi.pct !== undefined && (
                <div className="mt-2 h-1 rounded-full bg-zinc-800">
                  <div className="h-full rounded-full bg-brand-500" style={{ width: `${kpi.pct}%` }} />
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Activity chart — Pro gate */}
        <FeatureGate
          requiredPlan="pro"
          feature="Gráfico de Atividade"
          reason="Visualize sua evolução de simulações e benchmarks ao longo do tempo com o Pro."
        >
          <Card className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-brand-400" />
                <p className="text-sm font-semibold text-zinc-200">Atividade — últimos 7 dias</p>
              </div>
              <Badge variant="blue" className="text-[10px]">Pro</Badge>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={ACTIVITY_DATA}>
                <defs>
                  <linearGradient id="simGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22a36b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22a36b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="benchGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="day" tick={{ fill: "#71717a", fontSize: 12 }} axisLine={false} />
                <YAxis tick={{ fill: "#71717a", fontSize: 12 }} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: "8px" }}
                  labelStyle={{ color: "#e4e4e7" }}
                  itemStyle={{ color: "#a1a1aa" }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Area type="monotone" dataKey="simulações" stroke="#22a36b" fill="url(#simGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="benchmarks" stroke="#60a5fa" fill="url(#benchGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </FeatureGate>

        <div className="grid gap-6 lg:grid-cols-2 mb-6">
          {/* Accuracy comparison — Pro gate */}
          <FeatureGate
            requiredPlan="pro"
            feature="Estimativa vs Realidade"
            reason="Compare o que o simulador estimou vs. o que aconteceu no deploy real."
          >
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-purple-400" />
                  <p className="text-sm font-semibold text-zinc-200">Estimado vs Real (tokens/s)</p>
                </div>
                <Badge variant="blue" className="text-[10px]">Pro</Badge>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={ACCURACY_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="month" tick={{ fill: "#71717a", fontSize: 12 }} axisLine={false} />
                  <YAxis tick={{ fill: "#71717a", fontSize: 12 }} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: "8px" }}
                    labelStyle={{ color: "#e4e4e7" }}
                    itemStyle={{ color: "#a1a1aa" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Bar dataKey="estimado" fill="#22a36b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="real" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-zinc-600 mt-2 text-center">Precisão média: 97.3% (±2.7%)</p>
            </Card>
          </FeatureGate>

          {/* Hardware distribution */}
          <FeatureGate
            requiredPlan="pro"
            feature="Distribuição por Hardware"
            reason="Visualize quais hardwares você mais testa e receba sugestões de otimização personalizadas."
          >
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart2 size={16} className="text-yellow-400" />
                  <p className="text-sm font-semibold text-zinc-200">Hardwares testados</p>
                </div>
                <Badge variant="blue" className="text-[10px]">Pro</Badge>
              </div>
              <div className="space-y-3">
                {HARDWARE_USAGE.map((h) => (
                  <div key={h.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-400">{h.name}</span>
                      <span className="text-zinc-500">{h.runs} runs</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-800">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(h.runs / 12) * 100}%`, backgroundColor: h.fill }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </FeatureGate>
        </div>

        {/* Team analytics — Team gate */}
        <FeatureGate
          requiredPlan="team"
          feature="Analytics de Equipe"
          reason="Dashboard unificado com métricas de todos os membros da equipe, benchmarks privados e relatórios comparativos."
        >
          <Card className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-violet-400" />
                <p className="text-sm font-semibold text-zinc-200">Dashboard de Equipe — Últimos 30 dias</p>
              </div>
              <Badge variant="purple" className="text-[10px]">Team</Badge>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Membros ativos", value: "8" },
                { label: "Benchmarks privados", value: "23" },
                { label: "Simulações da equipe", value: "47" },
                { label: "Configs exportadas", value: "12" },
              ].map((s) => (
                <div key={s.label} className="text-center rounded-lg bg-zinc-800/50 p-3">
                  <div className="text-xl font-bold text-zinc-100">{s.value}</div>
                  <div className="text-xs text-zinc-500">{s.label}</div>
                </div>
              ))}
            </div>
          </Card>
        </FeatureGate>

        {/* Upgrade CTA for free users */}
        {!isProOrAbove && (
          <div className="rounded-2xl border border-violet-800/40 bg-gradient-to-r from-violet-950/40 to-indigo-950/30 p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-900/50">
              <TrendingUp size={26} className="text-violet-300" />
            </div>
            <h3 className="text-xl font-bold text-zinc-100 mb-2">
              Desbloqueie Analytics Avançado
            </h3>
            <p className="text-zinc-400 text-sm max-w-md mx-auto mb-6">
              Gráficos de atividade, comparação estimado vs. real, distribuição por hardware,
              exportação PDF e muito mais com o plano Pro.
            </p>
            <Button variant="upgrade" size="lg" onClick={() => setUpgradeOpen(true)}>
              <Zap size={16} /> Fazer upgrade para Pro — $29/mês
            </Button>
            <p className="mt-3 text-xs text-zinc-700">14 dias grátis · cancele quando quiser</p>
          </div>
        )}
      </div>

      <Footer />
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </div>
  );
}
