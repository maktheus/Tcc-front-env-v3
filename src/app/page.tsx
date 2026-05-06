"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Cpu, Zap, BarChart2, Users, Shield, ArrowRight, Check, ChevronRight,
  Star, TrendingUp, Globe, Lock, FlaskConical,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Footer } from "@/components/Footer";

const STATS = [
  { value: "4,200+", label: "Benchmarks validados" },
  { value: "38", label: "Plataformas de hardware" },
  { value: "99.1%", label: "Precisão das estimativas" },
  { value: "850+", label: "Engenheiros ativos" },
];

const FEATURES = [
  {
    icon: FlaskConical,
    title: "Benchmark no Seu Hardware",
    description: "Execute benchmarks reais no seu dispositivo: tokens/s, latência p50/p95/p99, consumo e acurácia — não estimativas, dados reais.",
    badge: "Free",
    badgeVariant: "green" as const,
    href: "/benchmark",
  },
  {
    icon: BarChart2,
    title: "Benchmarks Públicos Validados",
    description: "Rankings filtráveis por hardware, modelo, técnica de otimização e métrica. Dados validados em produção.",
    badge: "Free",
    badgeVariant: "gray" as const,
    href: "/dashboard",
  },
  {
    icon: Zap,
    title: "Simulador de Viabilidade",
    description: "Informe seu hardware e restrições; receba estimativas de tokens/s, consumo e acurácia antes de qualquer deploy.",
    badge: "3/mês Free · Ilimitado Pro",
    badgeVariant: "blue" as const,
    href: "/simulator",
  },
  {
    icon: Cpu,
    title: "Motor de Otimização",
    description: "Scripts prontos com flags de quantização, pruning e runtime configurados para seu hardware específico.",
    badge: "Pro",
    badgeVariant: "blue" as const,
    href: "/simulator",
  },
  {
    icon: Users,
    title: "Comunidade Técnica",
    description: "Fóruns segmentados por hardware e modelo. Sistema de reputação baseado em benchmarks reproduzidos.",
    badge: "Free",
    badgeVariant: "gray" as const,
    href: "/community",
  },
  {
    icon: TrendingUp,
    title: "Analytics & Telemetria",
    description: "Compare estimativas vs. resultados reais após deploy. Relatórios exportáveis em PDF para equipes.",
    badge: "Pro",
    badgeVariant: "blue" as const,
    href: "/analytics",
  },
];

const TESTIMONIALS = [
  {
    quote: "Reduzi o tempo de viabilidade de 3 semanas para 2 horas. A estimativa INT4+TensorRT ficou dentro de 8% do resultado real.",
    name: "Rafael Lima",
    role: "ML Engineer · NVIDIA Partner",
    initials: "RL",
  },
  {
    quote: "A comunidade foi o que me faltava. Reproduzir um benchmark no Jetson Orin Nano e receber feedback em 1 hora é incrível.",
    name: "Ana Souza",
    role: "Pesquisadora · UFMG",
    initials: "AS",
  },
  {
    quote: "O plano Team substituiu 3 ferramentas que usávamos. O CI/CD integration com GitHub Actions salvou nosso pipeline.",
    name: "Juliana Costa",
    role: "CTO · EmbedAI Solutions",
    initials: "JC",
  },
];

const PRICING_PREVIEW = [
  { plan: "Free", price: "R$0", features: ["3 simulações/mês", "Benchmarks públicos", "Comunidade básica"] },
  { plan: "Pro", price: "$29/mês", features: ["Simulações ilimitadas", "Exportação CI/CD", "Suporte 24h"], highlight: true },
  { plan: "Team", price: "$79/usuário", features: ["Tudo do Pro", "API de benchmarking", "Dashboard de equipe"] },
];

export default function HomePage() {
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <div className="border-b border-zinc-800 bg-zinc-950 px-4 py-2.5 text-center">
        <p className="text-xs text-zinc-400">
          <span className="text-brand-400 font-semibold">Novo:</span> Suporte a Llama 3.3 70B no Jetson AGX Orin com TensorRT-LLM.{" "}
          <Link href="/dashboard" className="underline hover:text-zinc-200">Ver benchmark →</Link>
        </p>
      </div>

      {/* Navbar mínima para landing */}
      <nav className="sticky top-0 z-40 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/20 ring-1 ring-brand-500/40">
              <Cpu size={16} className="text-brand-400" />
            </div>
            <span className="font-mono text-base font-bold text-zinc-100">
              Edge<span className="text-brand-400">Bench</span>
            </span>
          </div>
          <div className="hidden items-center gap-4 md:flex text-sm text-zinc-400">
            <Link href="/dashboard" className="hover:text-zinc-100">Benchmarks</Link>
            <Link href="/pricing" className="hover:text-zinc-100">Preços</Link>
            <Link href="/community" className="hover:text-zinc-100">Comunidade</Link>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="secondary" size="sm">Entrar</Button>
            </Link>
            <Link href="/onboarding">
              <Button variant="primary" size="sm">Começar grátis</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pb-24 pt-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-20%,rgba(34,163,107,0.15),transparent_70%)]" />
        <div className="mx-auto max-w-4xl px-4 text-center">
          <Badge variant="green" className="mb-6 text-xs">
            <Star size={10} /> #1 Plataforma de Edge AI Benchmarking
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-100 sm:text-5xl lg:text-6xl">
            Benchmark de LLMs para{" "}
            <span className="text-gradient">edge computing</span>{" "}
            que realmente importa
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400 leading-relaxed">
            Do Jetson Orin ao ESP32. Descubra o modelo certo para seu hardware,
            simule viabilidade antes do deploy e valide resultados reais com a
            comunidade técnica mais rigorosa do Brasil.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/benchmark">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                <FlaskConical size={16} /> Executar benchmark local
                <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Ver benchmarks públicos
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-xs text-zinc-600">
            Free para sempre em benchmarks públicos · Pro a partir de $29/mês
          </p>
        </div>

        {/* Terminal mockup */}
        <div className="mx-auto mt-16 max-w-3xl px-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl glow-green overflow-hidden">
            <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-red-500/70" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
              <div className="h-3 w-3 rounded-full bg-green-500/70" />
              <span className="ml-2 text-xs text-zinc-600 font-mono">edgebench benchmark</span>
            </div>
            <div className="p-5 font-mono text-sm space-y-1">
              <p className="text-zinc-500">$ edgebench benchmark --model llama-3-8b --hw jetson-orin-nano --iter 10</p>
              <p className="text-zinc-400 mt-3">[FASE 1/3] Verificando ambiente... ✓</p>
              <p className="text-zinc-400">[FASE 2/3] Warmup (3 runs)... ✓</p>
              <p className="text-zinc-400">[FASE 3/3] Inferência — coletando métricas...</p>
              <p className="text-zinc-500 text-xs ml-2">  Run 1/10 → 38 tok/s | 26ms</p>
              <p className="text-zinc-500 text-xs ml-2">  Run 2/10 → 41 tok/s | 24ms</p>
              <p className="text-zinc-500 text-xs ml-2">  ...</p>
              <div className="mt-3 rounded-lg bg-zinc-800/60 p-3 space-y-1">
                <p className="text-brand-400 font-semibold">[OK] Benchmark concluído (10 iterações)</p>
                <p className="text-zinc-300">Tokens/s:    <span className="text-brand-400">39.2</span> (min 36 · max 43 · σ 2.1)</p>
                <p className="text-zinc-300">Latência p50:<span className="text-blue-400"> 25ms</span>  p95: <span className="text-blue-400">31ms</span></p>
                <p className="text-zinc-300">Consumo:     <span className="text-yellow-400">9.1W</span></p>
                <p className="text-zinc-300">Acurácia:    <span className="text-purple-400">98.8%</span> vs baseline FP32</p>
              </div>
              <p className="text-zinc-600 text-xs mt-2">Resultados salvos · Publicar na comunidade? [s/N]</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-zinc-800 bg-zinc-900/30 py-12">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-extrabold text-zinc-100">{s.value}</div>
                <div className="mt-1 text-sm text-zinc-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-zinc-100">
              Tudo que você precisa, do benchmark ao deploy
            </h2>
            <p className="mt-3 text-zinc-500">
              Plataforma integrada para engenheiros que não podem errar na escolha do modelo.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Link key={f.title} href={f.href}>
                <Card
                  hover
                  className={`flex flex-col gap-3 h-full transition-all ${
                    i === 0
                      ? "border-brand-700/60 bg-brand-950/20 ring-1 ring-brand-500/20 hover:ring-brand-500/40"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${i === 0 ? "bg-brand-500/20" : "bg-zinc-800"}`}>
                      <f.icon size={20} className={i === 0 ? "text-brand-400" : "text-brand-400"} />
                    </div>
                    <Badge variant={f.badgeVariant} className="text-[10px]">{f.badge}</Badge>
                  </div>
                  <h3 className="font-semibold text-zinc-100">{f.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{f.description}</p>
                  {i === 0 && (
                    <span className="mt-auto text-xs text-brand-400 flex items-center gap-1">
                      Executar benchmark <ChevronRight size={11} />
                    </span>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="py-20 px-4 bg-zinc-900/30 border-y border-zinc-800">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-zinc-100">Preços simples e transparentes</h2>
            <p className="mt-3 text-zinc-500">Comece grátis. Faça upgrade quando precisar de mais poder.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {PRICING_PREVIEW.map((p) => (
              <div
                key={p.plan}
                className={`rounded-2xl border p-6 ${
                  p.highlight
                    ? "border-brand-500 bg-brand-500/5 shadow-lg shadow-brand-900/20"
                    : "border-zinc-800 bg-zinc-900"
                }`}
              >
                {p.highlight && (
                  <div className="mb-3 text-center">
                    <Badge variant="green" className="text-xs">Mais popular</Badge>
                  </div>
                )}
                <div className="text-lg font-bold text-zinc-100">{p.plan}</div>
                <div className="mt-1 text-2xl font-extrabold text-zinc-100">{p.price}</div>
                <ul className="mt-4 space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-zinc-400">
                      <Check size={14} className="text-brand-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/pricing">
              <Button variant="secondary" size="md">
                Ver comparação completa de planos <ChevronRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-zinc-100">
              Confiado por engenheiros de edge AI
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="flex flex-col justify-between gap-4">
                <div className="flex text-yellow-400 gap-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} size={13} fill="currentColor" />)}
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-sm font-bold text-brand-400">
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-zinc-200">{t.name}</div>
                    <div className="text-xs text-zinc-500">{t.role}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-2xl text-center">
          <div className="rounded-2xl border border-zinc-700 bg-gradient-to-b from-zinc-900 to-zinc-950 p-10 shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/20 ring-1 ring-brand-500/30">
              <Zap size={28} className="text-brand-400" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-100">
              Pronto para otimizar seus modelos?
            </h2>
            <p className="mt-3 text-zinc-400">
              Junte-se a 850+ engenheiros que economizam semanas de trabalho por mês.
              Grátis para sempre em benchmarks públicos.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/onboarding">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  Começar grátis agora
                  <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Ver planos Pro
                </Button>
              </Link>
            </div>
            <div className="mt-6 flex items-center justify-center gap-6 text-xs text-zinc-600">
              <span className="flex items-center gap-1"><Check size={12} className="text-brand-500" /> Sem cartão de crédito</span>
              <span className="flex items-center gap-1"><Check size={12} className="text-brand-500" /> Trial de 14 dias</span>
              <span className="flex items-center gap-1"><Lock size={12} className="text-brand-500" /> LGPD compliant</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
