"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cpu, ChevronDown, Zap, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { UpgradeModal } from "@/components/UpgradeModal";
import { usePlan } from "@/lib/planContext";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/benchmark", label: "Benchmark" },
  { href: "/simulator", label: "Simulador" },
  { href: "/community", label: "Comunidade" },
  { href: "/analytics", label: "Analytics" },
  { href: "/sobre", label: "Sobre" },
  { href: "/pricing", label: "Preços" },
];

const PLAN_BADGE: Record<string, { label: string; variant: "gray" | "blue" | "purple" | "yellow" }> = {
  free:       { label: "Free",       variant: "gray" },
  pro:        { label: "Pro",        variant: "blue" },
  team:       { label: "Team",       variant: "purple" },
  enterprise: { label: "Enterprise", variant: "yellow" },
};

export function Navbar() {
  const pathname = usePathname();
  const { profile, isProOrAbove } = usePlan();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const planBadge = PLAN_BADGE[profile.plan];

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 lg:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/20 ring-1 ring-brand-500/40">
              <Cpu size={16} className="text-brand-400" />
            </div>
            <span className="font-mono text-base font-bold text-zinc-100">
              Edge<span className="text-brand-400">Bench</span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  pathname.startsWith(l.href)
                    ? "bg-zinc-800 text-zinc-100"
                    : "text-zinc-400 hover:text-zinc-100"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <div className="flex items-center gap-2">
              <Badge variant={planBadge.variant}>{planBadge.label}</Badge>
              {!isProOrAbove && (
                <span className="text-xs text-zinc-500">
                  {profile.simulationsUsed}/{profile.simulationsLimit} sim
                </span>
              )}
            </div>
            {!isProOrAbove ? (
              <Button variant="upgrade" size="sm" onClick={() => setUpgradeOpen(true)}>
                <Zap size={13} /> Upgrade
              </Button>
            ) : (
              <button className="flex items-center gap-1.5 rounded-full bg-zinc-800 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-700">
                <span className="h-5 w-5 rounded-full bg-brand-500/40 text-xs flex items-center justify-center text-brand-300 font-bold">E</span>
                engenheiro
                <ChevronDown size={14} />
              </button>
            )}
          </div>

          <button className="md:hidden text-zinc-400 hover:text-zinc-100" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-zinc-800 bg-zinc-950 px-4 py-3 md:hidden">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block py-2.5 text-sm text-zinc-300 hover:text-zinc-100"
                onClick={() => setMobileOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            {!isProOrAbove && (
              <Button variant="upgrade" size="sm" className="mt-2 w-full" onClick={() => { setMobileOpen(false); setUpgradeOpen(true); }}>
                <Zap size={13} /> Upgrade para Pro
              </Button>
            )}
          </div>
        )}
      </nav>
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </>
  );
}
