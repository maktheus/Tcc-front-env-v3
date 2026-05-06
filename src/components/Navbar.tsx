"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cpu, Zap, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { UpgradeModal } from "@/components/UpgradeModal";
import { usePlan } from "@/lib/planContext";

const NAV_LINKS = [
  { href: "/dashboard",  label: "Benchmarks" },
  { href: "/benchmark",  label: "Executar" },
  { href: "/simulator",  label: "Simulador" },
  { href: "/community",  label: "Comunidade" },
  { href: "/analytics",  label: "Analytics" },
  { href: "/pricing",    label: "Preços" },
];

const PLAN_BADGE: Record<string, { label: string; variant: "gray" | "blue" | "green" | "yellow" }> = {
  free:       { label: "Free",       variant: "gray"  },
  pro:        { label: "Pro",        variant: "blue"  },
  team:       { label: "Team",       variant: "green" },
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
      <nav className="sticky top-0 z-40 border-b border-zinc-800/60 bg-zinc-950/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 lg:px-6">

          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/15 ring-1 ring-brand-500/30">
              <Cpu size={14} className="text-brand-400" />
            </div>
            <span className="font-mono text-sm font-bold tracking-tight text-zinc-100">
              Edge<span className="text-brand-400">Bench</span>
            </span>
          </Link>

          <div className="hidden items-center gap-0.5 md:flex">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors duration-150 ${
                  pathname.startsWith(l.href)
                    ? "bg-zinc-800 text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-200"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Badge variant={planBadge.variant}>{planBadge.label}</Badge>
              {!isProOrAbove && (
                <span>{profile.simulationsUsed}/{profile.simulationsLimit} sim.</span>
              )}
            </div>
            {!isProOrAbove ? (
              <Button variant="upgrade" size="sm" onClick={() => setUpgradeOpen(true)}>
                <Zap size={12} /> Upgrade
              </Button>
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500/20 text-xs font-bold text-brand-300 ring-1 ring-brand-500/30">
                E
              </div>
            )}
          </div>

          <button
            className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-zinc-800 bg-zinc-950 px-4 pb-4 pt-2 md:hidden">
            <div className="flex flex-col gap-0.5">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    pathname.startsWith(l.href) ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
            </div>
            {!isProOrAbove && (
              <Button
                variant="upgrade"
                size="sm"
                className="mt-3 w-full"
                onClick={() => { setMobileOpen(false); setUpgradeOpen(true); }}
              >
                <Zap size={12} /> Upgrade para Pro
              </Button>
            )}
          </div>
        )}
      </nav>
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </>
  );
}
