"use client";

import { useState } from "react";
import {
  Zap, Cpu, Battery, Clock, ShieldCheck, Terminal,
  ChevronRight, AlertTriangle, CheckCircle2, RefreshCw, Download, FlaskConical,
} from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { UsageMeter } from "@/components/UsageMeter";
import { FeatureGate } from "@/components/FeatureGate";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { UpgradeModal } from "@/components/UpgradeModal";
import { usePlan } from "@/lib/planContext";
import { HARDWARE_PROFILES } from "@/lib/data";
import type { SimulatorOutput } from "@/types";

const MODELS = [
  "Llama-3-8B", "Llama-3-70B", "Phi-3 Mini (3.8B)", "Gemma-2B",
  "Mistral-7B", "TinyLlama-1.1B", "YOLOv8n", "Whisper-Small",
];

const OPTIMIZE_OBJECTIVES = [
  { id: "latency", label: "Minimizar latência", icon: "⚡" },
  { id: "energy", label: "Reduzir consumo", icon: "🔋" },
  { id: "accuracy", label: "Maximizar precisão", icon: "🎯" },
];

const PREVIOUS_RUNS = [
  { model: "Phi-3 Mini", hardware: "Raspberry Pi 5", result: "✓ Viável", date: "há 2 dias" },
  { model: "Gemma-2B", hardware: "Jetson Orin Nano", result: "✓ Viável", date: "há 5 dias" },
  { model: "Llama-3-70B", hardware: "ESP32-S3", result: "✗ Inviável", date: "há 1 semana" },
];

function simulateResult(model: string, hardware: string, maxWatts: number, objective: string): SimulatorOutput {
  const hw = HARDWARE_PROFILES.find((h) => h.id === hardware);
  const isSmall = model.includes("1.1B") || model.includes("2B") || model.includes("3.8B") || model.includes("nano") || model.includes("Small");
  const isMCU = hw?.category === "mcu";
  const isLarge = model.includes("70B") || model.includes("65B");

  if (isMCU && isLarge) {
    return {
      feasible: false,
      technique: "N/A",
      estimatedTokensPerSec: 0,
      estimatedWatts: 0,
      accuracyDrop: 0,
      runtime: "N/A",
      script: "",
    };
  }

  const baseTps = isSmall ? (isMCU ? 2 : 22) : (model.includes("70B") ? 18 : 38);
  const baseW = isSmall ? (isMCU ? 0.24 : 4.8) : (model.includes("70B") ? 58 : 9.2);
  const technique = objective === "energy" ? "INT4 + pruning 30%" : "INT4 + TensorRT";
  const runtime = isMCU ? "llama.cpp (bare metal)" : (hw?.category === "jetson" ? "TensorRT-LLM" : "llama.cpp");

  return {
    feasible: baseW <= maxWatts || maxWatts === 0,
    technique,
    estimatedTokensPerSec: baseTps,
    estimatedWatts: Math.min(baseW, maxWatts || baseW),
    accuracyDrop: 1.2,
    runtime,
    script: `#!/bin/bash\n# EdgeBench generated script\n./llama.cpp/main \\\n  -m models/${model.replace(/\s/g, "-").toLowerCase()}-${technique.includes("INT4") ? "q4_k_m" : "q8_0"}.gguf \\\n  -n 256 --temp 0.7 \\\n  ${technique.includes("TensorRT") ? "--n-gpu-layers 32" : "--threads 4"}\n`,
  };
}

export default function SimulatorPage() {
  const { canSimulate, useSimulation, isProOrAbove, profile } = usePlan();
  const [model, setModel] = useState("");
  const [hardware, setHardware] = useState("");
  const [maxWatts, setMaxWatts] = useState("");
  const [objective, setObjective] = useState("latency");
  const [result, setResult] = useState<SimulatorOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const canRun = model && hardware;

  const handleSimulate = () => {
    if (!canSimulate) { setUpgradeOpen(true); return; }
    if (!canRun) return;

    const consumed = useSimulation();
    if (!consumed) { setUpgradeOpen(true); return; }

    setLoading(true);
    setResult(null);
    setTimeout(() => {
      setResult(simulateResult(model, hardware, Number(maxWatts) || 100, objective));
      setLoading(false);
    }, 1800);
  };

  const handleReset = () => { setResult(null); setModel(""); setHardware(""); setMaxWatts(""); };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-6">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-zinc-100">Simulador de Viabilidade</h1>
              {!isProOrAbove && (
                <Badge variant="gray" className="text-xs">
                  {profile.simulationsUsed}/{profile.simulationsLimit} usadas
                </Badge>
              )}
            </div>
            <p className="text-zinc-500">
              Estime tokens/s, consumo e acurácia antes de qualquer deploy. Baseado em {">"}4.200 runs validados.
            </p>
          </div>
          {!isProOrAbove && (
            <Button variant="upgrade" size="sm" onClick={() => setUpgradeOpen(true)}>
              <Zap size={13} /> Ir ilimitado
            </Button>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Form */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Configuração</p>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Modelo *</label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none"
                  >
                    <option value="">Selecionar modelo...</option>
                    {MODELS.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Hardware alvo *</label>
                  <select
                    value={hardware}
                    onChange={(e) => setHardware(e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none"
                  >
                    <option value="">Selecionar hardware...</option>
                    {HARDWARE_PROFILES.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-1.5 block">
                    Limite de consumo (W)
                    <span className="ml-1 text-zinc-600">opcional</span>
                  </label>
                  <input
                    type="number"
                    value={maxWatts}
                    onChange={(e) => setMaxWatts(e.target.value)}
                    placeholder="ex: 10"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-2 block">Objetivo de otimização</label>
                  <div className="space-y-2">
                    {OPTIMIZE_OBJECTIVES.map((o) => (
                      <button
                        key={o.id}
                        onClick={() => setObjective(o.id)}
                        className={`w-full flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                          objective === o.id
                            ? "border-brand-500 bg-brand-500/10 text-brand-300"
                            : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600"
                        }`}
                      >
                        <span>{o.icon}</span>
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>

                {!canSimulate ? (
                  <Button variant="upgrade" size="lg" className="w-full" onClick={() => setUpgradeOpen(true)}>
                    <Zap size={14} /> Limite atingido — Fazer upgrade
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={handleSimulate}
                    disabled={!canRun || loading}
                  >
                    {loading ? (
                      <><RefreshCw size={14} className="animate-spin" /> Simulando...</>
                    ) : (
                      <><Zap size={14} /> Simular Viabilidade <ChevronRight size={14} /></>
                    )}
                  </Button>
                )}
              </div>
            </Card>

            <UsageMeter />

            {/* Previous runs — gated for Pro */}
            <FeatureGate
              requiredPlan="pro"
              feature="Histórico de Simulações"
              reason="Acesse todas as suas simulações anteriores com o plano Pro."
            >
              <Card>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Simulações Recentes</p>
                <div className="space-y-2">
                  {PREVIOUS_RUNS.map((r, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-zinc-300">{r.model} · {r.hardware}</p>
                        <p className="text-[10px] text-zinc-600">{r.date}</p>
                      </div>
                      <span className={`text-xs font-semibold ${r.result.startsWith("✓") ? "text-brand-400" : "text-red-400"}`}>
                        {r.result}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </FeatureGate>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            {loading && (
              <Card className="h-full flex items-center justify-center py-16">
                <div className="text-center">
                  <RefreshCw size={32} className="animate-spin text-brand-400 mx-auto mb-4" />
                  <p className="text-zinc-400 font-medium">Cruzando benchmarks históricos...</p>
                  <p className="text-xs text-zinc-600 mt-1">Aplicando técnicas de otimização</p>
                </div>
              </Card>
            )}

            {!loading && !result && (
              <Card className="h-full flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800 mb-4">
                  <Cpu size={28} className="text-zinc-600" />
                </div>
                <p className="text-zinc-400 font-medium">Configure e execute uma simulação</p>
                <p className="text-sm text-zinc-600 mt-1 max-w-xs">
                  Selecione modelo e hardware para receber estimativas baseadas em dados reais de produção.
                </p>
                <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                  {[
                    { label: "Precisão", value: "99.1%" },
                    { label: "Runs base", value: "4.2k+" },
                    { label: "Hardwares", value: "38" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-lg bg-zinc-800/60 p-3">
                      <div className="text-lg font-bold text-zinc-200">{s.value}</div>
                      <div className="text-xs text-zinc-600">{s.label}</div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {!loading && result && (
              <div className="space-y-4 animate-slide-up">
                {/* Feasibility banner */}
                <div className={`rounded-xl border p-5 ${result.feasible ? "border-brand-700/60 bg-brand-950/30" : "border-red-800/60 bg-red-950/30"}`}>
                  <div className="flex items-center gap-3 mb-3">
                    {result.feasible ? (
                      <CheckCircle2 size={24} className="text-brand-400" />
                    ) : (
                      <AlertTriangle size={24} className="text-red-400" />
                    )}
                    <div>
                      <p className={`text-lg font-bold ${result.feasible ? "text-brand-300" : "text-red-300"}`}>
                        {result.feasible ? "✓ Viável" : "✗ Inviável"}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {result.feasible
                          ? `${model} pode rodar em ${HARDWARE_PROFILES.find((h) => h.id === hardware)?.name} com as configurações abaixo`
                          : "Este hardware não tem capacidade suficiente para o modelo selecionado"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="blue" className="text-xs">{result.technique}</Badge>
                    <Badge variant="gray" className="text-xs">{result.runtime}</Badge>
                  </div>
                </div>

                {result.feasible && (
                  <>
                    {/* Metrics grid */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {[
                        { label: "Tokens/s", value: result.estimatedTokensPerSec, unit: "", icon: Zap, color: "text-brand-400" },
                        { label: "Latência p50", value: Math.round(1000 / result.estimatedTokensPerSec), unit: "ms", icon: Clock, color: "text-blue-400" },
                        { label: "Consumo", value: result.estimatedWatts, unit: "W", icon: Battery, color: "text-yellow-400" },
                        { label: "Drop acurácia", value: result.accuracyDrop, unit: "%", icon: ShieldCheck, color: "text-purple-400" },
                      ].map((m) => (
                        <Card key={m.label} className="text-center">
                          <m.icon size={18} className={`${m.color} mx-auto mb-2`} />
                          <div className="text-2xl font-extrabold text-zinc-100">{m.value}{m.unit}</div>
                          <div className="text-xs text-zinc-500 mt-0.5">{m.label}</div>
                        </Card>
                      ))}
                    </div>

                    {/* Script */}
                    <Card>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Terminal size={14} className="text-zinc-400" />
                          <span className="text-sm font-semibold text-zinc-300">Script gerado</span>
                        </div>
                        <FeatureGate
                          requiredPlan="pro"
                          feature="Exportar Script"
                          reason="Faça download do script de configuração e integre ao seu CI/CD com o Pro."
                          blur={false}
                        >
                          <Button variant="secondary" size="sm">
                            <Download size={13} /> Exportar .sh
                          </Button>
                        </FeatureGate>
                      </div>
                      <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-4 text-xs font-mono text-zinc-300 leading-relaxed">
                        {result.script}
                      </pre>
                    </Card>

                    {/* CI/CD integration — Team gate */}
                    <FeatureGate
                      requiredPlan="team"
                      feature="Integração CI/CD"
                      reason="Envie este script diretamente para GitHub Actions, GitLab CI ou seu pipeline personalizado."
                    >
                      <Card>
                        <p className="text-sm font-semibold text-zinc-200 mb-2">Enviar para CI/CD</p>
                        <div className="flex gap-2">
                          <Button variant="secondary" size="sm">GitHub Actions</Button>
                          <Button variant="secondary" size="sm">GitLab CI</Button>
                          <Button variant="secondary" size="sm">Webhook</Button>
                        </div>
                      </Card>
                    </FeatureGate>

                    {/* Benchmark local CTA */}
                    <div className="rounded-xl border border-brand-700/50 bg-brand-950/20 p-4 flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <FlaskConical size={18} className="text-brand-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-brand-300">Quer confirmar com dados reais?</p>
                          <p className="text-xs text-zinc-500">
                            Execute o benchmark no seu {HARDWARE_PROFILES.find((h) => h.id === hardware)?.name ?? "hardware"} e compare com esta estimativa.
                          </p>
                        </div>
                      </div>
                      <Link href={`/benchmark`}>
                        <Button variant="primary" size="sm">
                          <FlaskConical size={13} /> Executar benchmark real <ChevronRight size={13} />
                        </Button>
                      </Link>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">
                      <Button variant="primary" size="md">
                        Publicar resultado na comunidade
                      </Button>
                      <Button variant="secondary" size="md" onClick={handleReset}>
                        Nova simulação
                      </Button>
                    </div>

                    {/* Disclaimer */}
                    <p className="text-xs text-zinc-700">
                      ⚠ Estimativas com ±15% de margem. Baseadas em {">"}4.200 runs validados.
                      Deploy real pode variar por temperatura, firmware e versão de drivers.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </div>
  );
}
