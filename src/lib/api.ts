const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export interface CreateRunPayload {
  userId?: string;
  hardwareId?: string;
  executionMode: "agent" | "webgpu";
  model: string;
  quantization: string;
  runtime?: string;
  benchmarkType: string;
  iterations: number;
  warmupRuns: number;
  threads?: number;
  gpuLayers?: number;
  hardwareFingerprint?: string;
}

export interface SubmitResultsPayload {
  tokensPerSecMean: number;
  tokensPerSecStddev: number;
  latencyP50Ms: number;
  latencyP95Ms: number;
  latencyP99Ms: number;
  energyAvgWatts?: number | null;
  energyWhPerInference?: number | null;
  perplexity?: number;
  mmluScorePct?: number;
  consistencyPct?: number;
  formatFollowingPct?: number;
  totalTokens: number;
  totalDurationMs: number;
  timeSeries?: { runIndex: number; tokensPerSec: number; latencyMs: number; watts?: number | null }[];
  rawOutputs?: string[];
}

export interface RunSummary {
  id: string;
  model: string;
  quantization: string;
  executionMode: "agent" | "webgpu";
  status: string;
  startedAt: string;
  completedAt?: string;
  result?: {
    tokensPerSecMean: number;
    latencyP50Ms: number;
    energyAvgWatts?: number | null;
    judgeOverall?: number | null;
  };
  hardware?: { id: string; name: string } | null;
}

export async function createRun(payload: CreateRunPayload): Promise<{ runId: string }> {
  const res = await fetch(`${BASE}/api/runs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`createRun failed: ${res.status}`);
  return res.json();
}

export async function submitResults(
  runId: string,
  payload: SubmitResultsPayload
): Promise<{ ok: boolean; judgeJobId?: string }> {
  const res = await fetch(`${BASE}/api/runs/${runId}/results`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`submitResults failed: ${res.status}`);
  return res.json();
}

export async function publishRun(runId: string): Promise<void> {
  const res = await fetch(`${BASE}/api/runs/${runId}/publish`, { method: "PATCH" });
  if (!res.ok) throw new Error(`publishRun failed: ${res.status}`);
}

export async function listRuns(params?: {
  model?: string;
  hardwareId?: string;
  quantization?: string;
  executionMode?: string;
  limit?: number;
  offset?: number;
}): Promise<{ runs: RunSummary[]; limit: number; offset: number }> {
  const qs = params ? "?" + new URLSearchParams(params as Record<string, string>).toString() : "";
  const res = await fetch(`${BASE}/api/runs${qs}`);
  if (!res.ok) throw new Error(`listRuns failed: ${res.status}`);
  return res.json();
}

export async function getRun(runId: string): Promise<RunSummary> {
  const res = await fetch(`${BASE}/api/runs/${runId}`);
  if (!res.ok) throw new Error(`getRun failed: ${res.status}`);
  return res.json();
}

// Subscribe to judge scores via WebSocket. Returns an unsubscribe function.
export function subscribeJudgeScores(
  runId: string,
  onScores: (scores: { coherence: number; factuality: number; overall: number }) => void,
  onError?: (err: Event) => void
): () => void {
  const wsBase = BASE.replace(/^http/, "ws");
  const ws = new WebSocket(`${wsBase}/api/runs/${runId}/judge`);

  ws.onmessage = (ev) => {
    try {
      const data = JSON.parse(ev.data as string);
      if (data.type === "judge_scores") {
        onScores({ coherence: data.coherence, factuality: data.factuality, overall: data.overall });
      }
    } catch {}
  };

  if (onError) ws.onerror = onError;

  return () => ws.close();
}
