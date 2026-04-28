"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { UpgradeModal } from "@/components/UpgradeModal";
import { usePlan } from "@/lib/planContext";

export function UsageMeter() {
  const { profile, remainingSimulations, isProOrAbove } = usePlan();
  const [open, setOpen] = useState(false);

  if (isProOrAbove) return null;

  const pct = ((profile.simulationsUsed / profile.simulationsLimit) * 100);
  const isNearLimit = profile.simulationsUsed >= profile.simulationsLimit - 1;
  const isAtLimit = profile.simulationsUsed >= profile.simulationsLimit;

  return (
    <>
      <div className={`rounded-lg border p-3 ${isAtLimit ? "border-red-800 bg-red-950/40" : isNearLimit ? "border-yellow-800 bg-yellow-950/30" : "border-zinc-800 bg-zinc-900"}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-zinc-400">Simulações este mês</span>
          <span className={`text-xs font-bold ${isAtLimit ? "text-red-400" : isNearLimit ? "text-yellow-400" : "text-zinc-300"}`}>
            {profile.simulationsUsed}/{profile.simulationsLimit}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-zinc-800">
          <div
            className={`h-full rounded-full transition-all ${isAtLimit ? "bg-red-500" : isNearLimit ? "bg-yellow-500" : "bg-brand-500"}`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        {isAtLimit ? (
          <div className="mt-2">
            <p className="text-xs text-red-400 mb-1.5">Limite atingido. Faça upgrade para continuar.</p>
            <Button variant="upgrade" size="sm" className="w-full" onClick={() => setOpen(true)}>
              <Zap size={12} /> Upgrade para Pro
            </Button>
          </div>
        ) : isNearLimit ? (
          <p className="mt-1.5 text-xs text-yellow-400">
            {remainingSimulations} simulação restante.{" "}
            <button onClick={() => setOpen(true)} className="underline hover:text-yellow-200">Fazer upgrade</button>
          </p>
        ) : (
          <p className="mt-1.5 text-xs text-zinc-600">
            {remainingSimulations} restantes.{" "}
            <button onClick={() => setOpen(true)} className="underline hover:text-zinc-400">Ver Pro</button>
          </p>
        )}
      </div>
      <UpgradeModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
