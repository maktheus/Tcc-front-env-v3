"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Cpu, Zap, BarChart2, Users, TrendingUp, RefreshCw,
  Database, Shield, ArrowRight, ChevronDown, ChevronUp,
  GitMerge, Layers, Globe, Lock, CheckCircle, AlertCircle,
  FlaskConical, Gauge, Battery, MemoryStick,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

/* ─── DADOS ────────────────────────────────────────────────── */

const FLOW_STEPS = [
  {
    id: 1,
    icon: Users,
    color: "text-blue-400",
    bg: "bg-blue-900/30",
    border: "border-blue-700/40",
    tag: "Entrada",
    title: "Onboarding Contextual",
    summary: "Perfil + hardware + restrições → score de viabilidade inicial",
    details: [
      "Seleção de perfil: Engenheiro Embarcado, Pesquisador ou Product Manager",
      "Especificação do hardware-alvo (Jetson, Raspberry Pi, ESP32) e limites operacionais (RAM, TDP, offline)",
      "Web: importação de repositório GitHub e configuração detalhada",
      "Mobile: login biométrico e scan de QR para vincular dispositivo físico",
      "Resultado imediato: score de viabilidade + sugestões de modelos compatíveis",
    ],
  },
  {
    id: 2,
    icon: BarChart2,
    color: "text-brand-400",
    bg: "bg-brand-900/20",
    border: "border-brand-700/40",
    tag: "Descoberta",
    title: "Exploração de Benchmarks",
    summary: "Feed dinâmico com rankings filtráveis e comparador side-by-side",
    details: [
      "Rankings filtráveis por hardware, modelo (LLM/SLM/VLM), métrica e status de validação",
      "Comparador visual interativo de até 5 modelos (Pro) com visualização de trade-offs",
      "Badges de confiança: Validado em Produção, Reproduzível, Peer-reviewed",
      "Alertas inteligentes para novos benchmarks do hardware/modelo de interesse",
      "Protocolo ALEM: Acurácia · Latência · Energia · Memória — avaliação holística",
    ],
  },
  {
    id: 3,
    icon: Zap,
    color: "text-yellow-400",
    bg: "bg-yellow-900/20",
    border: "border-yellow-700/40",
    tag: "Core",
    title: "Simulador de Viabilidade & Motor de Otimização",
    summary: "3 fontes cruzadas → pipeline passo a passo com scripts prontos",
    details: [
      "Cruza: (1) perfil de hardware, (2) benchmarks históricos ALEM, (3) técnicas de otimização disponíveis",
      "Simulação multi-objetivo: quantização PTQ/QAT, poda estruturada, distilação, compilação por hardware",
      "Output: estimativa de tokens/s, consumo (W), acurácia e scripts prontos (llama.cpp, TensorRT, ONNX)",
      "Ex: 'Llama-3-8B no Jetson Orin Nano <10W' → INT4+TensorRT → 38 tok/s, 9.2W, −1.2% acurácia",
      "Motor aprende com feedback de deploy real (feedback loop) para refinar estimativas futuras",
    ],
  },
  {
    id: 4,
    icon: Cpu,
    color: "text-purple-400",
    bg: "bg-purple-900/20",
    border: "border-purple-700/40",
    tag: "Deploy",
    title: "Implantação, Validação & Telemetria",
    summary: "Artefatos prontos + telemetria opcional que refina o motor",
    details: [
      "Geração de artefatos prontos: Docker, TFLite, ONNX + scripts de validação automáticos",
      "CLI/SDK ou botão 'Deploy' integrado ao fluxo",
      "Telemetria opcional: latência real, consumo medido, temperatura, throttling térmico",
      "Comparação estimativa vs. realidade — detecta desvios e ajusta modelos preditivos",
      "Publicação com 1 clique: badge 'Validado em Produção' + enriquece base de dados pública",
    ],
  },
  {
    id: 5,
    icon: Users,
    color: "text-pink-400",
    bg: "bg-pink-900/20",
    border: "border-pink-700/40",
    tag: "Comunidade",
    title: "Comunidade Técnica",
    summary: "Fóruns segmentados + reputação por contribuições verificáveis",
    details: [
      "Fóruns por hardware, modelo, caso de uso e técnica de otimização",
      "Reputação técnica: badges por benchmark reproduzido, PR validado, revisão por pares",
      "Moderação assistida por IA: detecta benchmarks falsos, spam e código malicioso",
      "Colaboração em tempo real: co-editing de configs e pair debugging via WebRTC (Team+)",
      "SEO técnico: cada benchmark publicado gera página indexável com Schema.org",
    ],
  },
  {
    id: 6,
    icon: TrendingUp,
    color: "text-indigo-400",
    bg: "bg-indigo-900/20",
    border: "border-indigo-700/40",
    tag: "Analytics",
    title: "Analytics Pessoal & Dashboards",
    summary: "Histórico de testes, evolução de métricas e relatórios exportáveis",
    details: [
      "Dashboard com histórico de simulações e métricas de melhoria ao longo do tempo",
      "Comparação estimado vs. real após deploy (precisão média do motor: ~99.1%)",
      "Exportação de relatórios em PDF e CSV para CI/CD ou apresentações corporativas",
      "Dashboard de equipe unificado (Team+): métricas de todos os membros",
      "Analytics aumenta LTV ao transformar a plataforma num ativo de longo prazo",
    ],
  },
  {
    id: 7,
    icon: RefreshCw,
    color: "text-brand-400",
    bg: "bg-brand-900/20",
    border: "border-brand-700/40",
    tag: "Loop",
    title: "Feedback Loop com IA",
    summary: "Dados reais → refina motor → melhores recomendações → mais dados",
    details: [
      "Dados de deploy real + feedback explícito treinam e refinam os modelos preditivos",
      "GNNs (Graph Neural Networks) para prever consumo de energia baseado em dados empíricos",
      "Quanto mais a plataforma é usada, mais precisa ela fica — vantagem competitiva sustentável",
      "Concorrentes dependentes de dados teóricos ficam progressivamente para trás",
      "Loop: dados → aprendizagem → melhores recomendações → mais usuários → mais dados",
    ],
  },
];

const PILLARS = [
  {
    icon: FlaskConical,
    title: "Avaliação Técnica Robusta",
    color: "text-brand-400",
    bg: "bg-brand-500/10",
    items: [
      "Protocolo ALEM: Acurácia, Latência, Energia e Memória",
      "Base de dados de benchmarks validados em produção",
      "Badges de confiança e peer-review",
      "Suporte a MLPerf Tiny e benchmarks proprietários",
    ],
  },
  {
    icon: Layers,
    title: "UX Centrada na Simplicidade",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    items: [
      "Onboarding contextual em 3 passos",
      "Divulgação progressiva de complexidade técnica",
      "Experiência omnicanal Web + Mobile otimizadas",
      "WCAG 2.2 AA: acessibilidade como restrição de sistema",
    ],
  },
  {
    icon: Globe,
    title: "Infraestrutura Escalável",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    items: [
      "API de benchmarking para integrações CI/CD",
      "Análise síncrona (simulações) e assíncrona (telemetria)",
      "Tiers Free → Pro → Team → Enterprise",
      "Data Marketplace com telemetria anonimizada LGPD-compliant",
    ],
  },
];

const METRICS = [
  { icon: Gauge, label: "Acurácia", desc: "Avaliada em benchmarks do domínio do utilizador. Fundamental para validar a qualidade após otimização.", color: "text-brand-400" },
  { icon: Zap, label: "Latência / Throughput", desc: "Tokens/s, tempo de primeira token (TTFT) e latência percentil (p50, p99). Crítico para aplicações interativas.", color: "text-yellow-400" },
  { icon: Battery, label: "Energia", desc: "Watts médios e pico. Essencial para dispositivos alimentados por bateria. Referência: TokenPowerBench.", color: "text-orange-400" },
  { icon: MemoryStick, label: "Memória (Footprint)", desc: "Tamanho dos pesos carregados + memória de ativações durante inferência. Limite crítico em MCUs.", color: "text-blue-400" },
];

const TECHNIQUES = [
  { label: "Quantização PTQ/QAT", desc: "Post-Training Quantization (simples) vs. Quantization-Aware Training (preserva precisão). Suporta INT8, INT4, FP4, binário.", badge: "Mais usada" },
  { label: "Poda Estruturada/Não-estruturada", desc: "Remoção de heads de atenção e camadas (estruturada, acelerada) vs. pesos individuais (não-estruturada, requer hardware específico).", badge: "Alta compressão" },
  { label: "Distilação de Conhecimento", desc: "Treina um modelo menor (student) para imitar o modelo maior (teacher). Resulta em modelos mais compactos sem re-treino do zero.", badge: "Menor footprint" },
  { label: "Runtimes Otimizados", desc: "TensorRT (NVIDIA), ONNX Runtime, TFLite, llama.cpp (CPU/GPU via Metal/CUDA/Vulkan), Apache TVM, CMSIS-NN (Cortex-M).", badge: "Execução eficiente" },
];

const BUSINESS_TIERS = [
  { name: "Free", price: "$0", color: "border-zinc-700", highlight: false, items: ["3 simulações/mês", "Benchmarks públicos", "Comparador 2 modelos", "Comunidade básica"] },
  { name: "Pro", price: "$29/mês", color: "border-brand-500", highlight: true, items: ["Simulações ilimitadas", "Exportação CI/CD", "Telemetria avançada", "Analytics + PDF", "Suporte 24h"] },
  { name: "Team", price: "$79/user", color: "border-purple-700", highlight: false, items: ["Tudo do Pro", "API 10k req/mês", "Dashboard de equipe", "Data Marketplace (leitura)"] },
  { name: "Enterprise", price: "Sob consulta", color: "border-yellow-700", highlight: false, items: ["API ilimitada + SLA 99.9%", "Data Marketplace publicação", "Consultoria de otimização", "SSO/SAML + on-premise"] },
];

/* ─── COMPONENTE ────────────────────────────────────────────── */

export default function SobrePage() {
  const [expandedStep, setExpandedStep] = useState<number | null>(3);

  const toggle = (id: number) => setExpandedStep(expandedStep === id ? null : id);

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="mx-auto max-w-5xl px-4 py-14 lg:px-6">

        {/* ── HERO ── */}
        <div className="mb-16 text-center">
          <Badge variant="blue" className="mb-4">Pesquisa & Arquitetura</Badge>
          <h1 className="text-4xl font-extrabold text-zinc-100 leading-tight mb-4">
            Do Protótipo ao Deploy
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Um fluxo unificado para avaliar, otimizar e implantar LLMs em sistemas embarcados —
            do ESP32 ao Jetson AGX Orin, com rigor técnico e UX acessível.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs text-zinc-500">
            <AlertCircle size={13} className="text-yellow-400" />
            Lacuna central: potencial teórico dos LLMs vs. viabilidade prática em hardware restrito
          </div>
        </div>

        {/* ── 3 PILARES ── */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-zinc-100 mb-2">Arquitetura Estratégica</h2>
          <p className="text-sm text-zinc-500 mb-6">3 pilares sinérgicos que sustentam a plataforma</p>
          <div className="grid gap-4 md:grid-cols-3">
            {PILLARS.map((p) => (
              <Card key={p.title} className="flex flex-col gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${p.bg}`}>
                  <p.icon size={20} className={p.color} />
                </div>
                <h3 className="font-semibold text-zinc-100 text-sm">{p.title}</h3>
                <ul className="space-y-1.5">
                  {p.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-zinc-500">
                      <CheckCircle size={11} className={`${p.color} flex-shrink-0 mt-0.5`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </section>

        {/* ── FLUXO PRINCIPAL 7 ETAPAS ── */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-zinc-100 mb-2">Fluxo Principal — 7 Etapas</h2>
          <p className="text-sm text-zinc-500 mb-6">Da intenção à implementação otimizada: ciclo completo e virtuoso</p>

          <div className="relative">
            {/* Linha vertical */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-zinc-800 hidden md:block" />

            <div className="space-y-3">
              {FLOW_STEPS.map((step) => {
                const expanded = expandedStep === step.id;
                return (
                  <div key={step.id} className="relative md:pl-16">
                    {/* Número no eixo */}
                    <div className={`hidden md:flex absolute left-0 h-12 w-12 items-center justify-center rounded-full border-2 ${step.border} ${step.bg} z-10`}>
                      <step.icon size={18} className={step.color} />
                    </div>

                    <button
                      onClick={() => toggle(step.id)}
                      className={`w-full text-left rounded-xl border transition-all ${expanded ? step.border + " " + step.bg : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"}`}
                    >
                      <div className="flex items-center justify-between px-5 py-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`md:hidden flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${step.bg}`}>
                            <step.icon size={15} className={step.color} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="gray" className="text-[10px] flex-shrink-0">{step.tag}</Badge>
                              <span className="font-semibold text-zinc-100 text-sm">{step.title}</span>
                            </div>
                            <p className="text-xs text-zinc-500 mt-0.5 truncate">{step.summary}</p>
                          </div>
                        </div>
                        <div className="flex-shrink-0 ml-3">
                          {expanded
                            ? <ChevronUp size={16} className="text-zinc-500" />
                            : <ChevronDown size={16} className="text-zinc-500" />}
                        </div>
                      </div>

                      {expanded && (
                        <div className="px-5 pb-4 border-t border-zinc-800/60 pt-3">
                          <ul className="space-y-2">
                            {step.details.map((d, i) => (
                              <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-400">
                                <ArrowRight size={13} className={`${step.color} flex-shrink-0 mt-0.5`} />
                                {d}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── COMPONENTES TÉCNICOS ── */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-zinc-100 mb-2">Componentes Técnicos</h2>
          <p className="text-sm text-zinc-500 mb-6">Métricas ALEM, hardware suportado e técnicas de otimização</p>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Métricas */}
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Protocolo ALEM</p>
              <div className="space-y-3">
                {METRICS.map((m) => (
                  <Card key={m.label} hover className="flex items-start gap-3">
                    <m.icon size={18} className={`${m.color} flex-shrink-0 mt-0.5`} />
                    <div>
                      <p className="text-sm font-semibold text-zinc-200">{m.label}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{m.desc}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Técnicas */}
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Técnicas de Otimização</p>
              <div className="space-y-3">
                {TECHNIQUES.map((t) => (
                  <Card key={t.label} hover>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-zinc-200">{t.label}</p>
                      <Badge variant="gray" className="text-[10px] flex-shrink-0">{t.badge}</Badge>
                    </div>
                    <p className="text-xs text-zinc-500">{t.desc}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CICLO VIRTUOSO ── */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-zinc-100 mb-2">Ciclo Virtuoso de Dados</h2>
          <p className="text-sm text-zinc-500 mb-6">O diferencial competitivo sustentável da plataforma</p>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="grid gap-4 md:grid-cols-5 items-center text-center">
              {[
                { icon: Database, label: "Dados de\nDeploy Real", color: "text-brand-400" },
                { icon: GitMerge, label: "Comparação\nEstimado vs Real", color: "text-blue-400" },
                { icon: RefreshCw, label: "Refinamento\ndo Motor de IA", color: "text-purple-400" },
                { icon: Zap, label: "Melhores\nRecomendações", color: "text-yellow-400" },
                { icon: Users, label: "Mais\nUtilizadores", color: "text-pink-400" },
              ].map((node, i) => (
                <div key={node.label} className="flex flex-col items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800">
                    <node.icon size={22} className={node.color} />
                  </div>
                  <p className="text-xs text-zinc-400 leading-tight whitespace-pre-line">{node.label}</p>
                  {i < 4 && (
                    <div className="hidden md:block absolute" />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {[
                { icon: Shield, color: "text-brand-400", title: "Barreira de Dados", desc: "Base proprietária de telemetria real de produção — impossível de replicar sem utilizadores." },
                { icon: TrendingUp, color: "text-purple-400", title: "Efeito de Rede", desc: "Mais dados → melhores estimativas → mais confiança → mais adoção → mais dados." },
                { icon: Lock, color: "text-yellow-400", title: "Vantagem Duradoura", desc: "Concorrentes com dados teóricos ficam progressivamente para trás em precisão real." },
              ].map((item) => (
                <div key={item.title} className="rounded-xl bg-zinc-800/50 p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <item.icon size={15} className={item.color} />
                    <p className="text-sm font-semibold text-zinc-200">{item.title}</p>
                  </div>
                  <p className="text-xs text-zinc-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── MODELO DE NEGÓCIO ── */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-zinc-100 mb-2">Modelo de Negócio</h2>
          <p className="text-sm text-zinc-500 mb-6">Freemium escalável — aquisição orgânica + conversão por valor</p>

          <div className="grid gap-3 md:grid-cols-4">
            {BUSINESS_TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-xl border p-4 ${tier.highlight ? "border-brand-500 bg-brand-500/5" : "border-zinc-800 bg-zinc-900"}`}
              >
                <p className="font-bold text-zinc-100 mb-0.5">{tier.name}</p>
                <p className={`text-sm font-semibold mb-3 ${tier.highlight ? "text-brand-400" : "text-zinc-500"}`}>{tier.price}</p>
                <ul className="space-y-1.5">
                  {tier.items.map((item) => (
                    <li key={item} className="flex items-start gap-1.5 text-xs text-zinc-500">
                      <CheckCircle size={11} className={tier.highlight ? "text-brand-400 flex-shrink-0 mt-0.5" : "text-zinc-700 flex-shrink-0 mt-0.5"} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <div className="rounded-2xl border border-zinc-700 bg-zinc-900 p-8 text-center">
          <p className="text-lg font-bold text-zinc-100 mb-2">Explore a plataforma</p>
          <p className="text-sm text-zinc-500 mb-6 max-w-md mx-auto">
            Teste o simulador, compare benchmarks ou contribua com a comunidade técnica.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/simulator">
              <button className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 transition-colors">
                <Zap size={14} /> Abrir Simulador
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-sm font-semibold text-zinc-200 hover:bg-zinc-700 transition-colors">
                <BarChart2 size={14} /> Ver Benchmarks
              </button>
            </Link>
            <Link href="/pricing">
              <button className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                Ver planos →
              </button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
