"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Check, Zap } from "lucide-react";
import { usePlan } from "@/lib/planContext";
import { useRouter } from "next/navigation";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  feature?: string;
  reason?: string;
}

const PRO_HIGHLIGHTS = [
  "Simulações ilimitadas por mês",
  "Comparador de até 5 modelos lado a lado",
  "Exportação de configs para CI/CD",
  "Telemetria avançada de deploy",
  "Analytics com relatórios PDF",
  "Suporte prioritário em 24h",
];

export function UpgradeModal({ open, onClose, feature, reason }: UpgradeModalProps) {
  const { setPlan } = usePlan();
  const router = useRouter();

  const handleUpgrade = () => {
    setPlan("pro");
    onClose();
    router.push("/dashboard");
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-900/40">
          <Zap className="text-white" size={28} />
        </div>
        <h3 className="text-xl font-bold text-zinc-100">
          {feature ? `Desbloqueie: ${feature}` : "Desbloqueie o EdgeBench Pro"}
        </h3>
        <p className="mt-2 text-sm text-zinc-400">
          {reason || "Você atingiu o limite do plano gratuito. Faça upgrade para continuar sem interrupções."}
        </p>

        <div className="mt-6 space-y-2 text-left">
          {PRO_HIGHLIGHTS.map((h) => (
            <div key={h} className="flex items-center gap-3">
              <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-500/20">
                <Check size={12} className="text-brand-400" />
              </div>
              <span className="text-sm text-zinc-300">{h}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl bg-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-zinc-100">$29</span>
              <span className="text-sm text-zinc-400">/mês</span>
            </div>
            <div className="text-right">
              <div className="text-xs text-brand-400 font-semibold">ECONOMIZE 20%</div>
              <div className="text-sm text-zinc-400">$23/mês anual</div>
            </div>
          </div>
          <div className="mt-1 text-xs text-zinc-500">14 dias grátis, cancele quando quiser</div>
        </div>

        <div className="mt-4 space-y-2">
          <Button variant="upgrade" size="lg" className="w-full" onClick={handleUpgrade}>
            <Zap size={16} />
            Iniciar teste grátis de 14 dias
          </Button>
          <Button variant="ghost" size="sm" className="w-full" onClick={() => { onClose(); router.push("/pricing"); }}>
            Ver todos os planos
          </Button>
        </div>
        <p className="mt-3 text-xs text-zinc-600">Sem contrato, sem cartão de crédito necessário para o trial.</p>
      </div>
    </Modal>
  );
}
