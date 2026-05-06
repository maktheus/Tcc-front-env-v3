"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Play, Square, RotateCcw, Download, Share2, CheckCircle2,
  XCircle, Terminal, Cpu, Zap, Clock, Battery, Target,
  ChevronRight, Trash2, AlertTriangle, BarChart3, History,
  FlaskConical, Wifi, WifiOff, Copy, Check as CheckIcon,
  Smartphone, Monitor, BookOpen, Brain, Repeat2, AlignLeft,
  Star, Info,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, RadarChart, Radar,
  PolarGrid, PolarAngleAxis,
} from "recharts";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useBenchmark } from "@/lib/benchmarkContext";
import { HARDWARE_PROFILES } from "@/lib/data";
import type {
  BenchmarkRunConfig, BenchmarkRunResults, LocalBenchmarkRun,
  ExecutionMode, ModelOption, QualityMetrics,
} from "@/types";

// ─── Model catalog ────────────────────────────────────────────────────────────

const ALL_MODELS: ModelOption[] = [
  { id: "smollm-360m",  label: "SmolLM-360M",    size: "360M",  webgpuCompatible: true  },
  { id: "tinyllama",    label: "TinyLlama-1.1B",  size: "1.1B",  webgpuCompatible: true  },
  { id: "gemma-1b",     label: "Gemma-1.1B",      size: "1.1B",  webgpuCompatible: true  },
  { id: "gemma-2b",     label: "Gemma-2B",         size: "2B",    webgpuCompatible: true  },
  { id: "phi3-mini",    label: "Phi-3 Mini",       size: "3.8B",  webgpuCompatible: true  },
  { id: "llama3-8b",    label: "Llama-3-8B",       size: "8B",    webgpuCompatible: false },
  { id: "mistral-7b",   label: "Mistral-7B",       size: "7B",    webgpuCompatible: false },
  { id: "llama3-70b",   label: "Llama-3-70B",      size: "70B",   webgpuCompatible: false },
  { id: "yolov8n",      label: "YOLOv8n",          size: "3.2MB", webgpuCompatible: false },
  { id: "whisper-small",label: "Whisper-Small",    size: "244MB", webgpuCompatible: false },
];

const QUANTIZATIONS = ["FP32", "FP16", "INT8", "INT4 (Q4_K_M)", "INT4 (Q4_0)", "GGUF Q8_0"];
const AGENT_RUNTIMES = ["llama.cpp", "TensorRT-LLM", "ONNX Runtime", "TFLite", "STM32Cube.AI", "vLLM"];
const WEBGPU_RUNTIMES = ["WebLLM (MLC)", "Transformers.js", "MediaPipe LLM"];

const BENCHMARK_TYPES = [
  {
    id: "performance" as const,
    label: "Performance",
    icon: Zap,
    desc: "Tokens/s · latência p50/p95/p99",
    bothPaths: true,
  },
  {
    id: "energy" as const,
    label: "Energia",
    icon: Battery,
    desc: "Watts médios · Wh por inferência",
    bothPaths: false, // agent only
  },
  {
    id: "quality" as const,
    label: "Qualidade",
    icon: Brain,
    desc: "Perplexidade · MMLU · Consistência · Format",
    bothPaths: true,
  },
  {
    id: "full" as const,
    label: "Completo",
    icon: FlaskConical,
    desc: "Todos os testes disponíveis",
    bothPaths: true,
  },
] as const;

const AGENT_URL = "http://localhost:4242";

// ─── Hooks ────────────────────────────────────────────────────────────────────

type AgentStatus = "checking" | "online" | "offline";

interface AgentInfo {
  version: string;
  hardware: { id: string; name: string; chip: string; ram: string; tdp: string } | null;
  runtimes_available: string[];
}

function useExecutionMode() {
  const [mode, setMode] = useState<ExecutionMode>("agent");
  const [hasWebGPU, setHasWebGPU] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
    const gpu = "gpu" in navigator;
    setIsMobile(mobile);
    setHasWebGPU(gpu);
    if (mobile) setMode("webgpu");
  }, []);

  return { mode, setMode, hasWebGPU, isMobile };
}

function useAgentHealth() {
  const [status, setStatus] = useState<AgentStatus>("checking");
  const [info, setInfo] = useState<AgentInfo | null>(null);

  const check = useCallback(async () => {
    setStatus("checking");
    try {
      const res = await fetch(`${AGENT_URL}/health`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) { setInfo(await res.json()); setStatus("online"); }
      else setStatus("offline");
    } catch { setStatus("offline"); }
  }, []);

  useEffect(() => { check(); }, [check]);
  return { status, info, retry: check };
}

// ─── Simulation helpers ───────────────────────────────────────────────────────

function generateQualityMetrics(model: string, quantization: string): QualityMetrics {
  const isSmall = model.includes("360M") || model.includes("1.1B") || model.includes("1B");
  const isInt4 = quantization.includes("INT4") || quantization.includes("Q4");
  const qualityPenalty = isInt4 ? 1.08 : 1.02;

  return {
    perplexity: parseFloat(((isSmall ? 14 : 9) * qualityPenalty + Math.random() * 2).toFixed(2)),
    mmluScorePct: parseFloat(((isSmall ? 52 : 68) / qualityPenalty + Math.random() * 5).toFixed(1)),
    consistencyPct: parseFloat((92 - (isInt4 ? 4 : 1) + Math.random() * 5).toFixed(1)),
    formatFollowingPct: parseFloat((94 - (isInt4 ? 3 : 0) + Math.random() * 4).toFixed(1)),
    judgeCoherence: null,
    judgeFactuality: null,
    judgeOverall: null,
  };
}

function generateResults(config: BenchmarkRunConfig): BenchmarkRunResults {
  const hw = HARDWARE_PROFILES.find((h) => h.id === config.hardware);
  const isSmall = config.model.includes("1.1B") || config.model.includes("2B") || config.model.includes("3.8B") || config.model.includes("360M");
  const isMCU = hw?.category === "mcu";
  const isLarge = config.model.includes("70B");
  const isWebGPU = config.executionMode === "webgpu";

  const baseTps = isMCU ? 2 : isSmall ? 22 : isLarge ? 18 : 38;
  const tpsValues = Array.from({ length: config.iterations }, () =>
    Math.round(baseTps * (0.9 + Math.random() * 0.2))
  );
  const tokensPerSec = Math.round(tpsValues.reduce((a, b) => a + b, 0) / tpsValues.length);
  const latValues = tpsValues.map((t) => Math.round(1000 / t + Math.random() * 3)).sort((a, b) => a - b);
  const baseW = isMCU ? 0.24 : isSmall ? 4.8 : isLarge ? 58 : 9.2;

  return {
    tokensPerSec,
    tokensPerSecMin: Math.round(baseTps * 0.88),
    tokensPerSecMax: Math.round(baseTps * 1.12),
    tokensPerSecStdDev: parseFloat((baseTps * 0.07).toFixed(1)),
    latencyP50: latValues[Math.floor(latValues.length * 0.5)],
    latencyP95: latValues[Math.floor(latValues.length * 0.95)] ?? Math.round(1000 / baseTps * 1.2),
    latencyP99: latValues[latValues.length - 1] ?? Math.round(1000 / baseTps * 1.4),
    energyW: isWebGPU ? null : parseFloat((baseW * (0.9 + Math.random() * 0.2)).toFixed(2)),
    energyWh: isWebGPU ? null : parseFloat((baseW * (Math.round(1000 / baseTps) / 3_600_000)).toFixed(6)),
    quality: generateQualityMetrics(config.model, config.quantization),
    totalTokens: tokensPerSec * config.iterations * 5,
    totalDurationMs: config.iterations * Math.round(1000 / baseTps) + config.warmupRuns * Math.round(1000 / baseTps),
    timeSeriesTokensPerSec: tpsValues,
    timeSeriesLatency: latValues,
  };
}

function generateLogs(config: BenchmarkRunConfig): { lines: string[]; delaysMs: number[] } {
  const hwName = config.executionMode === "webgpu"
    ? "browser (WebGPU)"
    : HARDWARE_PROFILES.find((h) => h.id === config.hardware)?.name ?? config.hardware;
  const lines: string[] = [];
  const delaysMs: number[] = [];
  const add = (l: string, d: number) => { lines.push(l); delaysMs.push(d); };

  add(`[EdgeBench v0.1.0] Modo: ${config.executionMode.toUpperCase()} · ${hwName}`, 0);
  add(`[Config] ${config.model} | ${config.quantization} | ${config.runtime}`, 200);
  add("", 100);
  add("[FASE 1/4] Verificando ambiente...", 300);
  add(`  ✓ Runtime ${config.runtime} disponível`, 500);
  add(`  ✓ Modelo ${config.model} carregado`, 700);
  add("", 100);
  add("[FASE 2/4] Warmup runs...", 200);
  for (let i = 1; i <= config.warmupRuns; i++) add(`  Warmup ${i}/${config.warmupRuns} → ok`, 500);
  add("", 100);
  add("[FASE 3/4] Inferência...", 300);
  for (let i = 1; i <= Math.min(config.iterations, 8); i++) {
    const t = Math.round(22 + Math.random() * 20);
    add(`  Run ${i}/${config.iterations} → ${t} tok/s | ${Math.round(1000/t)}ms`, 700);
  }
  if (config.iterations > 8) add(`  ... (${config.iterations - 8} runs adicionais)`, 300);
  add("", 100);
  add("[FASE 4/4] Avaliação de qualidade...", 400);
  add("  Calculando perplexidade (WikiText-103 slice)...", 700);
  add("  Rodando MMLU subset (100 questões)...", 900);
  add("  Testando consistência (5 prompts idênticos)...", 700);
  add("  Testando format following...", 500);
  add("", 100);
  add("[OK] Benchmark completo.", 300);
  add("[Cloud] Resultados enviados — LLM-as-Judge enfileirado (~30s)", 300);
  return { lines, delaysMs };
}

// ─── Banners ──────────────────────────────────────────────────────────────────

const INSTALL_STEPS = [
  { os: "Linux / macOS", cmd: "curl -sSL https://get.edgebench.io | sh" },
  { os: "Windows (PowerShell)", cmd: "iwr https://get.edgebench.io/win | iex" },
  { os: "pip (Python ≥ 3.10)", cmd: "pip install edgebench-agent" },
];

function AgentBanner({ status, info, onRetry }: { status: AgentStatus; info: AgentInfo | null; onRetry: () => void }) {
  const [copied, setCopied] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const copy = (cmd: string) => { navigator.clipboard.writeText(cmd); setCopied(cmd); setTimeout(() => setCopied(null), 2000); };

  if (status === "checking") return (
    <div className="mb-5 flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
      <div className="h-2 w-2 rounded-full bg-zinc-600 animate-pulse" />
      <span className="text-sm text-zinc-500">Verificando agente local...</span>
    </div>
  );

  if (status === "online") return (
    <div className="mb-5 flex items-center justify-between flex-wrap gap-3 rounded-xl border border-brand-700/50 bg-brand-950/20 px-4 py-3">
      <div className="flex items-center gap-3">
        <Wifi size={15} className="text-brand-400" />
        <div>
          <span className="text-sm font-semibold text-brand-300">Agente online</span>
          {info?.hardware && (
            <span className="ml-2 text-xs text-zinc-500">
              {info.hardware.name} · {info.hardware.ram} · {info.hardware.tdp}
            </span>
          )}
        </div>
        <div className="hidden sm:flex gap-1.5">
          {info?.runtimes_available?.map((r) => (
            <span key={r} className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">{r}</span>
          ))}
        </div>
      </div>
      <span className="text-[10px] text-zinc-600">v{info?.version}</span>
    </div>
  );

  return (
    <div className="mb-5 rounded-xl border border-yellow-800/50 bg-yellow-950/20">
      <div className="flex items-start justify-between gap-3 px-4 py-3">
        <div className="flex items-start gap-3">
          <WifiOff size={15} className="text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-300">Agente local não detectado</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              Instale o <code className="font-mono text-zinc-400">edgebench-agent</code> e execute{" "}
              <code className="font-mono text-zinc-400">edgebench agent start</code>.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button onClick={onRetry} className="text-xs text-zinc-500 hover:text-zinc-300 underline underline-offset-2">Verificar</button>
          <button onClick={() => setExpanded(!expanded)} className="text-xs text-yellow-400 hover:text-yellow-300 font-semibold">
            {expanded ? "Fechar" : "Como instalar"}
          </button>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-yellow-900/40 px-4 py-4 space-y-3">
          <p className="text-xs font-semibold text-zinc-400 mb-2">1. Instale o agente</p>
          {INSTALL_STEPS.map((s) => (
            <div key={s.os}>
              <p className="text-[10px] text-zinc-600 mb-1">{s.os}</p>
              <div className="flex items-center gap-2 rounded-lg bg-zinc-950 px-3 py-2">
                <code className="flex-1 font-mono text-xs text-zinc-300">{s.cmd}</code>
                <button onClick={() => copy(s.cmd)} className="text-zinc-600 hover:text-zinc-300 shrink-0">
                  {copied === s.cmd ? <CheckIcon size={13} className="text-brand-400" /> : <Copy size={13} />}
                </button>
              </div>
            </div>
          ))}
          <p className="text-xs font-semibold text-zinc-400 mt-4 mb-2">2. Autentique e inicie</p>
          {["edgebench auth login", "edgebench agent start"].map((cmd) => (
            <div key={cmd} className="flex items-center gap-2 rounded-lg bg-zinc-950 px-3 py-2">
              <code className="flex-1 font-mono text-xs text-zinc-300">{cmd}</code>
              <button onClick={() => copy(cmd)} className="text-zinc-600 hover:text-zinc-300 shrink-0">
                {copied === cmd ? <CheckIcon size={13} className="text-brand-400" /> : <Copy size={13} />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WebGPUBanner({ hasWebGPU }: { hasWebGPU: boolean }) {
  if (!hasWebGPU) return (
    <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-800/50 bg-red-950/20 px-4 py-3">
      <AlertTriangle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-red-300">WebGPU não disponível neste browser</p>
        <p className="text-xs text-zinc-500 mt-0.5">
          Use Chrome 113+ ou Safari iOS 17+. Firefox ainda não suporta WebGPU por padrão.
        </p>
      </div>
    </div>
  );

  return (
    <div className="mb-5 flex items-center justify-between flex-wrap gap-3 rounded-xl border border-purple-700/50 bg-purple-950/20 px-4 py-3">
      <div className="flex items-center gap-3">
        <Smartphone size={15} className="text-purple-400" />
        <div>
          <span className="text-sm font-semibold text-purple-300">WebGPU ativo</span>
          <span className="ml-2 text-xs text-zinc-500">Inferência no browser · GPU/NPU local</span>
        </div>
        <Badge variant="purple" className="text-[10px] hidden sm:flex">zero instalação</Badge>
      </div>
      <span className="text-[10px] text-zinc-600">via WebLLM / MLC LLM</span>
    </div>
  );
}

// ─── Phase Setup ─────────────────────────────────────────────────────────────

function PhaseSetup({
  onStart,
  mode,
  agentStatus,
  hasWebGPU,
}: {
  onStart: (cfg: BenchmarkRunConfig) => void;
  mode: ExecutionMode;
  agentStatus: AgentStatus;
  hasWebGPU: boolean;
}) {
  const isWebGPU = mode === "webgpu";
  const availableModels = isWebGPU ? ALL_MODELS.filter((m) => m.webgpuCompatible) : ALL_MODELS;
  const availableRuntimes = isWebGPU ? WEBGPU_RUNTIMES : AGENT_RUNTIMES;
  const availableTypes = isWebGPU
    ? BENCHMARK_TYPES.filter((t) => t.bothPaths)
    : BENCHMARK_TYPES;

  const [model, setModel] = useState("");
  const [hardware, setHardware] = useState(isWebGPU ? "m2-macbook" : "");
  const [benchmarkType, setBenchmarkType] = useState<BenchmarkRunConfig["benchmarkType"]>("full");
  const [iterations, setIterations] = useState(10);
  const [warmupRuns, setWarmupRuns] = useState(3);
  const [quantization, setQuantization] = useState("INT4 (Q4_K_M)");
  const [runtime, setRuntime] = useState(availableRuntimes[0]);

  const hw = HARDWARE_PROFILES.find((h) => h.id === hardware);
  const agentReady = mode === "agent" ? agentStatus === "online" : true;
  const webgpuReady = mode === "webgpu" ? hasWebGPU : true;
  const canRun = model && (isWebGPU || hardware) && agentReady && webgpuReady;

  const handleStart = () => {
    if (!canRun) return;
    onStart({
      executionMode: mode,
      model,
      hardware: isWebGPU ? "browser-webgpu" : hardware,
      benchmarkType,
      iterations,
      warmupRuns,
      quantization,
      runtime,
      threads: 4,
      gpuLayers: isWebGPU ? 0 : 32,
      promptTemplate: "Explique o conceito de edge computing em 3 frases.",
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-5">
        <Card>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Modelo</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block">
                Modelo *
                {isWebGPU && (
                  <span className="ml-2 text-[10px] text-purple-400">somente compatíveis WebGPU</span>
                )}
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none"
              >
                <option value="">Selecionar modelo...</option>
                {availableModels.map((m) => (
                  <option key={m.id} value={m.label}>{m.label} ({m.size})</option>
                ))}
              </select>
              {isWebGPU && (
                <p className="mt-1.5 text-[10px] text-zinc-600 flex items-center gap-1">
                  <Info size={9} /> Modelos maiores disponíveis via agente desktop
                </p>
              )}
            </div>

            {!isWebGPU && (
              <div>
                <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Hardware alvo *</label>
                <select
                  value={hardware}
                  onChange={(e) => setHardware(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none"
                >
                  <option value="">Selecionar hardware...</option>
                  {HARDWARE_PROFILES.map((h) => (
                    <option key={h.id} value={h.id}>{h.name} ({h.ram} · {h.tdp})</option>
                  ))}
                </select>
              </div>
            )}

            {isWebGPU && (
              <div className="rounded-lg border border-purple-800/40 bg-purple-950/20 p-3 flex flex-col gap-1">
                <p className="text-xs font-semibold text-purple-300">Hardware detectado</p>
                <p className="text-xs text-zinc-400">GPU/NPU do seu device via WebGPU API</p>
                <p className="text-[10px] text-zinc-600 mt-1">
                  Sem acesso a sensores de energia — watts não serão medidos
                </p>
              </div>
            )}
          </div>
          {hw && !isWebGPU && (
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="gray">{hw.chip}</Badge>
              <Badge variant="gray">RAM: {hw.ram}</Badge>
              <Badge variant="gray">TDP: {hw.tdp}</Badge>
            </div>
          )}
        </Card>

        {/* Benchmark types */}
        <Card>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Tipo de Benchmark</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {availableTypes.map((bt) => (
              <button
                key={bt.id}
                onClick={() => setBenchmarkType(bt.id)}
                className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-colors ${
                  benchmarkType === bt.id
                    ? "border-brand-500 bg-brand-500/10"
                    : "border-zinc-700 bg-zinc-800/40 hover:border-zinc-600"
                }`}
              >
                <bt.icon size={17} className={benchmarkType === bt.id ? "text-brand-400 mt-0.5" : "text-zinc-500 mt-0.5"} />
                <div>
                  <p className={`text-sm font-semibold ${benchmarkType === bt.id ? "text-brand-300" : "text-zinc-300"}`}>
                    {bt.label}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">{bt.desc}</p>
                  {bt.id === "energy" && isWebGPU && (
                    <p className="text-[10px] text-zinc-600 mt-0.5">não disponível no browser</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Execution params */}
        <Card>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Parâmetros</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Iterações</label>
              <input type="number" min={5} max={100} value={iterations}
                onChange={(e) => setIterations(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Warmup runs</label>
              <input type="number" min={1} max={10} value={warmupRuns}
                onChange={(e) => setWarmupRuns(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Quantização</label>
              <select value={quantization} onChange={(e) => setQuantization(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none">
                {QUANTIZATIONS.map((q) => <option key={q}>{q}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Runtime</label>
              <select value={runtime} onChange={(e) => setRuntime(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none">
                {availableRuntimes.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
        </Card>
      </div>

      {/* Summary sidebar */}
      <div className="space-y-4">
        <Card>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Resumo</p>
          <div className="space-y-2.5 text-sm">
            {[
              { label: "Modo", value: isWebGPU ? "WebGPU (browser)" : "Local Agent" },
              { label: "Modelo", value: model || "—" },
              { label: "Hardware", value: isWebGPU ? "GPU/NPU do device" : hw?.name || "—" },
              { label: "Tipo", value: availableTypes.find((b) => b.id === benchmarkType)?.label ?? "—" },
              { label: "Iterações", value: `${iterations} + ${warmupRuns} warmup` },
              { label: "Quantização", value: quantization },
            ].map((item) => (
              <div key={item.label} className="flex justify-between gap-2">
                <span className="text-zinc-500">{item.label}</span>
                <span className="text-zinc-300 font-medium text-right truncate max-w-[140px]">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-zinc-800">
            <p className="text-xs text-zinc-600 mb-3">
              Tempo estimado: ~{Math.round(((iterations + warmupRuns) * 1.5 + 20) / 60)} min
              {isWebGPU && " (inclui carregamento do modelo)"}
            </p>
            <Button variant="primary" size="lg" className="w-full" onClick={handleStart} disabled={!canRun}>
              <Play size={14} /> Iniciar Benchmark <ChevronRight size={13} />
            </Button>
            {!agentReady && mode === "agent" && (
              <p className="text-xs text-yellow-600 mt-2 text-center">Agente local necessário</p>
            )}
            {!webgpuReady && mode === "webgpu" && (
              <p className="text-xs text-red-500 mt-2 text-center">WebGPU não disponível</p>
            )}
            {canRun === false && agentReady && webgpuReady && (
              <p className="text-xs text-zinc-600 mt-2 text-center">Selecione modelo{!isWebGPU ? " e hardware" : ""}</p>
            )}
          </div>
        </Card>

        <Card>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">O que será medido</p>
          <ul className="space-y-1.5 text-xs text-zinc-400">
            <li className="flex items-center gap-2"><Zap size={11} className="text-brand-400" /> Tokens/s (média, min, max, σ)</li>
            <li className="flex items-center gap-2"><Clock size={11} className="text-blue-400" /> Latência p50, p95, p99</li>
            {!isWebGPU && (
              <li className="flex items-center gap-2"><Battery size={11} className="text-yellow-400" /> Consumo médio (W) e por inferência (Wh)</li>
            )}
            <li className="flex items-center gap-2"><BookOpen size={11} className="text-purple-400" /> Perplexidade (WikiText-103)</li>
            <li className="flex items-center gap-2"><Brain size={11} className="text-indigo-400" /> MMLU subset (100 questões)</li>
            <li className="flex items-center gap-2"><Repeat2 size={11} className="text-teal-400" /> Consistência (5× mesmo prompt)</li>
            <li className="flex items-center gap-2"><AlignLeft size={11} className="text-orange-400" /> Format following</li>
            <li className="flex items-center gap-2"><Star size={11} className="text-zinc-500" /> LLM-as-Judge (cloud, ~30s)</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

// ─── Phase Running ────────────────────────────────────────────────────────────

function PhaseRunning({ run, onCancel }: { run: LocalBenchmarkRun; onCancel: () => void }) {
  const logEndRef = useRef<HTMLDivElement>(null);
  const totalExpected = run.config.iterations + run.config.warmupRuns + 18;
  const progress = Math.min((run.logs.length / totalExpected) * 100, 95);
  const hwLabel = run.config.executionMode === "webgpu"
    ? "browser (WebGPU)"
    : HARDWARE_PROFILES.find((h) => h.id === run.config.hardware)?.name ?? run.config.hardware;

  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [run.logs]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-2.5 rounded-full bg-brand-500 animate-pulse" />
          <span className="text-sm font-semibold text-zinc-200">
            Executando em {hwLabel}...
          </span>
          <Badge variant={run.config.executionMode === "webgpu" ? "purple" : "blue"}>
            {run.config.executionMode === "webgpu" ? "WebGPU" : "Agent"}
          </Badge>
        </div>
        <Button variant="danger" size="sm" onClick={onCancel}>
          <Square size={13} /> Cancelar
        </Button>
      </div>

      <div>
        <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
          <span>Progresso</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
          <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Runs", value: Math.max(0, run.logs.filter((l) => l.includes("Run ")).length) },
          { label: "Iterações alvo", value: run.config.iterations },
          { label: "Fase", value: run.logs.some((l) => l.includes("qualidade")) ? "Qualidade" : run.logs.some((l) => l.includes("Inferência")) ? "Inferência" : "Setup" },
          { label: "Tempo", value: `${Math.round((Date.now() - new Date(run.startedAt).getTime()) / 1000)}s` },
        ].map((m) => (
          <Card key={m.label} className="text-center py-3">
            <div className="text-lg font-bold text-zinc-100">{m.value}</div>
            <div className="text-xs text-zinc-500 mt-0.5">{m.label}</div>
          </Card>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border-b border-zinc-800">
          <Terminal size={13} className="text-zinc-400" />
          <span className="text-xs font-mono text-zinc-400">edgebench — {run.config.executionMode}</span>
          <div className="ml-auto flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
          </div>
        </div>
        <div className="h-64 overflow-y-auto bg-zinc-950 p-4 font-mono text-xs leading-relaxed">
          {run.logs.map((line, i) => (
            <div key={i} className={
              line.startsWith("[ERRO]") ? "text-red-400" :
              line.startsWith("[OK]") || line.includes("✓") ? "text-brand-400" :
              line.startsWith("[FASE") ? "text-blue-300 font-semibold" :
              line.startsWith("[Cloud]") ? "text-purple-400" :
              "text-zinc-300"
            }>
              {line || " "}
            </div>
          ))}
          <div ref={logEndRef} />
          <span className="inline-block h-4 w-2 bg-zinc-300 animate-pulse" />
        </div>
      </Card>
    </div>
  );
}

// ─── Quality panel ────────────────────────────────────────────────────────────

function QualityPanel({ q }: { q: QualityMetrics }) {
  const radarData = [
    { metric: "MMLU", value: q.mmluScorePct },
    { metric: "Consistência", value: q.consistencyPct },
    { metric: "Format", value: q.formatFollowingPct },
    { metric: "Fluência", value: Math.max(0, 100 - (q.perplexity - 5) * 3) },
  ];

  const judgeReady = q.judgeCoherence !== null;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-zinc-300">Qualidade do Output</p>
        <Badge variant={judgeReady ? "blue" : "gray"} className="text-[10px]">
          {judgeReady ? "LLM-as-Judge: pronto" : "LLM-as-Judge: aguardando (~30s)"}
        </Badge>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {/* Metrics list */}
        <div className="space-y-3">
          {[
            {
              icon: BookOpen, color: "text-purple-400",
              label: "Perplexidade", sub: "WikiText-103 · lower is better",
              value: `${q.perplexity}`, good: q.perplexity < 12,
            },
            {
              icon: Brain, color: "text-indigo-400",
              label: "MMLU Score", sub: "100 questões múltipla escolha",
              value: `${q.mmluScorePct}%`, good: q.mmluScorePct >= 60,
            },
            {
              icon: Repeat2, color: "text-teal-400",
              label: "Consistência", sub: "5× mesmo prompt",
              value: `${q.consistencyPct}%`, good: q.consistencyPct >= 88,
            },
            {
              icon: AlignLeft, color: "text-orange-400",
              label: "Format Following", sub: "instrução de formato",
              value: `${q.formatFollowingPct}%`, good: q.formatFollowingPct >= 90,
            },
          ].map((m) => (
            <div key={m.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <m.icon size={13} className={m.color} />
                <div>
                  <p className="text-xs font-medium text-zinc-300">{m.label}</p>
                  <p className="text-[10px] text-zinc-600">{m.sub}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-zinc-100">{m.value}</span>
                <span className={`text-[10px] ${m.good ? "text-brand-400" : "text-yellow-500"}`}>
                  {m.good ? "✓" : "↓"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Radar chart */}
        <div>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#27272a" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: "#71717a", fontSize: 10 }} />
              <Radar dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Judge scores */}
      {judgeReady ? (
        <div className="mt-4 pt-4 border-t border-zinc-800 grid grid-cols-3 gap-3">
          {[
            { label: "Coerência", value: q.judgeCoherence },
            { label: "Factualidade", value: q.judgeFactuality },
            { label: "Geral", value: q.judgeOverall },
          ].map((s) => (
            <div key={s.label} className="rounded-lg bg-purple-950/30 border border-purple-800/40 p-3 text-center">
              <div className="text-xl font-bold text-purple-300">{s.value}/10</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">{s.label}</div>
              <div className="text-[9px] text-purple-700 mt-0.5">LLM-as-Judge</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center gap-3 text-xs text-zinc-600">
          <div className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
          Scores do LLM-as-Judge serão exibidos aqui quando o cloud processar os outputs (~30s)
        </div>
      )}
    </Card>
  );
}

// ─── Phase Results ────────────────────────────────────────────────────────────

function exportRunAsJson(run: LocalBenchmarkRun, hw: ReturnType<typeof HARDWARE_PROFILES.find>) {
  const r = run.results!;
  const payload = {
    schema_version: "1.0.0",
    exported_at: new Date().toISOString(),
    tool: "EdgeBench v0.1.0",
    run: {
      id: run.id,
      execution_mode: run.config.executionMode,
      status: run.status,
      started_at: run.startedAt,
      completed_at: run.completedAt ?? null,
      duration_ms: run.completedAt
        ? new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime()
        : null,
      published_to_community: run.publishedToCommmunity ?? false,
    },
    config: {
      model: run.config.model,
      hardware: run.config.executionMode === "webgpu"
        ? { id: "browser-webgpu", name: "Browser (WebGPU)", chip: "GPU/NPU local", ram: null, tdp: null, category: "webgpu" }
        : { id: run.config.hardware, name: hw?.name ?? run.config.hardware, chip: hw?.chip ?? null, ram: hw?.ram ?? null, tdp: hw?.tdp ?? null, category: hw?.category ?? null },
      benchmark_type: run.config.benchmarkType,
      iterations: run.config.iterations,
      warmup_runs: run.config.warmupRuns,
      quantization: run.config.quantization,
      runtime: run.config.runtime,
      threads: run.config.executionMode === "agent" ? run.config.threads : null,
      gpu_layers: run.config.executionMode === "agent" ? run.config.gpuLayers : null,
    },
    results: {
      performance: {
        tokens_per_sec: { mean: r.tokensPerSec, min: r.tokensPerSecMin, max: r.tokensPerSecMax, std_dev: r.tokensPerSecStdDev },
        latency_ms: { p50: r.latencyP50, p95: r.latencyP95, p99: r.latencyP99 },
      },
      energy: r.energyW !== null
        ? { avg_watts: r.energyW, wh_per_inference: r.energyWh }
        : null,
      quality: {
        perplexity: r.quality.perplexity,
        mmlu_score_pct: r.quality.mmluScorePct,
        consistency_pct: r.quality.consistencyPct,
        format_following_pct: r.quality.formatFollowingPct,
        llm_as_judge: {
          coherence: r.quality.judgeCoherence,
          factuality: r.quality.judgeFactuality,
          overall: r.quality.judgeOverall,
        },
      },
      totals: { tokens_generated: r.totalTokens, duration_ms: r.totalDurationMs },
      time_series: { tokens_per_sec: r.timeSeriesTokensPerSec, latency_ms: r.timeSeriesLatency },
    },
    logs: run.logs,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `edgebench_${run.config.model.replace(/\s+/g, "-").toLowerCase()}_${run.config.executionMode}_${run.id}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function PhaseResults({ run, onReset, onPublish }: { run: LocalBenchmarkRun; onReset: () => void; onPublish: () => void }) {
  const r = run.results!;
  const hw = HARDWARE_PROFILES.find((h) => h.id === run.config.hardware);
  const isWebGPU = run.config.executionMode === "webgpu";
  const durationSec = run.completedAt
    ? Math.round((new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime()) / 1000)
    : 0;
  const tpsData = r.timeSeriesTokensPerSec.map((v, i) => ({ run: i + 1, tps: v }));
  const latData = r.timeSeriesLatency.map((v, i) => ({ run: i + 1, latency: v }));

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Banner */}
      <div className="rounded-xl border border-brand-700/60 bg-brand-950/30 p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={24} className="text-brand-400" />
            <div>
              <p className="text-lg font-bold text-brand-300">Benchmark concluído</p>
              <p className="text-xs text-zinc-500">
                {run.config.model} · {isWebGPU ? "WebGPU" : hw?.name} · {durationSec}s · {run.config.iterations} iterações
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={isWebGPU ? "purple" : "blue"}>{isWebGPU ? "WebGPU" : "Agent"}</Badge>
            <Badge variant="gray">{run.config.quantization}</Badge>
            <Badge variant="gray">{run.config.runtime}</Badge>
          </div>
        </div>
      </div>

      {/* Performance metrics */}
      <div>
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Performance</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Tokens/s", value: r.tokensPerSec, sub: `σ ${r.tokensPerSecStdDev}`, icon: Zap, color: "text-brand-400" },
            { label: "Latência p50", value: `${r.latencyP50}ms`, sub: `p95: ${r.latencyP95}ms`, icon: Clock, color: "text-blue-400" },
            r.energyW !== null
              ? { label: "Consumo", value: `${r.energyW}W`, sub: `${((r.energyWh ?? 0) * 1000).toFixed(3)} mWh/inf`, icon: Battery, color: "text-yellow-400" }
              : { label: "Consumo", value: "N/A", sub: "sem sensor (WebGPU)", icon: Battery, color: "text-zinc-600" },
            { label: "p99 latência", value: `${r.latencyP99}ms`, sub: `min ${r.tokensPerSecMin} · max ${r.tokensPerSecMax} t/s`, icon: BarChart3, color: "text-purple-400" },
          ].map((m) => (
            <Card key={m.label} className="flex flex-col gap-1">
              <m.icon size={15} className={m.color} />
              <div className="text-xl font-extrabold text-zinc-100">{m.value}</div>
              <div className="text-xs text-zinc-500">{m.label}</div>
              <div className="text-[10px] text-zinc-600">{m.sub}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <p className="text-sm font-semibold text-zinc-300 mb-4">Tokens/s por run</p>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={tpsData}>
              <defs>
                <linearGradient id="tpsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="run" tick={{ fill: "#71717a", fontSize: 10 }} />
              <YAxis tick={{ fill: "#71717a", fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }} itemStyle={{ color: "#22d3ee" }} />
              <Area type="monotone" dataKey="tps" stroke="#22d3ee" fill="url(#tpsGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-zinc-300 mb-4">Latência (ms)</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={latData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="run" tick={{ fill: "#71717a", fontSize: 10 }} />
              <YAxis tick={{ fill: "#71717a", fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }} itemStyle={{ color: "#60a5fa" }} />
              <Line type="monotone" dataKey="latency" stroke="#60a5fa" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Quality panel */}
      <QualityPanel q={r.quality} />

      {/* Log */}
      <details className="group">
        <summary className="cursor-pointer list-none flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300">
          <Terminal size={13} />
          Ver log completo
          <ChevronRight size={13} className="transition-transform group-open:rotate-90" />
        </summary>
        <div className="mt-3 rounded-xl bg-zinc-950 p-4 font-mono text-xs leading-relaxed max-h-48 overflow-y-auto">
          {run.logs.map((line, i) => (
            <div key={i} className={line.includes("✓") || line.startsWith("[OK]") ? "text-brand-400" : "text-zinc-400"}>{line || " "}</div>
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
            <CheckCircle2 size={15} /> Publicado
          </div>
        )}
        <Button variant="secondary" size="md" onClick={() => exportRunAsJson(run, hw)}>
          <Download size={14} /> Exportar JSON
        </Button>
        <Button variant="secondary" size="md" onClick={onReset}>
          <RotateCcw size={14} /> Novo benchmark
        </Button>
      </div>
    </div>
  );
}

// ─── History item ─────────────────────────────────────────────────────────────

function RunHistoryItem({ run, onSelect, onDelete, isActive }: {
  run: LocalBenchmarkRun; onSelect: () => void; onDelete: () => void; isActive: boolean;
}) {
  const hw = HARDWARE_PROFILES.find((h) => h.id === run.config.hardware);
  const date = new Date(run.startedAt);
  const label = `${date.toLocaleDateString("pt-BR")} ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;

  return (
    <div
      onClick={onSelect}
      className={`flex items-start justify-between rounded-lg border p-3 cursor-pointer transition-colors ${
        isActive ? "border-brand-500/60 bg-brand-950/30" : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/40"
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-zinc-300 truncate">{run.config.model}</p>
        <p className="text-[10px] text-zinc-600 truncate">
          {run.config.executionMode === "webgpu" ? "WebGPU" : hw?.name}
        </p>
        <p className="text-[10px] text-zinc-700 mt-0.5">{label}</p>
      </div>
      <div className="flex flex-col items-end gap-1.5 ml-2 shrink-0">
        {run.status === "completed" && <CheckCircle2 size={13} className="text-brand-400" />}
        {run.status === "failed" && <XCircle size={13} className="text-red-400" />}
        {run.status === "cancelled" && <AlertTriangle size={13} className="text-yellow-400" />}
        {run.status === "running" && <div className="h-2.5 w-2.5 rounded-full bg-brand-500 animate-pulse" />}
        {run.results && <span className="text-[10px] font-mono text-zinc-500">{run.results.tokensPerSec} t/s</span>}
        {run.config.executionMode === "webgpu" && (
          <Smartphone size={9} className="text-purple-500" />
        )}
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-zinc-700 hover:text-red-400">
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Phase = "setup" | "running" | "results";

export default function BenchmarkPage() {
  const { runs, startRun, appendLog, completeRun, cancelRun, deleteRun, markPublished } = useBenchmark();
  const { mode, setMode, hasWebGPU, isMobile } = useExecutionMode();
  const { status: agentStatus, info: agentInfo, retry: retryAgent } = useAgentHealth();

  const [phase, setPhase] = useState<Phase>("setup");
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const currentRun = runs.find((r) => r.id === currentRunId) ?? null;

  const handleStart = useCallback((config: BenchmarkRunConfig) => {
    const id = startRun(config);
    setCurrentRunId(id);
    setPhase("running");
    const { lines, delaysMs } = generateLogs(config);
    let acc = 0;
    lines.forEach((line, i) => { acc += delaysMs[i]; setTimeout(() => appendLog(id, line), acc); });
    const total = delaysMs.reduce((a, b) => a + b, 0) + 600;
    setTimeout(() => { completeRun(id, generateResults(config)); setPhase("results"); }, total);
  }, [startRun, appendLog, completeRun]);

  const handleCancel = useCallback(() => {
    if (currentRunId) cancelRun(currentRunId);
    setPhase("setup"); setCurrentRunId(null);
  }, [currentRunId, cancelRun]);

  const handleReset = useCallback(() => { setPhase("setup"); setCurrentRunId(null); }, []);
  const handlePublish = useCallback(() => { if (currentRunId) markPublished(currentRunId); }, [currentRunId, markPublished]);
  const handleSelectHistory = useCallback((run: LocalBenchmarkRun) => {
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

        {/* Header */}
        <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-zinc-100">Benchmark Local</h1>
              {phase === "running" && <Badge variant="blue">Em execução</Badge>}
              {phase === "results" && <Badge variant="gray">Resultados</Badge>}
            </div>
            <p className="text-zinc-500">Execute benchmarks reais — performance + qualidade do output.</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Mode toggle */}
            {!isMobile && (
              <div className="flex rounded-lg border border-zinc-700 overflow-hidden text-xs">
                <button
                  onClick={() => setMode("agent")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${mode === "agent" ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
                >
                  <Monitor size={12} /> Desktop
                </button>
                <button
                  onClick={() => setMode("webgpu")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${mode === "webgpu" ? "bg-purple-800/60 text-purple-200" : "text-zinc-500 hover:text-zinc-300"}`}
                >
                  <Smartphone size={12} /> WebGPU
                </button>
              </div>
            )}

            {avgTps !== null && (
              <div className="hidden sm:flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-center">
                <div><div className="text-sm font-bold text-zinc-100">{completedRuns.length}</div><div className="text-[10px] text-zinc-500">runs</div></div>
                <div className="h-5 w-px bg-zinc-800" />
                <div><div className="text-sm font-bold text-zinc-100">{avgTps}</div><div className="text-[10px] text-zinc-500">tok/s médio</div></div>
              </div>
            )}

            <Button variant="secondary" size="sm" onClick={() => setHistoryOpen(!historyOpen)}>
              <History size={14} /> Histórico
              {runs.length > 0 && (
                <span className="ml-1 rounded-full bg-zinc-700 px-1.5 py-0.5 text-[10px] font-bold">{runs.length}</span>
              )}
            </Button>

            {phase !== "setup" && (
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <RotateCcw size={14} /> Novo
              </Button>
            )}
          </div>
        </div>

        {/* Execution mode banner */}
        {mode === "agent"
          ? <AgentBanner status={agentStatus} info={agentInfo} onRetry={retryAgent} />
          : <WebGPUBanner hasWebGPU={hasWebGPU} />
        }

        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs">
          {(["setup", "running", "results"] as Phase[]).map((p, i) => (
            <React.Fragment key={p}>
              {i > 0 && <ChevronRight size={12} className="text-zinc-700" />}
              <span className={
                phase === p ? "font-semibold text-brand-400" :
                i < (["setup", "running", "results"] as Phase[]).indexOf(phase) ? "text-zinc-400" :
                "text-zinc-700"
              }>
                {p === "setup" ? "1. Configuração" : p === "running" ? "2. Execução" : "3. Resultados"}
              </span>
            </React.Fragment>
          ))}
        </div>

        <div className={`grid gap-6 ${historyOpen ? "lg:grid-cols-4" : ""}`}>
          {historyOpen && (
            <div className="lg:col-span-1">
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Histórico</p>
                  <button onClick={() => setHistoryOpen(false)} className="text-zinc-600 hover:text-zinc-400 text-xs">fechar</button>
                </div>
                {runs.length === 0 ? (
                  <p className="text-xs text-zinc-600 text-center py-4">Nenhum benchmark ainda.</p>
                ) : (
                  <div className="space-y-2">
                    {runs.map((r) => (
                      <RunHistoryItem
                        key={r.id} run={r} isActive={r.id === currentRunId}
                        onSelect={() => handleSelectHistory(r)}
                        onDelete={() => { deleteRun(r.id); if (r.id === currentRunId) handleReset(); }}
                      />
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}

          <div className={historyOpen ? "lg:col-span-3" : ""}>
            {phase === "setup" && (
              <PhaseSetup onStart={handleStart} mode={mode} agentStatus={agentStatus} hasWebGPU={hasWebGPU} />
            )}
            {phase === "running" && currentRun && (
              <PhaseRunning run={currentRun} onCancel={handleCancel} />
            )}
            {phase === "results" && currentRun?.results && (
              <PhaseResults run={currentRun} onReset={handleReset} onPublish={handlePublish} />
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
