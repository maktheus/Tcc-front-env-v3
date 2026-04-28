"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { Plan, UserProfile } from "@/types";
import { PLAN_LIMITS } from "@/lib/data";

const DEFAULT_PROFILE: UserProfile = {
  plan: "free",
  simulationsUsed: 1,
  simulationsLimit: 3,
  role: null,
  hardware: null,
  objective: null,
};

interface PlanContextValue {
  profile: UserProfile;
  setPlan: (plan: Plan) => void;
  setRole: (role: UserProfile["role"]) => void;
  setHardware: (hw: string) => void;
  setObjective: (obj: string) => void;
  useSimulation: () => boolean;
  canSimulate: boolean;
  remainingSimulations: number;
  isProOrAbove: boolean;
  isTeamOrAbove: boolean;
}

const PlanContext = createContext<PlanContextValue | null>(null);

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  useEffect(() => {
    const stored = localStorage.getItem("edgebench_profile");
    if (stored) {
      try {
        setProfile(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const save = (next: UserProfile) => {
    setProfile(next);
    localStorage.setItem("edgebench_profile", JSON.stringify(next));
  };

  const setPlan = (plan: Plan) => {
    save({ ...profile, plan, simulationsLimit: PLAN_LIMITS[plan] });
  };

  const setRole = (role: UserProfile["role"]) => save({ ...profile, role });
  const setHardware = (hardware: string) => save({ ...profile, hardware });
  const setObjective = (objective: string) => save({ ...profile, objective });

  const useSimulation = (): boolean => {
    if (profile.simulationsUsed >= profile.simulationsLimit) return false;
    save({ ...profile, simulationsUsed: profile.simulationsUsed + 1 });
    return true;
  };

  const canSimulate =
    profile.plan !== "free" || profile.simulationsUsed < profile.simulationsLimit;

  const remainingSimulations =
    profile.plan === "free"
      ? Math.max(0, profile.simulationsLimit - profile.simulationsUsed)
      : Infinity;

  const isProOrAbove = profile.plan !== "free";
  const isTeamOrAbove = profile.plan === "team" || profile.plan === "enterprise";

  return (
    <PlanContext.Provider
      value={{
        profile,
        setPlan,
        setRole,
        setHardware,
        setObjective,
        useSimulation,
        canSimulate,
        remainingSimulations,
        isProOrAbove,
        isTeamOrAbove,
      }}
    >
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}
