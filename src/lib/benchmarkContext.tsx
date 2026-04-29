"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { LocalBenchmarkRun, BenchmarkRunConfig, BenchmarkRunResults } from "@/types";

const STORAGE_KEY = "edgebench_local_runs";
const MAX_HISTORY = 20;

interface BenchmarkContextValue {
  runs: LocalBenchmarkRun[];
  activeRun: LocalBenchmarkRun | null;
  startRun: (config: BenchmarkRunConfig) => string;
  appendLog: (id: string, line: string) => void;
  completeRun: (id: string, results: BenchmarkRunResults) => void;
  failRun: (id: string, reason: string) => void;
  cancelRun: (id: string) => void;
  deleteRun: (id: string) => void;
  markPublished: (id: string) => void;
  getRunById: (id: string) => LocalBenchmarkRun | undefined;
}

const BenchmarkContext = createContext<BenchmarkContextValue | null>(null);

export function BenchmarkProvider({ children }: { children: React.ReactNode }) {
  const [runs, setRuns] = useState<LocalBenchmarkRun[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setRuns(JSON.parse(stored));
    } catch {}
  }, []);

  const persist = (next: LocalBenchmarkRun[]) => {
    setRuns(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(0, MAX_HISTORY)));
    } catch {}
  };

  const startRun = (config: BenchmarkRunConfig): string => {
    const id = `run_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const run: LocalBenchmarkRun = {
      id,
      config,
      status: "running",
      startedAt: new Date().toISOString(),
      logs: [],
    };
    persist([run, ...runs]);
    return id;
  };

  const updateRun = (id: string, patch: Partial<LocalBenchmarkRun>) => {
    setRuns((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, ...patch } : r));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(0, MAX_HISTORY)));
      } catch {}
      return next;
    });
  };

  const appendLog = (id: string, line: string) => {
    setRuns((prev) => {
      const next = prev.map((r) =>
        r.id === id ? { ...r, logs: [...r.logs, line] } : r
      );
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(0, MAX_HISTORY)));
      } catch {}
      return next;
    });
  };

  const completeRun = (id: string, results: BenchmarkRunResults) => {
    updateRun(id, { status: "completed", completedAt: new Date().toISOString(), results });
  };

  const failRun = (id: string, reason: string) => {
    updateRun(id, {
      status: "failed",
      completedAt: new Date().toISOString(),
      logs: [...(runs.find((r) => r.id === id)?.logs ?? []), `[ERRO] ${reason}`],
    });
  };

  const cancelRun = (id: string) => {
    updateRun(id, { status: "cancelled", completedAt: new Date().toISOString() });
  };

  const deleteRun = (id: string) => {
    persist(runs.filter((r) => r.id !== id));
  };

  const markPublished = (id: string) => {
    updateRun(id, { publishedToCommmunity: true });
  };

  const getRunById = (id: string) => runs.find((r) => r.id === id);

  const activeRun = runs.find((r) => r.status === "running") ?? null;

  return (
    <BenchmarkContext.Provider
      value={{
        runs,
        activeRun,
        startRun,
        appendLog,
        completeRun,
        failRun,
        cancelRun,
        deleteRun,
        markPublished,
        getRunById,
      }}
    >
      {children}
    </BenchmarkContext.Provider>
  );
}

export function useBenchmark() {
  const ctx = useContext(BenchmarkContext);
  if (!ctx) throw new Error("useBenchmark must be used inside BenchmarkProvider");
  return ctx;
}
