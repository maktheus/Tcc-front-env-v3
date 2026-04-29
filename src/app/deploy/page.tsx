"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Terminal, CheckCircle, ChevronRight, ChevronLeft,
  Cpu, Package, Zap, GitBranch, AlertTriangle, Copy, Check,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { BENCHMARKS, DEPLOY_STEPS, HARDWARE_PROFILES } from "@/lib/data";

const TARGETS = [
  { id: "jetson-tensorrt", label: "Jetson (TensorRT)", icon: "⚡", compatible: ["b1", "b4", "b7"] },
  { id: "rpi-llamacpp", label: "Raspberry Pi (llama.cpp)", icon: "🍓", compatible: ["b2", "b3", "b8"] },
  { id: "docker", label: "Docker (genérico)", icon: "🐳", compatible: [] },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="absolute top-3 right-3 rounded-md p-1.5 text-zinc-600 hover:bg-zinc-800 hover:text-zinc-300 transition-colors">
      {copied ? <Check size={14} className="text-brand-400" /> : <Copy size={14} />}
    </button>
  );
}

function DeployContent() {
  const params = useSearchParams();
  const router = useRouter();
  const benchmarkId = params.get("benchmark") ?? "";
  const benchmark = BENCHMARKS.find((b) => b.id === benchmarkId);

  const [currentStep, setCurrentStep] = useState(0);
  const [target, setTarget] = useState("jetson-tensorrt");
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const steps = DEPLOY_STEPS[target] ?? DEPLOY_STEPS["jetson-tensorrt"];
  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const markComplete = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    if (!isLastStep) setCurrentStep(currentStep + 1);
    else router.push("/telemetria");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Link href="/simulator" className="text-sm text-zinc-500 hover:text-zinc-300">Simulador</Link>
          <ChevronRight size={14} className="text-zinc-700" />
          <span className="text-sm text-zinc-300">Deploy</span>
        </div>
        <h1 className="text-2xl font-bold text-zinc-100 mb-1">Wizard de Deploy</h1>
        <p className="text-zinc-500 text-sm">
          Guia passo a passo para implantar seu modelo otimizado no hardware real.
          {benchmark && <span> Configuração: <span className="text-zinc-300 font-mono">{benchmark.model} → {benchmark.hardware}</span></span>}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sidebar de navegação */}
        <div className="lg:col-span-1 space-y-4">
          {/* Alvo de deploy */}
          <Card>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Alvo de Deploy</p>
            <div className="space-y-2">
              {TARGETS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setTarget(t.id); setCurrentStep(0); setCompletedSteps([]); }}
                  className={`w-full flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${target === t.id ? "border-brand-500 bg-brand-500/10 text-brand-300" : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600"}`}
                >
                  <span className="text-base">{t.icon}</span>
                  <span>{t.label}</span>
                  {benchmark && t.compatible.includes(benchmark.id) && (
                    <Badge variant="green" className="ml-auto text-[10px]">Compatível</Badge>
                  )}
                </button>
              ))}
            </div>
          </Card>

          {/* Progresso */}
          <Card>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Progresso</p>
            <div className="space-y-2">
              {steps.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentStep(i)}
                  className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${i === currentStep ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
                >
                  <div className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${completedSteps.includes(i) ? "bg-brand-500 text-white" : i === currentStep ? "bg-zinc-700 text-zinc-200" : "bg-zinc-800 text-zinc-600"}`}>
                    {completedSteps.includes(i) ? <CheckCircle size={12} /> : i + 1}
                  </div>
                  <span className="truncate">{s.title}</span>
                </button>
              ))}
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-brand-500 transition-all"
                style={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-zinc-600 mt-1.5">{completedSteps.length}/{steps.length} concluídos</p>
          </Card>

          {benchmark && (
            <Link href={`/benchmark/${benchmark.id}`}>
              <Card hover className="cursor-pointer">
                <p className="text-xs font-semibold text-zinc-500 mb-1">Baseado no benchmark</p>
                <p className="text-sm font-mono font-semibold text-zinc-200">{benchmark.model}</p>
                <p className="text-xs text-zinc-500">{benchmark.hardware}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="gray" className="text-[10px]">{benchmark.tokensPerSec} tok/s</Badge>
                  <Badge variant="gray" className="text-[10px]">{benchmark.energyW}W</Badge>
                </div>
              </Card>
            </Link>
          )}
        </div>

        {/* Conteúdo do passo */}
        <div className="lg:col-span-2">
          <Card className="min-h-[400px] flex flex-col">
            <div className="flex items-start gap-3 mb-5">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400 font-bold text-sm">
                {currentStep + 1}
              </div>
              <div>
                <h2 className="text-lg font-bold text-zinc-100">{step.title}</h2>
                <p className="text-sm text-zinc-400">{step.description}</p>
              </div>
            </div>

            {step.command && (
              <div className="flex-1 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Terminal size={13} className="text-zinc-500" />
                  <span className="text-xs text-zinc-500 font-semibold">Comando</span>
                </div>
                <div className="relative">
                  <pre className="overflow-x-auto rounded-xl bg-zinc-950 border border-zinc-800 p-4 text-xs font-mono text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {step.command}
                  </pre>
                  <CopyButton text={step.command} />
                </div>
              </div>
            )}

            {step.warning && (
              <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-yellow-800/40 bg-yellow-950/20 p-3">
                <AlertTriangle size={14} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-300">{step.warning}</p>
              </div>
            )}

            {step.tip && (
              <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-blue-800/30 bg-blue-950/20 p-3">
                <Zap size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-300"><span className="font-semibold">Dica: </span>{step.tip}</p>
              </div>
            )}

            {isLastStep && (
              <div className="mb-4 rounded-xl border border-brand-700/40 bg-brand-950/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <GitBranch size={15} className="text-brand-400" />
                  <p className="text-sm font-semibold text-zinc-200">Próximo: enviar telemetria</p>
                </div>
                <p className="text-xs text-zinc-500">
                  Registre seus resultados reais e contribua com a precisão do motor de recomendação para toda a comunidade.
                </p>
              </div>
            )}

            <div className="mt-auto flex items-center justify-between pt-4 border-t border-zinc-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                <ChevronLeft size={14} /> Anterior
              </Button>
              <Button variant="primary" size="md" onClick={markComplete}>
                {isLastStep ? (
                  <><GitBranch size={14} /> Concluir e enviar telemetria</>
                ) : (
                  <>Marcar como concluído <ChevronRight size={14} /></>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function DeployPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Suspense fallback={<div className="flex items-center justify-center py-32 text-zinc-500">Carregando...</div>}>
        <DeployContent />
      </Suspense>
      <Footer />
    </div>
  );
}
