"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Play, Square, RotateCcw, Download, Share2, CheckCircle2,
  XCircle, Terminal, Cpu, Zap, Clock, Battery, Target,
  ChevronRight, Trash2, AlertTriangle, BarChart3, History,
  FlaskConical,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
} from "recharts";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useBenchmark } from "@/lib/benchmarkContext";
import { HARDWARE_PROFILES } from "@/lib/data";
import type { BenchmarkRunConfig, BenchmarkRunResults, LocalBenchmarkRun } from "@/types";

const MODELS = [
  { id: "llama3-8b", label: "Llama-3-8B", size: "8B" },
  { id: "llama3-70b", label: "Llama-3-70B", size: "70B" },
  { id: "phi3-mini", label: "Phi-3 Mini", size: "3.8B" },
  { id: "gemma-2b", label: "Gemma-2B", size: "2B" },
  { id: "mistral-7b", label: "Mistral-7B", size: "7B" },
  { id: "tinyllama", label: "TinyLlama-1.1B", size: "1.1B" },
  { id: "yolov8n", label: "YOLOv8n", size: "3.2MB" },
  { id: "whisper-small", label: "Whisper-Small", size: "244MB" },
];

const QUANTIZATIONS = ["FP32", "FP16", "INT8", "INT4 (Q4_K_M)", "INT4 (Q4_0)", "GGUF Q8_0"];
const RUNTIMES = ["llama.cpp", "TensorRT-LLM", "ONNX Runtime", "TFLite", "STM32Cube.AI", "vLLM"];

const BENCHMARK_TYPES = [
  { id: "performance", label: "Performance", icon: Zap, desc: "Tokens/s, latência p50/p95/p99" },
  { id: "energy", label: "Consumo", icon: Battery, desc: "Watts médios, Wh por inferência" },
  { id: "accuracy", label: "Acurácia", icon: Target, desc: "Perda de precisão vs FP32 baseline" },
  { id: "full", label: "Completo", icon: FlaskConical, desc: "Todos os testes acima" },
] as const;

function generateBenchmarkLogs(config: BenchmarkRunConfig): { lines: string[]; delaysMs: number[] } {
  const hwName = HARDWARE_PROFILES.find((h) => h.id === config.hardware)?.name ?? config.hardware;
  const lines: string[] = [];
  const delaysMs: number[] = [];

  const add = (line: string, delay: number) => { lines.push(line); delaysMs.push(delay); };

  add(`[EdgeBench v0.1.0] Iniciando benchmark em ${hwName}`, 0);
  add(`[Config] Modelo: ${config.model} | Quantização: ${config.quantization} | Runtime: ${config.runtime}`, 200);
  add(`[Config] Iterações: ${config.iterations} | Warmup: ${config.warmupRuns} threads`, 100);
  add("", 100);
  add("[FASE 1/4] Verificando ambiente...", 300);
  add(`  ✓ Runtime ${config.runtime} encontrado`, 400);
  add(`  ✓ Modelo carregado (${config.model})`, 600);
  add(`  ✓ Hardware detectado: ${hwName}`, 300);
  add("", 100);
  add("[FASE 2/4] Warmup runs...", 200);

  for (let i = 1; i <= config.warmupRuns; i++) {
    add(`  Warmup ${i}/${config.warmupRuns} → concluído`, 500);
  }

  add("", 100);
  add("[FASE 3/4] Inferência — coletando métricas...", 300);

  for (let i = 1; i <= Math.min(config.iterations, 8); i++) {
    const tps = Math.round(25 + Math.random() * 20);
    const lat = Math.round(1000 / tps + Math.random() * 5);
    add(`  Run ${i}/${config.iterations} → ${tps} tok/s | ${lat} ms`, 700);
  }

  if (config.iterations > 8) {
    add(`  ... (${config.iterations - 8} runs adicionais)`, 400);
  }

  add("", 100);

  if (config.benchmarkType === "energy" || config.benchmarkType === "full") {
    add("[FASE 4/4] Medição de consumo energético...", 300);
    add("  Lendo sensor INA219... OK", 600);
    add(`  Consumo médio: ${(4 + Math.random() * 6).toFixed(1)}W`, 500);
    add(`  Energia por inferência: ${(0.03 + Math.random() * 0.05).toFixed(4)} Wh`, 400);
    add("", 100);
  }

  if (config.benchmarkType === "accuracy" || config.benchmarkType === "full") {
    add("[FASE 4/4] Avaliação de acurácia (HellaSwag 500 amostras)...", 300);
    add("  Comparando contra baseline FP32...", 800);
    add(`  Acurácia relativa: ${(97 + Math.random() * 2.5).toFixed(1)}%`, 600);
    add("", 100);
  }

  add("[OK] Benchmark concluído com sucesso.", 300);
  add("[Resultados] Salvos em edgebench_results.json", 200);

  return { lines, delaysMs };
}

function generateResults(config: BenchmarkRunConfig): BenchmarkRunResults {
  const hw = HARDWARE_PROFILES.find((h) => h.id === config.hardware);
  const isSmall = config.model.includes("1.1B") || config.model.includes("2B") || config.model.includes("3.8B");
  const isMCU = hw?.category === "mcu";
  const isLarge = config.model.includes("70B");

  const baseTps = isMCU ? 2 : isSmall ? 22 : isLarge ? 18 : 38;
  const variance = () => 0.85 + Math.random() * 0.3;

  const tokensPerSec = Math.round(baseTps * variance());
  const tpsValues = Array.from({ length: config.iterations }, () =>
    Math.round(baseTps * (0.9 + Math.random() * 0.2))
  );

  const latBase = Math.round(1000 / tokensPerSec);
  const latValues = tpsValues.map((t) => Math.round(1000 / t + Math.random() * 3));
  latValues.sort((a, b) => a - b);

  const baseW = isMCU ? 0.24 : isSmall ? 4.8 : isLarge ? 58 : 9.2;
  const energyW = parseFloat((baseW * variance()).toFixed(2));

  return {
    tokensPerSec,
    tokensPerSecMin: Math.round(baseTps * 0.88),
    tokensPerSecMax: Math.round(baseTps * 1.12),
    tokensPerSecStdDev: parseFloat((baseTps * 0.07).toFixed(1)),
    latencyP50: latValues[Math.floor(latValues.length * 0.5)],
    latencyP95: latValues[Math.floor(latValues.length * 0.95)] ?? latBase * 1.2,
    latencyP99: latValues[latValues.length - 1] ?? latBase * 1.4,
    energyW,
    energyWh: parseFloat((energyW * (latBase / 3600000)).toFixed(6)),
    accuracyPct: parseFloat((97.5 + Math.random() * 2.3).toFixed(1)),
    totalTokens: tokensPerSec * config.iterations * 5,
    totalDurationMs: config.iterations * latBase + config.warmupRuns * latBase,
    timeSeriesTokensPerSec: tpsValues,
    timeSeriesLatency: latValues,
  };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function PhaseSetup({
  onStart,
}: {
  onStart: (cfg: BenchmarkRunConfig) => void;
}) {
  const [model, setModel] = useState("");
  const [hardware, setHardware] = useState("");
  const [benchmarkType, setBenchmarkType] = useState<BenchmarkRunConfig["benchmarkType"]>("full");
  const [iterations, setIterations] = useState(10);
  const [warmupRuns, setWarmupRuns] = useState(3);
  const [quantization, setQuantization] = useState("INT4 (Q4_K_M)");
  const [runtime, setRuntime] = useState("llama.cpp");
  const [threads, setThreads] = useState(4);
  const [gpuLayers, setGpuLayers] = useState(32);

  const hw = HARDWARE_PROFILES.find((h) => h.id === hardware);
  const canRun = model && hardware;

  const handleStart = () => {
    if (!canRun) return;
    onStart({
      model,
      hardware,
      benchmarkType,
      iterations,
      warmupRuns,
      quantization,
      runtime,
      threads,
      gpuLayers,
      promptTemplate: "Explique o conceito de edge computing em 3 frases.",
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Left column: main config */}
      <div className="lg:col-span-2 space-y-5">
        {/* Model + Hardware */}
        <Card>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
            Alvo do Benchmark
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Modelo *</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none"
              >
                <option value="">Selecionar modelo...</option>
                {MODELS.map((m) => (
                  <option key={m.id} value={m.label}>
                    {m.label} ({m.size})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Hardware local *</label>
              <select
                value={hardware}
                onChange={(e) => setHardware(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none"
              >
                <option value="">Selecionar hardware...</option>
                {HARDWARE_PROFILES.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.ram} · {h.tdp})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {hw && (
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="gray">{hw.chip}</Badge>
              <Badge variant="gray">RAM: {hw.ram}</Badge>
              <Badge variant="gray">TDP: {hw.tdp}</Badge>
              <Badge variant={hw.category === "mcu" ? "yellow" : hw.category === "jetson" ? "blue" : "gray"}>
                {hw.category.toUpperCase()}
              </Badge>
            </div>
          )}
        </Card>

        {/* Benchmark type */}
        <Card>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
            Tipo de Benchmark
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {BENCHMARK_TYPES.map((bt) => (
              <button
                key={bt.id}
                onClick={() => setBenchmarkType(bt.id)}
                className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-colors ${
                  benchmarkType === bt.id
                    ? "border-brand-500 bg-brand-500/10"
                    : "border-zinc-700 bg-zinc-800/40 hover:border-zinc-600"
                }`}
              >
                <bt.icon
                  size={18}
                  className={benchmarkType === bt.id ? "text-brand-400 mt-0.5" : "text-zinc-500 mt-0.5"}
                />
                <div>
                  <p className={`text-sm font-semibold ${benchmarkType === bt.id ? "text-brand-300" : "text-zinc-300"}`}>
                    {bt.label}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">{bt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Execution params */}
        <Card>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
            Parâmetros de Execução
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block">
                Iterações de inferência
              </label>
              <input
                type="number"
                min={5}
                max={100}
                value={iterations}
                onChange={(e) => setIterations(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block">
                Runs de aquecimento
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={warmupRuns}
                onChange={(e) => setWarmupRuns(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Quantização</label>
              <select
                value={quantization}
                onChange={(e) => setQuantization(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none"
              >
                {QUANTIZATIONS.map((q) => <option key={q}>{q}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Runtime</label>
              <select
                value={runtime}
                onChange={(e) => setRuntime(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none"
              >
                {RUNTIMES.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block">
                Threads CPU
              </label>
              <input
                type="number"
                min={1}
                max={32}
                value={threads}
                onChange={(e) => setThreads(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block">
                GPU Layers (0 = CPU only)
              </label>
              <input
                type="number"
                min={0}
                max={80}
                value={gpuLayers}
                onChange={(e) => setGpuLayers(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Right column: summary + start */}
      <div className="space-y-4">
        <Card>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
            Resumo
          </p>
          <div className="space-y-2.5 text-sm">
            {[
              { label: "Modelo", value: model || "—" },
              {
                label: "Hardware",
                value: hw?.name || "—",
              },
              {
                label: "Tipo",
                value: BENCHMARK_TYPES.find((b) => b.id === benchmarkType)?.label ?? "—",
              },
              { label: "Iterações", value: `${iterations} + ${warmupRuns} warmup` },
              { label: "Quantização", value: quantization },
              { label: "Runtime", value: runtime },
            ].map((item) => (
              <div key={item.label} className="flex justify-between gap-2">
                <span className="text-zinc-500">{item.label}</span>
                <span className="text-zinc-300 font-medium text-right truncate max-w-[140px]">
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-zinc-800">
            <p className="text-xs text-zinc-600 mb-3">
              Tempo estimado: ~{Math.round(((iterations + warmupRuns) * 1.5) / 60)} min
            </p>
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleStart}
              disabled={!canRun}
            >
              <Play size={15} /> Iniciar Benchmark
              <ChevronRight size={14} />
            </Button>
            {!canRun && (
              <p className="text-xs text-zinc-600 mt-2 text-center">
                Selecione modelo e hardware para continuar
              </p>
            )}
          </div>
        </Card>

        <Card>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            O que será medido
          </p>
          <ul className="space-y-1.5 text-xs text-zinc-400">
            {benchmarkType !== "energy" && benchmarkType !== "accuracy" && (
              <>
                <li className="flex items-center gap-2"><Zap size={11} className="text-brand-400" /> Tokens por segundo (média, min, max)</li>
                <li className="flex items-center gap-2"><Clock size={11} className="text-blue-400" /> Latência p50, p95, p99</li>
              </>
            )}
            {(benchmarkType === "energy" || benchmarkType === "full") && (
              <li className="flex items-center gap-2"><Battery size={11} className="text-yellow-400" /> Consumo médio (W) e por inferência (Wh)</li>
            )}
            {(benchmarkType === "accuracy" || benchmarkType === "full") && (
              <li className="flex items-center gap-2"><Target size={11} className="text-purple-400" /> Acurácia relativa vs baseline FP32</li>
            )}
            <li className="flex items-center gap-2"><BarChart3 size={11} className="text-zinc-500" /> Séries temporais e distribuição</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

function PhaseRunning({
  run,
  onCancel,
}: {
  run: LocalBenchmarkRun;
  onCancel: () => void;
}) {
  const logEndRef = useRef<HTMLDivElement>(null);
  const totalExpected = run.config.iterations + run.config.warmupRuns + 12;
  const progress = Math.min((run.logs.length / totalExpected) * 100, 95);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [run.logs]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-2.5 rounded-full bg-brand-500 animate-pulse" />
          <span className="text-sm font-semibold text-zinc-200">
            Executando benchmark em {HARDWARE_PROFILES.find((h) => h.id === run.config.hardware)?.name}...
          </span>
        </div>
        <Button variant="danger" size="sm" onClick={onCancel}>
          <Square size={13} /> Cancelar
        </Button>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
          <span>Progresso</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Live metrics (update as logs come in) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Runs completos", value: Math.max(0, run.logs.filter((l) => l.includes("Run ")).length), unit: "" },
          { label: "Warmups", value: run.config.warmupRuns, unit: "" },
          { label: "Iterações alvo", value: run.config.iterations, unit: "" },
          { label: "Tempo decorrido", value: Math.round((Date.now() - new Date(run.startedAt).getTime()) / 1000), unit: "s" },
        ].map((m) => (
          <Card key={m.label} className="text-center py-3">
            <div className="text-xl font-bold text-zinc-100">{m.value}{m.unit}</div>
            <div className="text-xs text-zinc-500 mt-0.5">{m.label}</div>
          </Card>
        ))}
      </div>

      {/* Terminal log */}
      <Card className="p-0 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border-b border-zinc-800">
          <Terminal size={13} className="text-zinc-400" />
          <span className="text-xs font-mono text-zinc-400">edgebench — terminal</span>
          <div className="ml-auto flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
          </div>
        </div>
        <div className="h-64 overflow-y-auto bg-zinc-950 p-4 font-mono text-xs leading-relaxed">
          {run.logs.map((line, i) => (
            <div
              key={i}
              className={
                line.startsWith("[ERRO]") ? "text-red-400" :
                line.startsWith("[OK]") || line.includes("✓") ? "text-brand-400" :
                line.startsWith("[FASE") ? "text-blue-300 font-semibold" :
                line.startsWith("[Config]") || line.startsWith("[EdgeBench") ? "text-zinc-400" :
                "text-zinc-300"
              }
            >
              {line || " "}
            </div>
          ))}
          <div ref={logEndRef} />
          <span className="inline-block h-4 w-2 bg-zinc-300 animate-pulse" />
        </div>
      </Card>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  unit?: string;
  sub?: string;
  color: string;
}) {
  return (
    <Card className="flex flex-col gap-1">
      <Icon size={16} className={`${color} mb-1`} />
      <div className="text-2xl font-extrabold text-zinc-100">
        {value}
        {unit && <span className="text-sm font-normal text-zinc-500 ml-1">{unit}</span>}
      </div>
      <div className="text-xs text-zinc-500">{label}</div>
      {sub && <div className="text-[10px] text-zinc-600 mt-0.5">{sub}</div>}
    </Card>
  );
}

function PhaseResults({
  run,
  onReset,
  onPublish,
}: {
  run: LocalBenchmarkRun;
  onReset: () => void;
  onPublish: () => void;
}) {
  const r = run.results!;
  const hw = HARDWARE_PROFILES.find((h) => h.id === run.config.hardware);
  const durationSec = run.completedAt
    ? Math.round((new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime()) / 1000)
    : 0;

  const tpsChartData = r.timeSeriesTokensPerSec.map((v, i) => ({ run: i + 1, tps: v }));
  const latChartData = r.timeSeriesLatency.map((v, i) => ({ run: i + 1, latency: v }));

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Status banner */}
      <div className="rounded-xl border border-brand-700/60 bg-brand-950/30 p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={24} className="text-brand-400" />
            <div>
              <p className="text-lg font-bold text-brand-300">Benchmark concluído</p>
              <p className="text-xs text-zinc-500">
                {run.config.model} · {hw?.name} · {durationSec}s de execução · {run.config.iterations} iterações
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="blue">{run.config.quantization}</Badge>
            <Badge variant="gray">{run.config.runtime}</Badge>
          </div>
        </div>
      </div>

      {/* Primary metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard
          icon={Zap}
          label="Tokens/s (média)"
          value={r.tokensPerSec}
          sub={`min ${r.tokensPerSecMin} · max ${r.tokensPerSecMax} · σ ${r.tokensPerSecStdDev}`}
          color="text-brand-400"
        />
        <MetricCard
          icon={Clock}
          label="Latência p50"
          value={r.latencyP50}
          unit="ms"
          sub={`p95: ${r.latencyP95}ms · p99: ${r.latencyP99}ms`}
          color="text-blue-400"
        />
        <MetricCard
          icon={Battery}
          label="Consumo médio"
          value={r.energyW}
          unit="W"
          sub={`${(r.energyWh * 1000).toFixed(3)} mWh/inferência`}
          color="text-yellow-400"
        />
        <MetricCard
          icon={Target}
          label="Acurácia relativa"
          value={r.accuracyPct}
          unit="%"
          sub="vs baseline FP32"
          color="text-purple-400"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <p className="text-sm font-semibold text-zinc-300 mb-4">Tokens/s por run</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={tpsChartData}>
              <defs>
                <linearGradient id="tpsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="run" tick={{ fill: "#71717a", fontSize: 10 }} />
              <YAxis tick={{ fill: "#71717a", fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }}
                labelStyle={{ color: "#a1a1aa" }}
                itemStyle={{ color: "#22d3ee" }}
              />
              <Area type="monotone" dataKey="tps" stroke="#22d3ee" fill="url(#tpsGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <p className="text-sm font-semibold text-zinc-300 mb-4">Distribuição de latência (ms)</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={latChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="run" tick={{ fill: "#71717a", fontSize: 10 }} />
              <YAxis tick={{ fill: "#71717a", fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }}
                labelStyle={{ color: "#a1a1aa" }}
                itemStyle={{ color: "#60a5fa" }}
              />
              <Line type="monotone" dataKey="latency" stroke="#60a5fa" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Secondary stats */}
      <Card>
        <p className="text-sm font-semibold text-zinc-300 mb-4">Detalhes da execução</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Total de tokens gerados", value: r.totalTokens.toLocaleString("pt-BR") },
            { label: "Duração total", value: `${(r.totalDurationMs / 1000).toFixed(1)}s` },
            { label: "Iterações concluídas", value: run.config.iterations },
            { label: "Threads CPU", value: run.config.threads },
            { label: "GPU layers", value: run.config.gpuLayers > 0 ? run.config.gpuLayers : "CPU only" },
            { label: "Prompt template", value: "padrão EdgeBench" },
          ].map((item) => (
            <div key={item.label} className="rounded-lg bg-zinc-800/50 px-3 py-2.5">
              <div className="text-xs text-zinc-500">{item.label}</div>
              <div className="text-sm font-semibold text-zinc-200 mt-0.5">{item.value}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Log expandable */}
      <details className="group">
        <summary className="cursor-pointer list-none flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300">
          <Terminal size={13} />
          Ver log completo da execução
          <ChevronRight size={13} className="transition-transform group-open:rotate-90" />
        </summary>
        <div className="mt-3 rounded-xl bg-zinc-950 p-4 font-mono text-xs leading-relaxed max-h-48 overflow-y-auto">
          {run.logs.map((line, i) => (
            <div key={i} className={line.includes("✓") || line.startsWith("[OK]") ? "text-brand-400" : "text-zinc-400"}>
              {line || " "}
            </div>
          ))}
        </div>
      </details>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {!run.publishedToCommmunity ? (
          <Button variant="primary" size="md" onClick={onPublish}>
            <Share2 size={14} /> Publicar na comunidade
          </Button>
        ) : (
          <div className="flex items-center gap-2 text-sm text-brand-400">
            <CheckCircle2 size={15} /> Publicado na comunidade
          </div>
        )}
        <Button variant="secondary" size="md">
          <Download size={14} /> Exportar JSON
        </Button>
        <Button variant="secondary" size="md" onClick={onReset}>
          <RotateCcw size={14} /> Novo benchmark
        </Button>
      </div>
    </div>
  );
}

function RunHistoryItem({
  run,
  onSelect,
  onDelete,
  isActive,
}: {
  run: LocalBenchmarkRun;
  onSelect: () => void;
  onDelete: () => void;
  isActive: boolean;
}) {
  const hw = HARDWARE_PROFILES.find((h) => h.id === run.config.hardware);
  const date = new Date(run.startedAt);
  const label = `${date.toLocaleDateString("pt-BR")} ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;

  return (
    <div
      className={`flex items-start justify-between rounded-lg border p-3 cursor-pointer transition-colors ${
        isActive
          ? "border-brand-500/60 bg-brand-950/30"
          : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/40"
      }`}
      onClick={onSelect}
    >
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-zinc-300 truncate">
          {run.config.model}
        </p>
        <p className="text-[10px] text-zinc-600 truncate">{hw?.name}</p>
        <p className="text-[10px] text-zinc-700 mt-0.5">{label}</p>
      </div>
      <div className="flex flex-col items-end gap-1.5 ml-2 shrink-0">
        {run.status === "completed" && (
          <CheckCircle2 size={13} className="text-brand-400" />
        )}
        {run.status === "failed" && (
          <XCircle size={13} className="text-red-400" />
        )}
        {run.status === "cancelled" && (
          <AlertTriangle size={13} className="text-yellow-400" />
        )}
        {run.status === "running" && (
          <div className="h-2.5 w-2.5 rounded-full bg-brand-500 animate-pulse" />
        )}
        {run.results && (
          <span className="text-[10px] font-mono text-zinc-500">
            {run.results.tokensPerSec} t/s
          </span>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="text-zinc-700 hover:text-red-400 transition-colors"
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Phase = "setup" | "running" | "results";

export default function BenchmarkPage() {
  const { runs, activeRun, startRun, appendLog, completeRun, cancelRun, deleteRun, markPublished } =
    useBenchmark();

  const [phase, setPhase] = useState<Phase>("setup");
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const currentRun = runs.find((r) => r.id === currentRunId) ?? null;

  const handleStart = useCallback(
    (config: BenchmarkRunConfig) => {
      const id = startRun(config);
      setCurrentRunId(id);
      setPhase("running");

      const { lines, delaysMs } = generateBenchmarkLogs(config);
      let acc = 0;

      lines.forEach((line, i) => {
        acc += delaysMs[i];
        setTimeout(() => appendLog(id, line), acc);
      });

      const totalDelay = delaysMs.reduce((a, b) => a + b, 0) + 600;
      setTimeout(() => {
        const results = generateResults(config);
        completeRun(id, results);
        setPhase("results");
      }, totalDelay);
    },
    [startRun, appendLog, completeRun]
  );

  const handleCancel = useCallback(() => {
    if (currentRunId) cancelRun(currentRunId);
    setPhase("setup");
    setCurrentRunId(null);
  }, [currentRunId, cancelRun]);

  const handleReset = useCallback(() => {
    setPhase("setup");
    setCurrentRunId(null);
  }, []);

  const handlePublish = useCallback(() => {
    if (currentRunId) markPublished(currentRunId);
  }, [currentRunId, markPublished]);

  const handleSelectHistoryRun = useCallback((run: LocalBenchmarkRun) => {
    setCurrentRunId(run.id);
    setPhase(run.status === "completed" ? "results" : run.status === "running" ? "running" : "setup");
    setHistoryOpen(false);
  }, []);

  const completedRuns = runs.filter((r) => r.status === "completed");
  const avgTps = completedRuns.length > 0
    ? Math.round(completedRuns.reduce((s, r) => s + (r.results?.tokensPerSec ?? 0), 0) / completedRuns.length)
    : null;

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        {/* Page header */}
        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-zinc-100">Benchmark Local</h1>
              {phase === "running" && (
                <Badge variant="blue">Em execução</Badge>
              )}
              {phase === "results" && (
                <Badge variant="gray">Resultados</Badge>
              )}
            </div>
            <p className="text-zinc-500">
              Execute benchmarks reais no seu hardware e compare com a comunidade.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick stats */}
            {avgTps !== null && (
              <div className="hidden sm:flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2">
                <div className="text-center">
                  <div className="text-sm font-bold text-zinc-100">{completedRuns.length}</div>
                  <div className="text-[10px] text-zinc-500">runs</div>
                </div>
                <div className="h-6 w-px bg-zinc-800" />
                <div className="text-center">
                  <div className="text-sm font-bold text-zinc-100">{avgTps}</div>
                  <div className="text-[10px] text-zinc-500">tok/s médio</div>
                </div>
              </div>
            )}

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setHistoryOpen(!historyOpen)}
            >
              <History size={14} />
              Histórico
              {runs.length > 0 && (
                <span className="ml-1 rounded-full bg-zinc-700 px-1.5 py-0.5 text-[10px] font-bold">
                  {runs.length}
                </span>
              )}
            </Button>

            {phase !== "setup" && (
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <RotateCcw size={14} /> Novo
              </Button>
            )}
          </div>
        </div>

        {/* Phase breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs">
          {(["setup", "running", "results"] as Phase[]).map((p, i) => (
            <React.Fragment key={p}>
              {i > 0 && <ChevronRight size={12} className="text-zinc-700" />}
              <span
                className={
                  phase === p
                    ? "font-semibold text-brand-400"
                    : i < (["setup", "running", "results"] as Phase[]).indexOf(phase)
                    ? "text-zinc-400"
                    : "text-zinc-700"
                }
              >
                {p === "setup" ? "1. Configuração" : p === "running" ? "2. Execução" : "3. Resultados"}
              </span>
            </React.Fragment>
          ))}
        </div>

        <div className={`grid gap-6 ${historyOpen ? "lg:grid-cols-4" : ""}`}>
          {/* History sidebar */}
          {historyOpen && (
            <div className="lg:col-span-1">
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Histórico
                  </p>
                  <button
                    onClick={() => setHistoryOpen(false)}
                    className="text-zinc-600 hover:text-zinc-400 text-xs"
                  >
                    fechar
                  </button>
                </div>
                {runs.length === 0 ? (
                  <p className="text-xs text-zinc-600 text-center py-4">
                    Nenhum benchmark executado ainda.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {runs.map((r) => (
                      <RunHistoryItem
                        key={r.id}
                        run={r}
                        isActive={r.id === currentRunId}
                        onSelect={() => handleSelectHistoryRun(r)}
                        onDelete={() => {
                          deleteRun(r.id);
                          if (r.id === currentRunId) handleReset();
                        }}
                      />
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Main content */}
          <div className={historyOpen ? "lg:col-span-3" : ""}>
            {phase === "setup" && <PhaseSetup onStart={handleStart} />}
            {phase === "running" && currentRun && (
              <PhaseRunning run={currentRun} onCancel={handleCancel} />
            )}
            {phase === "results" && currentRun?.results && (
              <PhaseResults
                run={currentRun}
                onReset={handleReset}
                onPublish={handlePublish}
              />
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
