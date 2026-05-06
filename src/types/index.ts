export type Plan = "free" | "pro" | "team" | "enterprise";

export interface UserProfile {
  plan: Plan;
  simulationsUsed: number;
  simulationsLimit: number;
  role: "engineer" | "researcher" | "pm" | null;
  hardware: string | null;
  objective: string | null;
}

export interface BenchmarkResult {
  id: string;
  model: string;
  modelSize: string;
  hardware: string;
  tokensPerSec: number;
  latencyMs: number;
  energyW: number;
  accuracyPct: number;
  technique: string;
  runtime: string;
  validated: boolean;
  peerReviewed: boolean;
  publishedAt: string;
  author: string;
  upvotes: number;
  tags: string[];
}

export interface HardwareProfile {
  id: string;
  name: string;
  category: "jetson" | "raspberry" | "mcu" | "pc" | "cloud";
  ram: string;
  tdp: string;
  chip: string;
}

export interface PricingTier {
  id: Plan;
  name: string;
  price: { monthly: number; annual: number };
  description: string;
  cta: string;
  highlighted: boolean;
  features: { label: string; included: boolean; note?: string }[];
}

export interface SimulatorInput {
  model: string;
  hardware: string;
  maxWatts: number;
  objective: "latency" | "energy" | "accuracy";
}

export interface SimulatorOutput {
  feasible: boolean;
  technique: string;
  estimatedTokensPerSec: number;
  estimatedWatts: number;
  accuracyDrop: number;
  runtime: string;
  script: string;
}

// ─── Execution mode ──────────────────────────────────────────────────────────

/** How the benchmark is executed on the client side */
export type ExecutionMode = "agent" | "webgpu";

export type BenchmarkType = "performance" | "energy" | "quality" | "full";
export type BenchmarkStatus = "idle" | "running" | "completed" | "failed" | "cancelled";

// ─── WebGPU-compatible models ─────────────────────────────────────────────────

export interface ModelOption {
  id: string;
  label: string;
  size: string;
  /** Fits in browser VRAM — usable on Path B (WebGPU) */
  webgpuCompatible: boolean;
}

// ─── Run config ───────────────────────────────────────────────────────────────

export interface BenchmarkRunConfig {
  executionMode: ExecutionMode;
  model: string;
  hardware: string;
  benchmarkType: BenchmarkType;
  iterations: number;
  warmupRuns: number;
  quantization: string;
  runtime: string;
  threads: number;
  gpuLayers: number;
  promptTemplate: string;
}

// ─── Quality metrics ──────────────────────────────────────────────────────────

export interface QualityMetrics {
  /** Cross-entropy on WikiText-103 slice — lower is better */
  perplexity: number;
  /** % correct on 100-question MMLU subset */
  mmluScorePct: number;
  /** Cosine similarity across 5 identical prompts — higher = more stable */
  consistencyPct: number;
  /** % of runs where the model respected the requested output format */
  formatFollowingPct: number;
  /** LLM-as-Judge scores — null until cloud processes (async) */
  judgeCoherence: number | null;
  judgeFactuality: number | null;
  judgeOverall: number | null;
}

// ─── Run results ──────────────────────────────────────────────────────────────

export interface BenchmarkRunResults {
  // Performance
  tokensPerSec: number;
  tokensPerSecMin: number;
  tokensPerSecMax: number;
  tokensPerSecStdDev: number;
  latencyP50: number;
  latencyP95: number;
  latencyP99: number;
  // Energy — null on WebGPU path (no sensor access in browser)
  energyW: number | null;
  energyWh: number | null;
  // Quality
  quality: QualityMetrics;
  // Totals
  totalTokens: number;
  totalDurationMs: number;
  timeSeriesTokensPerSec: number[];
  timeSeriesLatency: number[];
}

// ─── Full run record ──────────────────────────────────────────────────────────

export interface LocalBenchmarkRun {
  id: string;
  config: BenchmarkRunConfig;
  status: BenchmarkStatus;
  startedAt: string;
  completedAt?: string;
  results?: BenchmarkRunResults;
  logs: string[];
  publishedToCommmunity?: boolean;
}
