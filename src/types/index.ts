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

export type BenchmarkType = "performance" | "energy" | "accuracy" | "full";
export type BenchmarkStatus = "idle" | "running" | "completed" | "failed" | "cancelled";

export interface BenchmarkRunConfig {
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

export interface BenchmarkRunResults {
  tokensPerSec: number;
  tokensPerSecMin: number;
  tokensPerSecMax: number;
  tokensPerSecStdDev: number;
  latencyP50: number;
  latencyP95: number;
  latencyP99: number;
  energyW: number;
  energyWh: number;
  accuracyPct: number;
  totalTokens: number;
  totalDurationMs: number;
  timeSeriesTokensPerSec: number[];
  timeSeriesLatency: number[];
}

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
