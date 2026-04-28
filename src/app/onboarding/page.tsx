"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Cpu, User, Target, ChevronRight, CheckCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { usePlan } from "@/lib/planContext";
import { HARDWARE_PROFILES } from "@/lib/data";
import Link from "next/link";

const ROLES = [
  {
    id: "engineer",
    label: "Engenheiro Embarcado",
    description: "Otimizo modelos para hardware com restrições de memória, energia e latência.",
    icon: "⚙️",
  },
  {
    id: "researcher",
    label: "Pesquisador",
    description: "Publico e reproduzo benchmarks. Busco rigor científico e reprodutibilidade.",
    icon: "🔬",
  },
  {
    id: "pm",
    label: "Product Manager",
    description: "Preciso de estimativas de viabilidade para decisões de produto e ROI.",
    icon: "📊",
  },
] as const;

const OBJECTIVES = [
  { id: "latency", label: "Minimizar latência", desc: "Tempo de resposta é crítico", icon: "⚡" },
  { id: "energy", label: "Reduzir consumo", desc: "Energia é o principal gargalo", icon: "🔋" },
  { id: "accuracy", label: "Maximizar precisão", desc: "Acurácia não pode ser comprometida", icon: "🎯" },
];

const STEPS = [
  { id: 1, label: "Perfil", icon: User },
  { id: 2, label: "Hardware", icon: Cpu },
  { id: 3, label: "Objetivo", icon: Target },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { setRole, setHardware, setObjective } = usePlan();
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedHardware, setSelectedHardware] = useState<string | null>(null);
  const [selectedObjective, setSelectedObjective] = useState<string | null>(null);

  const handleNext = () => {
    if (step === 1 && selectedRole) {
      setRole(selectedRole as "engineer" | "researcher" | "pm");
      setStep(2);
    } else if (step === 2 && selectedHardware) {
      setHardware(selectedHardware);
      setStep(3);
    } else if (step === 3 && selectedObjective) {
      setObjective(selectedObjective);
      router.push("/dashboard");
    }
  };

  const canProceed =
    (step === 1 && !!selectedRole) ||
    (step === 2 && !!selectedHardware) ||
    (step === 3 && !!selectedObjective);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-950 px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/20">
              <Cpu size={14} className="text-brand-400" />
            </div>
            <span className="font-mono text-sm font-bold text-zinc-100">
              Edge<span className="text-brand-400">Bench</span>
            </span>
          </Link>
          <Badge variant="gray" className="text-xs">Onboarding</Badge>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Progress */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2 flex-1">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all text-sm font-bold ${
                    step > s.id
                      ? "border-brand-500 bg-brand-500 text-white"
                      : step === s.id
                      ? "border-brand-500 bg-brand-500/10 text-brand-400"
                      : "border-zinc-700 bg-zinc-900 text-zinc-600"
                  }`}>
                    {step > s.id ? <CheckCircle size={16} /> : s.id}
                  </div>
                  <span className={`text-sm hidden sm:block ${step >= s.id ? "text-zinc-300" : "text-zinc-600"}`}>
                    {s.label}
                  </span>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-3 ${step > s.id ? "bg-brand-500" : "bg-zinc-800"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Role */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-zinc-100 mb-2">Qual é seu perfil?</h2>
              <p className="text-zinc-500 mb-8">Personalizamos a experiência para sua jornada.</p>
              <div className="space-y-3">
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRole(r.id)}
                    className={`w-full flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                      selectedRole === r.id
                        ? "border-brand-500 bg-brand-500/10"
                        : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                    }`}
                  >
                    <span className="text-2xl">{r.icon}</span>
                    <div>
                      <div className="font-semibold text-zinc-100">{r.label}</div>
                      <div className="text-sm text-zinc-500">{r.description}</div>
                    </div>
                    {selectedRole === r.id && (
                      <CheckCircle size={18} className="text-brand-400 ml-auto flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Hardware */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-zinc-100 mb-2">Qual é seu hardware alvo?</h2>
              <p className="text-zinc-500 mb-8">Usaremos isso para filtrar benchmarks relevantes e calibrar estimativas.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {HARDWARE_PROFILES.map((hw) => (
                  <button
                    key={hw.id}
                    onClick={() => setSelectedHardware(hw.id)}
                    className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                      selectedHardware === hw.id
                        ? "border-brand-500 bg-brand-500/10"
                        : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                    }`}
                  >
                    <Cpu size={18} className={`mt-0.5 flex-shrink-0 ${selectedHardware === hw.id ? "text-brand-400" : "text-zinc-600"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-zinc-100 text-sm">{hw.name}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">{hw.chip}</div>
                      <div className="flex gap-2 mt-1.5">
                        <span className="text-[10px] bg-zinc-800 text-zinc-400 rounded px-1.5 py-0.5">{hw.ram} RAM</span>
                        <span className="text-[10px] bg-zinc-800 text-zinc-400 rounded px-1.5 py-0.5">{hw.tdp} TDP</span>
                      </div>
                    </div>
                    {selectedHardware === hw.id && (
                      <CheckCircle size={16} className="text-brand-400 flex-shrink-0 mt-0.5" />
                    )}
                  </button>
                ))}
              </div>
              <p className="text-xs text-zinc-600 mt-4">
                Não encontrou seu hardware?{" "}
                <button className="underline hover:text-zinc-400">Adicionar manualmente</button>
              </p>
            </div>
          )}

          {/* Step 3: Objective */}
          {step === 3 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-zinc-100 mb-2">Qual é seu objetivo principal?</h2>
              <p className="text-zinc-500 mb-8">Priorizamos as métricas mais relevantes no seu dashboard.</p>
              <div className="space-y-3">
                {OBJECTIVES.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => setSelectedObjective(o.id)}
                    className={`w-full flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                      selectedObjective === o.id
                        ? "border-brand-500 bg-brand-500/10"
                        : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                    }`}
                  >
                    <span className="text-2xl">{o.icon}</span>
                    <div>
                      <div className="font-semibold text-zinc-100">{o.label}</div>
                      <div className="text-sm text-zinc-500">{o.desc}</div>
                    </div>
                    {selectedObjective === o.id && (
                      <CheckCircle size={18} className="text-brand-400 ml-auto flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-6 rounded-xl border border-brand-500/30 bg-brand-500/5 p-4">
                <div className="flex items-start gap-3">
                  <Zap size={16} className="text-brand-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-zinc-200">Dica Pro</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Com o plano Pro, o motor de otimização usa suas preferências para sugerir configurações automáticas de quantização e runtime — economizando horas de experimentação.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            {step > 1 ? (
              <Button variant="ghost" onClick={() => setStep(step - 1)}>
                Voltar
              </Button>
            ) : (
              <Link href="/">
                <Button variant="ghost">Cancelar</Button>
              </Link>
            )}
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={!canProceed}
              className="min-w-[140px]"
            >
              {step === 3 ? "Ir para Dashboard" : "Continuar"}
              <ChevronRight size={16} />
            </Button>
          </div>

          {step === 1 && (
            <p className="mt-4 text-center text-xs text-zinc-700">
              Você pode alterar seu perfil a qualquer momento nas configurações.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
