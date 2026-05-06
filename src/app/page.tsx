"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Cpu, Zap, BarChart2, Users, ArrowRight, Check,
  TrendingUp, Lock, FlaskConical, ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Footer } from "@/components/Footer";

const STATS = [
  { value: "4,200+", label: "Benchmarks validados" },
  { value: "38",     label: "Plataformas de hardware" },
  { value: "99.1%",  label: "Precisão das estimativas" },
  { value: "850+",   label: "Engenheiros ativos" },
];

const FEATURES = [
  {
    icon: FlaskConical,
    title: "Benchmark no Seu Hardware",
    description: "Execute benchmarks reais no seu dispositivo: tokens/s, latência p50/p95/p99, consumo e acurácia — não estimativas, dados reais com perplexidade, MMLU e LLM-as-Judge.",
    badge: "Free",
    href: "/benchmark",
    featured: true,
  },
  {
    icon: BarChart2,
    title: "Rankings Validados",
    description: "Dados filtráveis por hardware, modelo e técnica. Validados em produção pela comunidade.",
    badge: "Free",
    href: "/dashboard",
  },
  {
    icon: Zap,
    title: "Simulador de Viabilidade",
    description: "Estimativas de tokens/s, consumo e acurácia antes de qualquer deploy.",
    badge: "3/mês Free",
    href: "/simulator",
  },
  {
    icon: Cpu,
    title: "Motor de Otimização",
    description: "Scripts prontos com flags de quantização e runtime para seu hardware.",
    badge: "Pro",
    href: "/simulator",
  },
  {
    icon: Users,
    title: "Comunidade Técnica",
    description: "Fóruns por hardware. Reputação baseada em benchmarks reproduzidos.",
    badge: "Free",
    href: "/community",
  },
  {
    icon: TrendingUp,
    title: "Analytics & Telemetria",
    description: "Compare estimativas vs. resultados reais. Relatórios para equipes.",
    badge: "Pro",
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
  { plan: "Free",  price: "R$ 0",        features: ["3 simulações/mês", "Benchmarks públicos", "Comunidade básica"] },
  { plan: "Pro",   price: "$29 / mês",   features: ["Simulações ilimitadas", "Exportação CI/CD", "Suporte 24h"], highlight: true },
  { plan: "Team",  price: "$79 / usuário", features: ["Tudo do Pro", "API de benchmarking", "Dashboard de equipe"] },
];

export default function HomePage() {
  const [, setVideoOpen] = useState(false);
  void setVideoOpen;

  return (
    <div className="min-h-[100dvh]">
      {/* Announcement bar */}
      <div className="border-b border-zinc-800 bg-zinc-950 px-4 py-2.5">
        <p className="text-center text-xs text-zinc-500">
          <span className="text-brand-400 font-medium">Novo:</span>{" "}
          Suporte a Llama 3.3 70B no Jetson AGX Orin com TensorRT-LLM.{" "}
          <Link href="/dashboard" className="text-zinc-300 underline underline-offset-2 hover:text-zinc-100 transition-colors">
            Ver benchmark
          </Link>
        </p>
      </div>

      {/* Landing nav */}
      <nav className="sticky top-0 z-40 border-b border-zinc-800/50 bg-zinc-950/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/15 ring-1 ring-brand-500/30">
              <Cpu size={14} className="text-brand-400" />
            </div>
            <span className="font-mono text-sm font-bold tracking-tight text-zinc-100">
              Edge<span className="text-brand-400">Bench</span>
            </span>
          </div>
          <div className="hidden items-center gap-5 text-sm text-zinc-500 md:flex">
            <Link href="/dashboard"  className="transition-colors hover:text-zinc-200">Benchmarks</Link>
            <Link href="/pricing"    className="transition-colors hover:text-zinc-200">Preços</Link>
            <Link href="/community"  className="transition-colors hover:text-zinc-200">Comunidade</Link>
            <Link href="/sobre"      className="transition-colors hover:text-zinc-200">Sobre</Link>
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

      {/* ── Hero — Asymmetric split ── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_-10%_-10%,rgba(34,163,107,0.10),transparent_60%)]" />

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-20 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:py-28">
          {/* Left column */}
          <div className="flex flex-col justify-center">
            <Badge variant="green" className="mb-6 w-fit text-xs">
              #1 Plataforma de Edge AI Benchmarking
            </Badge>

            <h1 className="text-4xl font-bold tracking-tight text-zinc-100 md:text-5xl lg:text-[3.5rem] lg:leading-[1.1]">
              Benchmarks de LLMs para{" "}
              <span className="text-gradient">edge computing</span>{" "}
              que realmente importam
            </h1>

            <p className="mt-6 max-w-lg text-base leading-relaxed text-zinc-400">
              Do Jetson Orin ao ESP32. Descubra o modelo certo para seu hardware,
              simule viabilidade antes do deploy e valide resultados com a
              comunidade técnica mais rigorosa do Brasil.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/benchmark">
                <Button variant="primary" size="lg">
                  <FlaskConical size={15} />
                  Executar benchmark local
                  <ArrowRight size={15} />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="secondary" size="lg">
                  Ver benchmarks públicos
                </Button>
              </Link>
            </div>

            <p className="mt-5 text-xs text-zinc-600">
              Free para sempre em benchmarks públicos · Pro a partir de $29/mês
            </p>
          </div>

          {/* Right column — Terminal */}
          <div className="flex items-center">
            <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 shadow-tinted overflow-hidden animate-in stagger-2">
              <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-brand-500/60" />
                <span className="ml-2 font-mono text-xs text-zinc-600">edgebench-agent</span>
              </div>
              <div className="p-5 font-mono text-sm space-y-1.5">
                <p className="text-zinc-600 text-xs"># instale uma vez</p>
                <p className="text-zinc-400">$ curl -sSL https://get.edgebench.io | sh</p>
                <p className="text-zinc-500 text-xs pl-2">✓ edgebench-agent v0.1.0 instalado</p>

                <p className="text-zinc-400 pt-1">$ edgebench agent start</p>
                <p className="text-zinc-500 text-xs pl-2">✓ Agente rodando em localhost:4242</p>
                <p className="text-zinc-500 text-xs pl-2">✓ Hardware: Jetson Orin Nano · 8 GB · 10W</p>
                <p className="text-zinc-500 text-xs pl-2">✓ Runtimes: llama.cpp · TensorRT-LLM</p>

                <div className="pt-2 rounded-xl bg-zinc-800/60 p-3 space-y-1">
                  <p className="text-brand-400 text-xs font-medium">[OK] Llama-3-8B · 10 runs concluídos</p>
                  <p className="text-zinc-300 text-xs">
                    tok/s: <span className="text-brand-400">39.2</span> (σ 2.1) ·
                    p50: <span className="text-sky-400">25ms</span> ·
                    p95: <span className="text-sky-400">31ms</span>
                  </p>
                  <p className="text-zinc-300 text-xs">
                    consumo: <span className="text-amber-400">9.1 W</span> ·
                    MMLU: <span className="text-brand-400">68.4%</span> ·
                    ppl: <span className="text-brand-400">11.3</span>
                  </p>
                </div>
                <p className="text-zinc-600 text-xs pt-1">Resultados sincronizados ✓</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <div className="border-y border-zinc-800 bg-zinc-900/30">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          <div className="grid grid-cols-2 divide-x divide-zinc-800 md:grid-cols-4">
            {STATS.map((s, i) => (
              <div key={s.label} className={`px-8 py-10 ${i > 0 ? "" : ""}`}>
                <div className="text-2xl font-bold tracking-tight text-zinc-100">{s.value}</div>
                <div className="mt-1 text-sm text-zinc-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Features — Asymmetric Bento ── */}
      <section className="py-24 px-4 lg:px-8">
        <div className="mx-auto max-w-7xl">

          <div className="mb-14">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-100">
              Do benchmark ao deploy — tudo integrado
            </h2>
            <p className="mt-3 max-w-xl text-zinc-500">
              Plataforma para engenheiros que não podem errar na escolha do modelo.
            </p>
          </div>

          {/* Row 1: featured (2/3) + 2 stacked (1/3) */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Featured card */}
            <Link
              href={FEATURES[0].href}
              className="group lg:col-span-2 rounded-2xl border border-brand-800/40 bg-brand-950/20 p-8 ring-1 ring-brand-500/10 transition-all duration-200 hover:ring-brand-500/30 flex flex-col gap-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/20">
                  <FlaskConical size={20} className="text-brand-400" />
                </div>
                <Badge variant="green" className="text-[10px]">Free</Badge>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-100">{FEATURES[0].title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{FEATURES[0].description}</p>
              </div>
              <span className="mt-auto flex items-center gap-1.5 text-xs font-medium text-brand-400 transition-transform group-hover:translate-x-0.5">
                Executar benchmark <ArrowUpRight size={12} />
              </span>
            </Link>

            {/* Stacked pair */}
            <div className="flex flex-col gap-4">
              {FEATURES.slice(1, 3).map((f) => (
                <Link
                  key={f.title}
                  href={f.href}
                  className="group flex-1 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900 flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800">
                      <f.icon size={16} className="text-brand-400" />
                    </div>
                    <span className="text-[10px] text-zinc-600 font-mono">{f.badge}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-200">{f.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-500">{f.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Row 2: 3 equal but left-aligned text, not centered */}
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.slice(3).map((f) => (
              <Link
                key={f.title}
                href={f.href}
                className="group rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800">
                    <f.icon size={16} className="text-brand-400" />
                  </div>
                  <span className="text-[10px] text-zinc-600 font-mono">{f.badge}</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">{f.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-500">{f.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing preview — left-aligned ── */}
      <section className="border-y border-zinc-800 py-20 px-4 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-100">Preços simples</h2>
            <p className="mt-2 text-zinc-500">Comece grátis. Upgrade quando precisar de mais poder.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {PRICING_PREVIEW.map((p) => (
              <div
                key={p.plan}
                className={`rounded-2xl border p-6 flex flex-col gap-5 ${
                  p.highlight
                    ? "border-brand-700/60 bg-brand-950/20 ring-1 ring-brand-500/20"
                    : "border-zinc-800 bg-zinc-900/50"
                }`}
              >
                <div>
                  {p.highlight && (
                    <Badge variant="green" className="mb-3 text-[10px]">Mais popular</Badge>
                  )}
                  <div className="text-sm font-medium text-zinc-400">{p.plan}</div>
                  <div className="mt-1 text-2xl font-bold tracking-tight text-zinc-100">{p.price}</div>
                </div>
                <ul className="space-y-2 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-zinc-400">
                      <Check size={13} className="text-brand-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Link href="/pricing">
              <Button variant="secondary" size="md">
                Ver comparação completa de planos <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials — 2-col asymmetric ── */}
      <section className="py-24 px-4 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-100">
              Confiado por engenheiros de edge AI
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Large featured testimonial */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 flex flex-col justify-between gap-8">
              <p className="text-base leading-relaxed text-zinc-300">
                &ldquo;{TESTIMONIALS[0].quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-sm font-bold text-brand-300">
                  {TESTIMONIALS[0].initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-zinc-200">{TESTIMONIALS[0].name}</div>
                  <div className="text-xs text-zinc-500">{TESTIMONIALS[0].role}</div>
                </div>
              </div>
            </div>

            {/* Stack of 2 smaller */}
            <div className="flex flex-col gap-6">
              {TESTIMONIALS.slice(1).map((t) => (
                <div key={t.name} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 flex flex-col justify-between gap-5 flex-1">
                  <p className="text-sm leading-relaxed text-zinc-400">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-300">
                      {t.initials}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-zinc-200">{t.name}</div>
                      <div className="text-xs text-zinc-500">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Final — left-aligned, not centered ── */}
      <section className="py-20 px-4 lg:px-8 border-t border-zinc-800">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-zinc-100">
                Pronto para otimizar seus modelos?
              </h2>
              <p className="mt-4 max-w-lg text-zinc-400 leading-relaxed">
                Junte-se a 850+ engenheiros que economizam semanas de trabalho por mês.
                Grátis para sempre em benchmarks públicos.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/onboarding">
                  <Button variant="primary" size="lg">
                    Começar grátis <ArrowRight size={15} />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="secondary" size="lg">Ver planos Pro</Button>
                </Link>
              </div>
              <div className="mt-6 flex items-center gap-6 text-xs text-zinc-600">
                <span className="flex items-center gap-1.5"><Check size={11} className="text-brand-500" /> Sem cartão de crédito</span>
                <span className="flex items-center gap-1.5"><Check size={11} className="text-brand-500" /> Trial de 14 dias</span>
                <span className="flex items-center gap-1.5"><Lock size={11} className="text-brand-500" /> LGPD compliant</span>
              </div>
            </div>

            {/* Right: quick metrics preview */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Benchmarks em destaque</p>
              {[
                { model: "Llama-3-8B", hw: "Jetson Orin Nano", tps: "39.2", latency: "25ms", badge: "INT4" },
                { model: "TinyLlama-1.1B", hw: "Raspberry Pi 5", tps: "12.8", latency: "78ms", badge: "INT8" },
                { model: "Phi-3 Mini", hw: "MacBook M2", tps: "67.4", latency: "15ms", badge: "FP16" },
              ].map((r, i) => (
                <div key={i} className="flex items-center justify-between border-t border-zinc-800 pt-4 first:border-0 first:pt-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-zinc-200">{r.model}</span>
                      <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500">{r.badge}</span>
                    </div>
                    <div className="mt-0.5 text-xs text-zinc-600">{r.hw}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-medium text-brand-400">{r.tps} tok/s</div>
                    <div className="text-xs text-zinc-600">{r.latency} p50</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
