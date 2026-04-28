"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { UpgradeModal } from "@/components/UpgradeModal";
import { usePlan } from "@/lib/planContext";
import type { Plan } from "@/types";

interface FeatureGateProps {
  children: React.ReactNode;
  requiredPlan?: Plan;
  feature?: string;
  reason?: string;
  blur?: boolean;
}

const PLAN_ORDER: Plan[] = ["free", "pro", "team", "enterprise"];

export function FeatureGate({
  children,
  requiredPlan = "pro",
  feature,
  reason,
  blur = true,
}: FeatureGateProps) {
  const { profile } = usePlan();
  const [open, setOpen] = useState(false);

  const userLevel = PLAN_ORDER.indexOf(profile.plan);
  const requiredLevel = PLAN_ORDER.indexOf(requiredPlan);

  if (userLevel >= requiredLevel) return <>{children}</>;

  return (
    <>
      <div className="relative">
        {blur && (
          <div className="pointer-events-none select-none" style={{ filter: "blur(4px)", opacity: 0.4 }}>
            {children}
          </div>
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-zinc-900/80 backdrop-blur-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-900/60 mb-3">
            <Lock size={18} className="text-violet-300" />
          </div>
          <p className="text-sm font-semibold text-zinc-200 mb-1">
            {feature || `Recurso ${requiredPlan.toUpperCase()}`}
          </p>
          <p className="text-xs text-zinc-500 mb-3 text-center max-w-[200px]">
            {reason || `Disponível no plano ${requiredPlan}.`}
          </p>
          <Button variant="upgrade" size="sm" onClick={() => setOpen(true)}>
            Fazer upgrade
          </Button>
        </div>
      </div>
      <UpgradeModal open={open} onClose={() => setOpen(false)} feature={feature} reason={reason} />
    </>
  );
}
