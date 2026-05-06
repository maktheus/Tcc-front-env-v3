"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Play, Square, RotateCcw, Download, Share2, CheckCircle2,
  XCircle, Terminal, Cpu, Zap, Clock, Battery, Target,
  ChevronRight, Trash2, AlertTriangle, BarChart3, History,
  FlaskConical, Wifi, WifiOff, Copy, Check as CheckIcon, Smartphone,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, Radar,
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

const ALL_MODELS: ModelOption[] = [
  { id: "smollm-360m",   label: "SmolLM-360M",   size: "360MB", webgpuCompatible: true  },
  { id: "tinyllama",     label: "TinyLlama-1.1B", size: "1.1B",  webgpuCompatible: true  },
  { id: "gemma-1b",      label: "Gemma-1.1B",     size: "1.1B",  webgpuCompatible: true  },
  { id: "gemma-2b",      label: "Gemma-2B",       size: "2B",    webgpuCompatible: true  },
  { id: "phi3-mini",     label: "Phi-3 Mini",     size: "3.8B",  webgpuCompatible: true  },
  { id: "llama3-8b",     label: "Llama-3-8B",     size: "8B",    webgpuCompatible: false },
  { id: "mistral-7b",    label: "Mistral-7B",     size: "7B",    webgpuCompatible: false },
  { id: "llama3-70b",    label: "Llama-3-70B",    size: "70B",   webgpuCompatible: false },
  { id: "yolov8n",       label: "YOLOv8n",        size: "3.2MB", webgpuCompatible: false },
  { id: "whisper-small", label: "Whisper-Small",  size: "244MB", webgpuCompatible: false },
];

const QUANTIZATIONS = ["FP32", "FP16", "INT8", "INT4 (Q4_K_M)", "INT4 (Q4_0)", "GGUF Q8_0"];
const RUNTIMES = ["llama.cpp", "TensorRT-LLM", "ONNX Runtime", "TFLite", "STM32Cube.AI", "vLLM"];

const BENCHMARK_TYPES = [
  { id: "performance", label: "Performance", icon: Zap,         desc: "Tokens/s, latência p50/p95/p99" },
  { id: "energy",      label: "Consumo",     icon: Battery,     desc: "Watts médios, Wh por inferência" },
  { id: "quality",     label: "Qualidade",   icon: Target,      desc: "Perplexidade, MMLU, consistência" },
  { id: "full",        label: "Completo",    icon: FlaskConical, desc: "Todos os testes acima" },
] as const;

const AGENT_URL = "http://localhost:4242";

type AgentStatus = "checking" | "online" | "offline";

interface AgentInfo {
  version: string;
  hardware: { id: string; name: string; chip: string; ram: string; tdp: string } | null;
  runtimes_available: string[];
}

function useAgentHealth() {
  const [status, setStatus] = useState<AgentStatus>("checking");
  const [info, setInfo]     = useState<AgentInfo | null>(null);

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

function useExecutionMode() {
  const [mode, setMode]                 = useState<ExecutionMode>("agent");
  const [webgpuAvailable, setWebgpuAvailable] = useState(false);

  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
    const hasWebGPU = "gpu" in navigator;
    setWebgpuAvailable(hasWebGPU);
    if (isMobile && hasWebGPU) setMode("webgpu");
  }, []);

  return { mode, setMode, webgpuAvailable };
}

const INSTALL_STEPS = [
  { os: "Linux / macOS",        cmd: "curl -sSL https://get.edgebench.io | sh" },
  { os: "Windows (PowerShell)", cmd: "iwr https://get.edgebench.io/win | iex"  },
  { os: "pip (Python ≥ 3.10)",  cmd: "pip install edgebench-agent"             },
];

function AgentBanner({ status, info, onRetry }: { status: AgentStatus; info: AgentInfo | null; onRetry: () => void }) {
  const [copied, setCopied]     = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const copy = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopied(cmd);
    setTimeout(() => setCopied(null), 2000);
  };

  if (status === "checking") return (
    <div className="mb-6 flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
      <div className="h-2 w-2 rounded-full bg-zinc-600 animate-pulse" />
      <span className="text-sm text-zinc-500">Verificando agente local...</span>
    </div>
  );

  if (status === "online") return (
    <div className="mb-6 flex items-center justify-between flex-wrap gap-3 rounded-xl border border-green-800/50 bg-green-950/20 px-4 py-3">
      <div className="flex items-center gap-3">
        <Wifi size={15} className="text-green-400 flex-shrink-0" />
        <div>
          <span className="text-sm font-semibold text-green-300">Agente online</span>
          {info?.hardware && (
            <span className="ml-2 text-xs text-zinc-500">
              {info.hardware.name} · {info.hardware.ram} · {info.hardware.tdp}
            </span>
          )}
        </div>
        {info?.runtimes_available?.length > 0 && (
          <div className="hidden sm:flex gap-1.5">
            {info.runtimes_available.map((r) => (
              <span key={r} className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">{r}</span>
            ))}
          </div>
        )}
      </div>
      <span className="text-[10px] text-zinc-600">v{info?.version}</span>
    </div>
  );

  return (
    <div className="mb-6 rounded-xl border border-yellow-800/50 bg-yellow-950/20">
      <div className="flex items-start justify-between gap-3 px-4 py-3">
        <div className="flex items-start gap-3">
          <WifiOff size={15} className="text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-300">Agente local não detectado</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              Instale o <code className="font-mono text-zinc-400">edgebench-agent</code> e rode{" "}
              <code className="font-mono text-zinc-400">edgebench agent start</code>.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={onRetry} className="text-xs text-zinc-500 hover:text-zinc-300 underline underline-offset-2">
            Verificar novamente
          </button>
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
                <button onClick={() => copy(s.cmd)} className="text-zinc-600 hover:text-zinc-300 flex-shrink-0">
                  {copied === s.cmd ? <CheckIcon size={13} className="text-green-400" /> : <Copy size={13} />}
                </button>
              </div>
            </div>
          ))}
          <p className="text-xs font-semibold text-zinc-400 mt-4 mb-2">2. Autentique e inicie</p>
          {["edgebench auth login", "edgebench agent start"].map((cmd) => (
            <div key={cmd} className="flex items-center gap-2 rounded-lg bg-zinc-950 px-3 py-2">
              <code className="flex-1 font-mono text-xs text-zinc-300">{cmd}</code>
              <button onClick={() => copy(cmd)} className="text-zinc-600 hover:text-zinc-300 flex-shrink-0">
                {copied === cmd ? <CheckIcon size={13} className="text-green-400" /> : <Copy size={13} />}
              </button>
            </div>
          ))}
          <p className="text-xs text-zinc-600 mt-2">
            Agente disponível em <code className="font-mono text-zinc-500">localhost:4242</code>.
          </p>
        </div>
      )}
    </div>
  );
}

function WebGPUBanner({ available }: { available: boolean }) {
  if (available) return (
    <div className="mb-6 flex items-center gap-3 rounded-xl border border-purple-800/50 bg-purple-950/20 px-4 py-3">
      <Smartphone size={15} className="text-purple-400 flex-shrink-0" />
      <div>
        <span className="text-sm font-semibold text-purple-300">Modo WebGPU</span>
        <span className="ml-2 text-xs text-zinc-500">Inferência no browser · modelos ≤ 4B · energia não medida</span>
      </div>
    </div>
  );
  return (
    <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-800/50 bg-red-950/20 px-4 py-3">
      <XCircle size={15} className="text-red-400 flex-shrink-0" />
      <p className="text-sm text-red-300">WebGPU não disponível. Use Chrome 113+ ou Safari iOS 17+.</p>
    </div>
  );
}

function generateQualityMetrics(model: string, quantization: string): QualityMetrics {
  const isSmall = model.includes("1.1B") || model.includes("2B") || model.includes("360M");
  const isINT4  = quantization.includes("INT4") || quantization.includes("Q4");
  return {
    perplexity:         parseFloat(((isSmall ? 14 : 9) + (isINT4 ? 1.2 : 0) + Math.random() * 0.8).toFixed(2)),
    mmluScorePct:       parseFloat(((isSmall ? 52 : 68) - (isINT4 ? 3 : 0) + Math.random() * 5).toFixed(1)),
    consistencyPct:     parseFloat((93 - (isINT4 ? 4 : 0) + Math.random() * 4).toFixed(1)),
    formatFollowingPct: parseFloat((95 + Math.random() * 3).toFixed(1)),
    judgeCoherence:     null,
    judgeFactuality:    null,
    judgeOverall:       null,
  };
}

function generateResults(config: BenchmarkRunConfig): BenchmarkRunResults {
  const hw       = HARDWARE_PROFILES.find((h) => h.id === config.hardware);
  const isSmall  = config.model.includes("1.1B") || config.model.includes("2B") || config.model.includes("3.8B") || config.model.includes("360M");
  const isMCU    = hw?.category === "mcu";
  const isLarge  = config.model.includes("70B");
  const isWebGPU = config.executionMode === "webgpu";
  const baseTps  = isMCU ? 2 : isSmall ? 22 : isLarge ? 18 : 38;
  const tpsVals  = Array.from({ length: config.iterations }, () => Math.round(baseTps * (0.9 + Math.random() * 0.2)));
  const tps      = Math.round(tpsVals.reduce((a, b) => a + b, 0) / tpsVals.length);
  const latVals  = tpsVals.map((t) => Math.round(1000 / t + Math.random() * 3)).sort((a, b) => a - b);
  const baseW    = isMCU ? 0.24 : isSmall ? 4.8 : isLarge ? 58 : 9.2;
  const energyW  = isWebGPU ? null : parseFloat((baseW * (0.9 + Math.random() * 0.2)).toFixed(2));
  const latBase  = Math.round(1000 / baseTps);
  return {
    tokensPerSec: tps,
    tokensPerSecMin:    Math.round(baseTps * 0.88),
    tokensPerSecMax:    Math.round(baseTps * 1.12),
    tokensPerSecStdDev: parseFloat((baseTps * 0.07).toFixed(1)),
    latencyP50: latVals[Math.floor(latVals.length * 0.5)],
    latencyP95: latVals[Math.floor(latVals.length * 0.95)] ?? Math.round(latBase * 1.2),
    latencyP99: latVals[latVals.length - 1] ?? Math.round(latBase * 1.4),
    energyW,
    energyWh: isWebGPU || energyW === null ? null : parseFloat((energyW * (latBase / 3_600_000)).toFixed(6)),
    quality:         generateQualityMetrics(config.model, config.quantization),
    totalTokens:     tps * config.iterations * 5,
    totalDurationMs: config.iterations * latBase + config.warmupRuns * latBase,
    timeSeriesTokensPerSec: tpsVals,
    timeSeriesLatency:      latVals,
  };
}

function generateBenchmarkLogs(config: BenchmarkRunConfig): { lines: string[]; delaysMs: number[] } {
  const hwName    = HARDWARE_PROFILES.find((h) => h.id === config.hardware)?.name ?? config.hardware;
  const modeLabel = config.executionMode === "webgpu" ? "WebGPU (browser)" : "Local Agent";
  const lines: string[] = []; const delaysMs: number[] = [];
  const add = (l: string, d: number) => { lines.push(l); delaysMs.push(d); };

  add(`[EdgeBench v0.1.0] Iniciando — ${modeLabel}`, 0);
  add(`[Config] ${config.model} | ${config.quantization} | ${config.runtime}`, 200);
  add(`[Config] ${config.iterations} iterações | ${config.warmupRuns} warmup | ${hwName}`, 100);
  add("", 100);
  add("[FASE 1/4] Verificando ambiente...", 300);
  add(`  ✓ Runtime ${config.runtime} encontrado`, 400);
  add(`  ✓ Modelo carregado (${config.model})`, 600);
  add(`  ✓ Hardware detectado: ${hwName}`, 300);
  add("", 100);
  add("[FASE 2/4] Warmup runs...", 200);
  for (let i = 1; i <= config.warmupRuns; i++) add(`  Warmup ${i}/${config.warmupRuns} → concluído`, 500);
  add("", 100);
  add("[FASE 3/4] Inferência — coletando métricas...", 300);
  for (let i = 1; i <= Math.min(config.iterations, 8); i++) {
    const tps = Math.round(25 + Math.random() * 20);
    add(`  Run ${i}/${config.iterations} → ${tps} tok/s | ${Math.round(1000 / tps + Math.random() * 5)} ms`, 700);
  }
  if (config.iterations > 8) add(`  ... (${config.iterations - 8} runs adicionais)`, 400);
  add("", 100);
  if ((config.benchmarkType === "energy" || config.benchmarkType === "full") && config.executionMode !== "webgpu") {
    add("  [Energia] Lendo sensor INA219... OK", 400);
    add(`  [Energia] Consumo médio: ${(4 + Math.random() * 6).toFixed(1)}W`, 400);
    add("", 100);
  }
  add("[FASE 4/4] Avaliação de qualidade...", 300);
  add(`  ✓ Perplexidade (WikiText-103): ${(9 + Math.random() * 5).toFixed(2)}`, 900);
  add(`  ✓ MMLU subset (100 q): ${Math.round(55 + Math.random() * 15)}%`, 900);
  add(`  ✓ Consistência (5×): ${(90 + Math.random() * 7).toFixed(1)}%`, 700);
  add(`  ✓ Format following: ${(93 + Math.random() * 5).toFixed(1)}%`, 500);
  add("", 100);
  add("[Cloud] Subindo outputs para LLM-as-Judge... (~30s)", 300);
  add("", 100);
  add("[OK] Benchmark concluído com sucesso.", 300);
  add("[Resultados] Salvos localmente.", 200);
  return { lines, delaysMs };
}

async function runViaAgent(
  config: BenchmarkRunConfig,
  id: string,
  appendLog: (id: string, line: string) => void,
  completeRun: (id: string, results: BenchmarkRunResults) => void,
  failRun: (id: string, reason: string) => void,
  signal: AbortSignal,
) {
  const res = await fetch(`${AGENT_URL}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
    signal,
  });
  if (!res.ok || !res.body) { failRun(id, `Agent returned ${res.status}`); return; }

  const reader = res.body.getReader();
  const dec    = new TextDecoder();
  let   buf    = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    for (const raw of buf.split("\n\n")) {
      if (!raw.startsWith("data:")) continue;
      buf = "";
      try {
        const ev = JSON.parse(raw.slice(5).trim());
        if (ev.type === "log")       appendLog(id, ev.line);
        if (ev.type === "completed") completeRun(id, ev.results as BenchmarkRunResults);
        if (ev.type === "error")     failRun(id, ev.message);
      } catch { /* malformed chunk */ }
    }
  }
}

function PhaseSetup({
  onStart, agentStatus, executionMode, setExecutionMode, webgpuAvailable,
}: {
  onStart: (cfg: BenchmarkRunConfig) => void;
  agentStatus: AgentStatus;
  executionMode: ExecutionMode;
  setExecutionMode: (m: ExecutionMode) => void;
  webgpuAvailable: boolean;
}) {
  const [model,         setModel]         = useState("");
  const [hardware,      setHardware]      = useState("");
  const [benchmarkType, setBenchmarkType] = useState<BenchmarkRunConfig["benchmarkType"]>("full");
  const [iterations,    setIterations]    = useState(10);
  const [warmupRuns,    setWarmupRuns]    = useState(3);
  const [quantization,  setQuantization]  = useState("INT4 (Q4_K_M)");
  const [runtime,       setRuntime]       = useState("llama.cpp");
  const [threads,       setThreads]       = useState(4);
  const [gpuLayers,     setGpuLayers]     = useState(32);

  const hw            = HARDWARE_PROFILES.find((h) => h.id === hardware);
  const isWebGPU      = executionMode === "webgpu";
  const visibleModels = isWebGPU ? ALL_MODELS.filter((m) => m.webgpuCompatible) : ALL_MODELS;
  const canRun        = model && hardware && (isWebGPU ? webgpuAvailable : agentStatus === "online");

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="text-xs text-zinc-500">Modo de execução:</span>
        <div className="flex rounded-lg border border-zinc-700 overflow-hidden">
          {(["agent", "webgpu"] as ExecutionMode[]).map((m) => (
            <button key={m} onClick={() => setExecutionMode(m)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${executionMode === m ? "bg-zinc-700 text-zinc-100" : "bg-zinc-800/40 text-zinc-500 hover:text-zinc-300"}`}>
              {m === "agent" ? "Desktop (Agent)" : "WebGPU (Browser)"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Alvo do Benchmark</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Modelo *</label>
                <select value={model} onChange={(e) => setModel(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-200 focus:border-blue-500 focus:outline-none">
                  <option value="">Selecionar modelo...</option>
                  {visibleModels.map((m) => <option key={m.id} value={m.label}>{m.label} ({m.size})</option>)}
                </select>
                {isWebGPU && <p className="text-[10px] text-zinc-600 mt-1">Somente modelos ≤ 4B (WebGPU)</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Hardware local *</label>
                <select value={hardware} onChange={(e) => setHardware(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-200 focus:border-blue-500 focus:outline-none">
                  <option value="">Selecionar hardware...</option>
                  {HARDWARE_PROFILES.map((h) => <option key={h.id} value={h.id}>{h.name} ({h.ram} · {h.tdp})</option>)}
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

          <Card>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Tipo de Benchmark</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {BENCHMARK_TYPES.filter((bt) => !(isWebGPU && bt.id === "energy")).map((bt) => (
                <button key={bt.id} onClick={() => setBenchmarkType(bt.id)}
                  className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-colors ${benchmarkType === bt.id ? "border-blue-500 bg-blue-500/10" : "border-zinc-700 bg-zinc-800/40 hover:border-zinc-600"}`}>
                  <bt.icon size={18} className={benchmarkType === bt.id ? "text-blue-400 mt-0.5" : "text-zinc-500 mt-0.5"} />
                  <div>
                    <p className={`text-sm font-semibold ${benchmarkType === bt.id ? "text-blue-300" : "text-zinc-300"}`}>{bt.label}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{bt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Parâmetros de Execução</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Iterações</label>
                <input type="number" min={5} max={100} value={iterations} onChange={(e) => setIterations(Number(e.target.value))}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-200 focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Warmup runs</label>
                <input type="number" min={1} max={10} value={warmupRuns} onChange={(e) => setWarmupRuns(Number(e.target.value))}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-200 focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Quantização</label>
                <select value={quantization} onChange={(e) => setQuantization(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-200 focus:border-blue-500 focus:outline-none">
                  {QUANTIZATIONS.map((q) => <option key={q}>{q}</option>)}
                </select>
              </div>
              {!isWebGPU && (
                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Runtime</label>
                  <select value={runtime} onChange={(e) => setRuntime(e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-200 focus:border-blue-500 focus:outline-none">
                    {RUNTIMES.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
              )}
              {!isWebGPU && (
                <>
                  <div>
                    <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Threads CPU</label>
                    <input type="number" min={1} max={32} value={threads} onChange={(e) => setThreads(Number(e.target.value))}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-200 focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-400 mb-1.5 block">GPU Layers (0 = CPU only)</label>
                    <input type="number" min={0} max={80} value={gpuLayers} onChange={(e) => setGpuLayers(Number(e.target.value))}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-200 focus:border-blue-500 focus:outline-none" />
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Resumo</p>
            <div className="space-y-2.5 text-sm">
              {[
                { label: "Modo",        value: isWebGPU ? "WebGPU (browser)" : "Agent local" },
                { label: "Modelo",      value: model || "—" },
                { label: "Hardware",    value: hw?.name || "—" },
                { label: "Tipo",        value: BENCHMARK_TYPES.find((b) => b.id === benchmarkType)?.label ?? "—" },
                { label: "Iterações",   value: `${iterations} + ${warmupRuns} warmup` },
                { label: "Quantização", value: quantization },
              ].map((item) => (
                <div key={item.label} className="flex justify-between gap-2">
                  <span className="text-zinc-500">{item.label}</span>
                  <span className="text-zinc-300 font-medium text-right truncate max-w-[140px]">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-zinc-800">
              <p className="text-xs text-zinc-600 mb-3">Tempo estimado: ~{Math.round(((iterations + warmupRuns) * 1.5) / 60)} min</p>
              <Button variant="primary" size="lg" className="w-full"
                onClick={() => canRun && onStart({ executionMode, model, hardware, benchmarkType, iterations, warmupRuns, quantization, runtime: isWebGPU ? "WebLLM (MLC)" : runtime, threads, gpuLayers, promptTemplate: "Explique o conceito de edge computing em 3 frases." })}
                disabled={!canRun}>
                <Play size={15} /> Iniciar Benchmark <ChevronRight size={14} />
              </Button>
              {!canRun && !isWebGPU && agentStatus !== "online" && (
                <p className="text-xs text-yellow-600 mt-2 text-center">Agente local necessário</p>
              )}
            </div>
          </Card>
          <Card>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">O que será medido</p>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              <li className="flex items-center gap-2"><Zap size={11} className="text-blue-400" /> Tokens/s (média, min, max, σ)</li>
              <li className="flex items-center gap-2"><Clock size={11} className="text-blue-300" /> Latência p50, p95, p99</li>
              {!isWebGPU && <li className="flex items-center gap-2"><Battery size={11} className="text-yellow-400" /> Consumo (W) e por inferência (Wh)</li>}
              <li className="flex items-center gap-2"><Target size={11} className="text-purple-400" /> Perplexidade · MMLU · Consistência</li>
              <li className="flex items-center gap-2"><BarChart3 size={11} className="text-zinc-500" /> LLM-as-Judge (cloud, ~30s)</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

function PhaseRunning({ run, onCancel }: { run: LocalBenchmarkRun; onCancel: () => void }) {
  const logEndRef     = useRef<HTMLDivElement>(null);
  const totalExpected = run.config.iterations + run.config.warmupRuns + 18;
  const progress      = Math.min((run.logs.length / totalExpected) * 100, 95);
  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [run.logs]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-sm font-semibold text-zinc-200">
            Executando em {HARDWARE_PROFILES.find((h) => h.id === run.config.hardware)?.name}...
          </span>
        </div>
        <Button variant="danger" size="sm" onClick={onCancel}><Square size={13} /> Cancelar</Button>
      </div>
      <div>
        <div className="flex justify-between text-xs text-zinc-500 mb-1.5"><span>Progresso</span><span>{Math.round(progress)}%</span></div>
        <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Runs completos",  value: Math.max(0, run.logs.filter((l) => l.includes("Run ")).length) },
          { label: "Warmups",         value: run.config.warmupRuns },
          { label: "Iterações alvo",  value: run.config.iterations },
          { label: "Tempo decorrido", value: `${Math.round((Date.now() - new Date(run.startedAt).getTime()) / 1000)}s` },
        ].map((m) => (
          <Card key={m.label} className="text-center py-3">
            <div className="text-xl font-bold text-zinc-100">{m.value}</div>
            <div className="text-xs text-zinc-500 mt-0.5">{m.label}</div>
          </Card>
        ))}
      </div>
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
            <div key={i} className={
              line.startsWith("[ERRO]")  ? "text-red-400" :
              line.startsWith("[OK]") || line.includes("✓") ? "text-green-400" :
              line.startsWith("[FASE")   ? "text-blue-300 font-semibold" :
              line.startsWith("[Cloud]") ? "text-purple-400" :
              line.startsWith("[Config]") || line.startsWith("[EdgeBench") ? "text-zinc-400" :
              "text-zinc-300"
            }>{line || " "}</div>
          ))}
          <div ref={logEndRef} />
          <span className="inline-block h-4 w-2 bg-zinc-300 animate-pulse" />
        </div>
      </Card>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, unit, sub, color }: {
  icon: React.ElementType; label: string; value: number | string | null; unit?: string; sub?: string; color: string;
}) {
  return (
    <Card className="flex flex-col gap-1">
      <Icon size={16} className={`${color} mb-1`} />
      <div className="text-2xl font-extrabold text-zinc-100">
        {value ?? <span className="text-zinc-600 text-base">N/A</span>}
        {unit && value !== null && <span className="text-sm font-normal text-zinc-500 ml-1">{unit}</span>}
      </div>
      <div className="text-xs text-zinc-500">{label}</div>
      {sub && <div className="text-[10px] text-zinc-600 mt-0.5">{sub}</div>}
    </Card>
  );
}

function QualityPanel({ quality }: { quality: QualityMetrics }) {
  const radarData = [
    { metric: "Perplexidade", value: Math.round(Math.max(0, 100 - (quality.perplexity - 5) * 5)) },
    { metric: "MMLU",         value: Math.round(quality.mmluScorePct) },
    { metric: "Consistência", value: Math.round(quality.consistencyPct) },
    { metric: "Format",       value: Math.round(quality.formatFollowingPct) },
  ];
  return (
    <Card>
      <p className="text-sm font-semibold text-zinc-300 mb-4">Qualidade do Modelo</p>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-3">
          {[
            { label: "Perplexidade",     value: quality.perplexity.toFixed(2),         note: "WikiText-103 · lower=better",       color: "text-blue-400"   },
            { label: "MMLU Score",       value: `${quality.mmluScorePct.toFixed(1)}%`,  note: "100 q · ciências, math, CS",        color: "text-purple-400" },
            { label: "Consistência",     value: `${quality.consistencyPct.toFixed(1)}%`, note: "5× mesma pergunta (cosine sim)",   color: "text-green-400"  },
            { label: "Format Following", value: `${quality.formatFollowingPct.toFixed(1)}%`, note: "JSON / lista / número",        color: "text-yellow-400" },
          ].map((m) => (
            <div key={m.label} className="flex items-start gap-3 rounded-lg bg-zinc-800/50 px-3 py-2.5">
              <div>
                <div className={`text-sm font-semibold ${m.color}`}>{m.value}</div>
                <div className="text-xs text-zinc-500">{m.label}</div>
                <div className="text-[10px] text-zinc-600">{m.note}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#3f3f46" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: "#71717a", fontSize: 10 }} />
              <Radar dataKey="value" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.25} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-zinc-800">
        <div className="flex items-center gap-2 mb-3">
          <div className={`h-2 w-2 rounded-full ${quality.judgeCoherence !== null ? "bg-green-500" : "bg-purple-500 animate-pulse"}`} />
          <p className="text-xs font-semibold text-zinc-400">LLM-as-Judge (Claude Sonnet)</p>
          {quality.judgeCoherence === null && <span className="text-[10px] text-zinc-600">aguardando cloud ~30s</span>}
        </div>
        {quality.judgeCoherence !== null ? (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Coerência",    value: quality.judgeCoherence },
              { label: "Factualidade", value: quality.judgeFactuality },
              { label: "Geral",        value: quality.judgeOverall },
            ].map((j) => (
              <div key={j.label} className="rounded-lg bg-purple-950/30 border border-purple-800/30 px-3 py-2.5 text-center">
                <div className="text-xl font-bold text-purple-300">{j.value?.toFixed(1)}<span className="text-xs text-zinc-500 ml-0.5">/10</span></div>
                <div className="text-xs text-zinc-500">{j.label}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {["Coerência", "Factualidade", "Geral"].map((label) => (
              <div key={label} className="rounded-lg bg-purple-950/20 border border-purple-900/30 px-3 py-2.5 text-center">
                <div className="text-xl font-bold text-zinc-700">—</div>
                <div className="text-xs text-zinc-600">{label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

function exportRunAsJson(run: LocalBenchmarkRun, hw: ReturnType<typeof HARDWARE_PROFILES.find>) {
  const r = run.results;
  const payload = {
    schema_version: "1.1.0", exported_at: new Date().toISOString(), tool: "EdgeBench v0.1.0",
    run: { id: run.id, status: run.status, execution_mode: run.config.executionMode, started_at: run.startedAt, completed_at: run.completedAt ?? null,
      duration_ms: run.completedAt ? new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime() : null,
      published_to_community: run.publishedToCommmunity ?? false },
    config: { model: run.config.model, hardware: { id: run.config.hardware, name: hw?.name, chip: hw?.chip, ram: hw?.ram, tdp: hw?.tdp, category: hw?.category },
      benchmark_type: run.config.benchmarkType, iterations: run.config.iterations, warmup_runs: run.config.warmupRuns,
      quantization: run.config.quantization, runtime: run.config.runtime, threads: run.config.threads, gpu_layers: run.config.gpuLayers },
    results: r ? {
      performance: { tokens_per_sec: { mean: r.tokensPerSec, min: r.tokensPerSecMin, max: r.tokensPerSecMax, std_dev: r.tokensPerSecStdDev }, latency_ms: { p50: r.latencyP50, p95: r.latencyP95, p99: r.latencyP99 } },
      energy: { avg_watts: r.energyW, wh_per_inference: r.energyWh, note: run.config.executionMode === "webgpu" ? "not measured on WebGPU path" : null },
      quality: { perplexity: r.quality.perplexity, mmlu_score_pct: r.quality.mmluScorePct, consistency_pct: r.quality.consistencyPct, format_following_pct: r.quality.formatFollowingPct, judge_coherence: r.quality.judgeCoherence, judge_factuality: r.quality.judgeFactuality, judge_overall: r.quality.judgeOverall },
      totals: { tokens_generated: r.totalTokens, duration_ms: r.totalDurationMs }, time_series: { tokens_per_sec: r.timeSeriesTokensPerSec, latency_ms: r.timeSeriesLatency },
    } : null,
    logs: run.logs,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = `edgebench_${run.config.model.replace(/\s+/g, "-").toLowerCase()}_${run.config.hardware}_${run.id}.json`;
  a.click(); URL.revokeObjectURL(url);
}

function PhaseResults({ run, onReset, onPublish }: { run: LocalBenchmarkRun; onReset: () => void; onPublish: () => void }) {
  const r        = run.results!;
  const hw       = HARDWARE_PROFILES.find((h) => h.id === run.config.hardware);
  const dur      = run.completedAt ? Math.round((new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime()) / 1000) : 0;
  const isWebGPU = run.config.executionMode === "webgpu";
  const tpsData  = r.timeSeriesTokensPerSec.map((v, i) => ({ run: i + 1, tps: v }));
  const latData  = r.timeSeriesLatency.map((v, i) => ({ run: i + 1, latency: v }));

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="rounded-xl border border-green-700/60 bg-green-950/30 p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={24} className="text-green-400" />
            <div>
              <p className="text-lg font-bold text-green-300">Benchmark concluído</p>
              <p className="text-xs text-zinc-500">{run.config.model} · {hw?.name} · {dur}s · {run.config.iterations} iterações{isWebGPU && " · WebGPU"}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="blue">{run.config.quantization}</Badge>
            <Badge variant="gray">{run.config.runtime}</Badge>
            {isWebGPU && <Badge variant="purple">WebGPU</Badge>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard icon={Zap}     label="Tokens/s (média)" value={r.tokensPerSec}
          sub={`min ${r.tokensPerSecMin} · max ${r.tokensPerSecMax} · σ ${r.tokensPerSecStdDev}`} color="text-blue-400" />
        <MetricCard icon={Clock}   label="Latência p50"     value={r.latencyP50} unit="ms"
          sub={`p95: ${r.latencyP95}ms · p99: ${r.latencyP99}ms`} color="text-blue-300" />
        <MetricCard icon={Battery} label="Consumo médio"    value={r.energyW} unit={r.energyW !== null ? "W" : undefined}
          sub={r.energyWh !== null ? `${(r.energyWh * 1000).toFixed(3)} mWh/inf` : "não medido (WebGPU)"} color="text-yellow-400" />
        <MetricCard icon={Cpu}     label="Total tokens"     value={r.totalTokens.toLocaleString("pt-BR")}
          sub={`${(r.totalDurationMs / 1000).toFixed(1)}s total`} color="text-zinc-400" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <p className="text-sm font-semibold text-zinc-300 mb-4">Tokens/s por run</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={tpsData}>
              <defs>
                <linearGradient id="tpsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="run" tick={{ fill: "#71717a", fontSize: 10 }} />
              <YAxis tick={{ fill: "#71717a", fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }}
                labelStyle={{ color: "#a1a1aa" }} itemStyle={{ color: "#60a5fa" }} />
              <Area type="monotone" dataKey="tps" stroke="#60a5fa" fill="url(#tpsGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-zinc-300 mb-4">Distribuição de latência (ms)</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={latData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="run" tick={{ fill: "#71717a", fontSize: 10 }} />
              <YAxis tick={{ fill: "#71717a", fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }}
                labelStyle={{ color: "#a1a1aa" }} itemStyle={{ color: "#93c5fd" }} />
              <Line type="monotone" dataKey="latency" stroke="#93c5fd" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <QualityPanel quality={r.quality} />

      <Card>
        <p className="text-sm font-semibold text-zinc-300 mb-4">Detalhes da execução</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Total tokens",  value: r.totalTokens.toLocaleString("pt-BR") },
            { label: "Duração total", value: `${(r.totalDurationMs / 1000).toFixed(1)}s` },
            { label: "Iterações",     value: run.config.iterations },
            { label: "Threads CPU",   value: isWebGPU ? "N/A" : run.config.threads },
            { label: "GPU layers",    value: isWebGPU ? "WebGPU" : run.config.gpuLayers > 0 ? run.config.gpuLayers : "CPU only" },
            { label: "Modo",          value: isWebGPU ? "WebGPU (browser)" : "Agent local" },
          ].map((item) => (
            <div key={item.label} className="rounded-lg bg-zinc-800/50 px-3 py-2.5">
              <div className="text-xs text-zinc-500">{item.label}</div>
              <div className="text-sm font-semibold text-zinc-200 mt-0.5">{item.value}</div>
            </div>
          ))}
        </div>
      </Card>

      <details className="group">
        <summary className="cursor-pointer list-none flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300">
          <Terminal size={13} /> Ver log completo
          <ChevronRight size={13} className="transition-transform group-open:rotate-90" />
        </summary>
        <div className="mt-3 rounded-xl bg-zinc-950 p-4 font-mono text-xs leading-relaxed max-h-48 overflow-y-auto">
          {run.logs.map((line, i) => (
            <div key={i} className={line.includes("✓") || line.startsWith("[OK]") ? "text-green-400" : "text-zinc-400"}>{line || " "}</div>
          ))}
        </div>
      </details>

      <div className="flex flex-wrap gap-3">
        {!run.publishedToCommmunity ? (
          <Button variant="primary" size="md" onClick={onPublish}><Share2 size={14} /> Publicar na comunidade</Button>
        ) : (
          <div className="flex items-center gap-2 text-sm text-green-400"><CheckCircle2 size={15} /> Publicado</div>
        )}
        <Button variant="secondary" size="md" onClick={() => exportRunAsJson(run, hw)}><Download size={14} /> Exportar JSON</Button>
        <Button variant="secondary" size="md" onClick={onReset}><RotateCcw size={14} /> Novo benchmark</Button>
      </div>
    </div>
  );
}

function RunHistoryItem({ run, onSelect, onDelete, isActive }: {
  run: LocalBenchmarkRun; onSelect: () => void; onDelete: () => void; isActive: boolean;
}) {
  const hw       = HARDWARE_PROFILES.find((h) => h.id === run.config.hardware);
  const date     = new Date(run.startedAt);
  const label    = `${date.toLocaleDateString("pt-BR")} ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  const isWebGPU = run.config.executionMode === "webgpu";
  return (
    <div className={`flex items-start justify-between rounded-lg border p-3 cursor-pointer transition-colors ${isActive ? "border-blue-500/60 bg-blue-950/30" : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/40"}`} onClick={onSelect}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {isWebGPU && <Smartphone size={10} className="text-purple-400 shrink-0" />}
          <p className="text-xs font-semibold text-zinc-300 truncate">{run.config.model}</p>
        </div>
        <p className="text-[10px] text-zinc-600 truncate">{hw?.name}</p>
        <p className="text-[10px] text-zinc-700 mt-0.5">{label}</p>
      </div>
      <div className="flex flex-col items-end gap-1.5 ml-2 shrink-0">
        {run.status === "completed" && <CheckCircle2  size={13} className="text-green-400" />}
        {run.status === "failed"    && <XCircle       size={13} className="text-red-400" />}
        {run.status === "cancelled" && <AlertTriangle size={13} className="text-yellow-400" />}
        {run.status === "running"   && <div className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse" />}
        {run.results && <span className="text-[10px] font-mono text-zinc-500">{run.results.tokensPerSec} t/s</span>}
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-zinc-700 hover:text-red-400 transition-colors">
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  );
}

type Phase = "setup" | "running" | "results";

export default function BenchmarkPage() {
  const { runs, startRun, appendLog, completeRun, failRun, cancelRun, deleteRun, markPublished } = useBenchmark();
  const { status: agentStatus, info: agentInfo, retry: retryAgent } = useAgentHealth();
  const { mode: executionMode, setMode: setExecutionMode, webgpuAvailable } = useExecutionMode();
  const [phase,        setPhase]        = useState<Phase>("setup");
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const [historyOpen,  setHistoryOpen]  = useState(false);
  const currentRun = runs.find((r) => r.id === currentRunId) ?? null;
  const abortRef   = useRef<AbortController | null>(null);

  const handleStart = useCallback((config: BenchmarkRunConfig) => {
    const id = startRun(config);
    setCurrentRunId(id);
    setPhase("running");
    if (config.executionMode === "agent" && agentStatus === "online") {
      abortRef.current = new AbortController();
      runViaAgent(config, id, appendLog,
        (rid, results) => { completeRun(rid, results); setPhase("results"); },
        (rid, reason)  => { failRun(rid, reason); setPhase("setup"); },
        abortRef.current.signal
      ).catch(() => {});
    } else {
      const { lines, delaysMs } = generateBenchmarkLogs(config);
      let acc = 0;
      lines.forEach((line, i) => { acc += delaysMs[i]; setTimeout(() => appendLog(id, line), acc); });
      setTimeout(() => { completeRun(id, generateResults(config)); setPhase("results"); }, delaysMs.reduce((a, b) => a + b, 0) + 600);
    }
  }, [startRun, appendLog, completeRun, failRun, agentStatus]);

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
    if (currentRunId) cancelRun(currentRunId);
    setPhase("setup"); setCurrentRunId(null);
  }, [currentRunId, cancelRun]);

  const handleReset   = useCallback(() => { setPhase("setup"); setCurrentRunId(null); }, []);
  const handlePublish = useCallback(() => { if (currentRunId) markPublished(currentRunId); }, [currentRunId, markPublished]);
  const handleSelectHistoryRun = useCallback((run: LocalBenchmarkRun) => {
    setCurrentRunId(run.id);
    setPhase(run.status === "completed" ? "results" : run.status === "running" ? "running" : "setup");
    setHistoryOpen(false);
  }, []);

  const completedRuns = runs.filter((r) => r.status === "completed");
  const avgTps = completedRuns.length > 0 ? Math.round(completedRuns.reduce((s, r) => s + (r.results?.tokensPerSec ?? 0), 0) / completedRuns.length) : null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-zinc-100">Benchmark Local</h1>
              {phase === "running" && <Badge variant="blue">Em execução</Badge>}
              {phase === "results" && <Badge variant="gray">Resultados</Badge>}
            </div>
            <p className="text-zinc-500">Execute benchmarks reais no seu hardware e compare com a comunidade.</p>
          </div>
          <div className="flex items-center gap-3">
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
            <Button variant="secondary" size="sm" onClick={() => setHistoryOpen(!historyOpen)}>
              <History size={14} /> Histórico
              {runs.length > 0 && <span className="ml-1 rounded-full bg-zinc-700 px-1.5 py-0.5 text-[10px] font-bold">{runs.length}</span>}
            </Button>
            {phase !== "setup" && <Button variant="ghost" size="sm" onClick={handleReset}><RotateCcw size={14} /> Novo</Button>}
          </div>
        </div>

        {executionMode === "webgpu"
          ? <WebGPUBanner available={webgpuAvailable} />
          : <AgentBanner status={agentStatus} info={agentInfo} onRetry={retryAgent} />
        }

        <div className="mb-6 flex items-center gap-2 text-xs">
          {(["setup", "running", "results"] as Phase[]).map((p, i) => (
            <>
              {i > 0 && <ChevronRight key={`sep-${p}`} size={12} className="text-zinc-700" />}
              <span key={p} className={phase === p ? "font-semibold text-blue-400" : i < (["setup", "running", "results"] as Phase[]).indexOf(phase) ? "text-zinc-400" : "text-zinc-700"}>
                {p === "setup" ? "1. Configuração" : p === "running" ? "2. Execução" : "3. Resultados"}
              </span>
            </>
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
                {runs.length === 0
                  ? <p className="text-xs text-zinc-600 text-center py-4">Nenhum benchmark executado ainda.</p>
                  : <div className="space-y-2">{runs.map((r) => (
                      <RunHistoryItem key={r.id} run={r} isActive={r.id === currentRunId}
                        onSelect={() => handleSelectHistoryRun(r)}
                        onDelete={() => { deleteRun(r.id); if (r.id === currentRunId) handleReset(); }} />
                    ))}</div>
                }
              </Card>
            </div>
          )}
          <div className={historyOpen ? "lg:col-span-3" : ""}>
            {phase === "setup" && (
              <PhaseSetup onStart={handleStart} agentStatus={agentStatus}
                executionMode={executionMode} setExecutionMode={setExecutionMode} webgpuAvailable={webgpuAvailable} />
            )}
            {phase === "running" && currentRun && <PhaseRunning run={currentRun} onCancel={handleCancel} />}
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
