"use client";

import { ThumbsUp, CheckCircle, Shield, Zap, Clock, Battery } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { BenchmarkResult } from "@/types";

interface BenchmarkCardProps {
  benchmark: BenchmarkResult;
  selected?: boolean;
  onToggleSelect?: () => void;
  showSelect?: boolean;
}

export function BenchmarkCard({ benchmark: b, selected, onToggleSelect, showSelect }: BenchmarkCardProps) {
  return (
    <Card hover className={`transition-all ${selected ? "ring-2 ring-brand-500" : ""}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-mono text-sm font-bold text-zinc-100">{b.model}</span>
            <Badge variant="gray">{b.modelSize}</Badge>
            {b.validated && (
              <Badge variant="green">
                <CheckCircle size={10} /> Validado
              </Badge>
            )}
            {b.peerReviewed && (
              <Badge variant="blue">
                <Shield size={10} /> Peer-reviewed
              </Badge>
            )}
          </div>
          <div className="text-xs text-zinc-500 mb-3">
            <span className="text-zinc-400 font-medium">{b.hardware}</span>
            {" · "}
            <span>{b.technique}</span>
            {" · "}
            <span>{b.runtime}</span>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
            {b.tokensPerSec > 0 && (
              <div className="flex items-center gap-1.5">
                <Zap size={13} className="text-brand-400 flex-shrink-0" />
                <div>
                  <div className="text-sm font-bold text-zinc-100">{b.tokensPerSec}</div>
                  <div className="text-[10px] text-zinc-500">tokens/s</div>
                </div>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Clock size={13} className="text-blue-400 flex-shrink-0" />
              <div>
                <div className="text-sm font-bold text-zinc-100">{b.latencyMs}ms</div>
                <div className="text-[10px] text-zinc-500">latência</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Battery size={13} className="text-yellow-400 flex-shrink-0" />
              <div>
                <div className="text-sm font-bold text-zinc-100">{b.energyW}W</div>
                <div className="text-[10px] text-zinc-500">consumo</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield size={13} className="text-purple-400 flex-shrink-0" />
              <div>
                <div className="text-sm font-bold text-zinc-100">{b.accuracyPct}%</div>
                <div className="text-[10px] text-zinc-500">acurácia</div>
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1">
            {b.tags.map((t) => (
              <span key={t} className="rounded px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 bg-zinc-800">
                #{t}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-end gap-3 flex-shrink-0">
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <ThumbsUp size={12} />
            <span>{b.upvotes}</span>
          </div>
          <span className="text-[10px] text-zinc-600">@{b.author}</span>
          {showSelect && (
            <button
              onClick={onToggleSelect}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                selected
                  ? "bg-brand-500/20 text-brand-400 ring-1 ring-brand-500/40"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {selected ? "Selecionado" : "Comparar"}
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
