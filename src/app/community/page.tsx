"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessageSquare, ThumbsUp, Eye, Shield, Star,
  Zap, Plus, Search, TrendingUp, Users, Award,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FeatureGate } from "@/components/FeatureGate";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { UpgradeModal } from "@/components/UpgradeModal";
import { usePlan } from "@/lib/planContext";

const THREADS = [
  {
    id: "t1",
    title: "Llama-3-8B no Jetson Orin Nano: comparação INT4 vs INT8 no mundo real",
    author: "rafael.lima",
    hardware: "Jetson Orin Nano",
    upvotes: 127,
    replies: 34,
    views: 1840,
    tags: ["llm", "quantização", "jetson"],
    isPinned: true,
    isValidated: true,
    date: "há 2 dias",
    preview: "Testei as duas quantizações por 72h em produção. Os resultados surpreenderam: INT4 é 22% mais rápido mas com variância maior em prompts longos...",
  },
  {
    id: "t2",
    title: "TinyLlama no ESP32-S3: consegui 2 tokens/s com 240mW",
    author: "marcos.vieira",
    hardware: "ESP32-S3",
    upvotes: 89,
    replies: 22,
    views: 1230,
    tags: ["mcu", "ultra-low-power", "slm"],
    isPinned: false,
    isValidated: false,
    date: "há 3 dias",
    preview: "Depois de 3 semanas de otimização manual, consegui rodar TinyLlama bare metal no ESP32-S3. Aqui está o diff do llama.cpp que precisei fazer...",
  },
  {
    id: "t3",
    title: "YOLOv8n STM32H7: 12ms de inferência é o limite real?",
    author: "camila.rocha",
    hardware: "STM32H7",
    upvotes: 204,
    replies: 51,
    views: 3100,
    tags: ["vision", "mcu", "cms-nn"],
    isPinned: false,
    isValidated: true,
    date: "há 5 dias",
    preview: "Publicamos o benchmark 12ms/89.3% mAP. Vários membros questionaram se é reproduzível. Adicionamos o código completo e os arquivos de calibração...",
  },
  {
    id: "t4",
    title: "[Discussão] Qual o melhor SLM para detecção de intenção offline em Pi 5?",
    author: "ana.souza",
    hardware: "Raspberry Pi 5",
    upvotes: 56,
    replies: 18,
    views: 780,
    tags: ["slm", "raspberry", "nlp"],
    isPinned: false,
    isValidated: false,
    date: "há 1 semana",
    preview: "Preciso de NLU offline com <100ms, <5W e >92% accuracy em português. Testei Phi-3 Mini e Gemma-2B. Alguém tem experiência com Qwen2-0.5B?",
  },
];

const TOP_CONTRIBUTORS = [
  { name: "rafael.lima", points: 2840, badges: ["Benchmark Pro", "Jetson Expert"], rank: 1 },
  { name: "camila.rocha", points: 1920, badges: ["Peer Reviewer", "Vision Expert"], rank: 2 },
  { name: "juliana.costa", points: 1540, badges: ["Team Lead", "Optimizer"], rank: 3 },
  { name: "pedro.alves", points: 980, badges: ["Rising Star"], rank: 4 },
];

const CATEGORIES = [
  { label: "Todos", count: 234 },
  { label: "Jetson", count: 87 },
  { label: "Raspberry Pi", count: 62 },
  { label: "MCU/Embarcado", count: 43 },
  { label: "Otimização", count: 31 },
  { label: "Deploy", count: 11 },
];

export default function CommunityPage() {
  const { isProOrAbove, isTeamOrAbove } = usePlan();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [search, setSearch] = useState("");

  const filtered = THREADS.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeCategory !== "Todos" && !t.hardware.includes(activeCategory) && !t.tags.some((tg) => activeCategory.toLowerCase().includes(tg))) return false;
    return true;
  });

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Comunidade Técnica</h1>
            <p className="text-zinc-500 mt-1">
              Benchmarks reproduzíveis, discussões rigorosas e reputação baseada em contribuições reais.
            </p>
          </div>
          {isProOrAbove ? (
            <Button variant="primary" size="md">
              <Plus size={14} /> Nova Thread
            </Button>
          ) : (
            <Button variant="secondary" size="md" onClick={() => setUpgradeOpen(true)}>
              <Plus size={14} /> Publicar (Pro)
            </Button>
          )}
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="hidden lg:flex flex-col gap-4 w-60 flex-shrink-0">
            <Card>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Categorias</p>
              <div className="space-y-1">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.label}
                    onClick={() => setActiveCategory(c.label)}
                    className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                      activeCategory === c.label
                        ? "bg-brand-500/10 text-brand-400"
                        : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                    }`}
                  >
                    {c.label}
                    <span className="text-xs text-zinc-600">{c.count}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Top contributors */}
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <Award size={14} className="text-yellow-400" />
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Top Contribuidores</p>
              </div>
              <div className="space-y-3">
                {TOP_CONTRIBUTORS.map((c) => (
                  <div key={c.name} className="flex items-center gap-2.5">
                    <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      c.rank === 1 ? "bg-yellow-500/20 text-yellow-400" :
                      c.rank === 2 ? "bg-zinc-500/20 text-zinc-400" :
                      "bg-amber-800/20 text-amber-700"
                    }`}>
                      {c.rank}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-zinc-300 truncate">@{c.name}</p>
                      <p className="text-[10px] text-zinc-600">{c.points.toLocaleString()} pts</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Real-time collab — Team gate */}
            <FeatureGate
              requiredPlan="team"
              feature="Colaboração em Tempo Real"
              reason="Co-editing, pair debugging e compartilhamento de logs com o plano Team."
            >
              <Card>
                <div className="flex items-center gap-2 mb-2">
                  <Users size={14} className="text-violet-400" />
                  <p className="text-sm font-semibold text-zinc-200">Sala ao vivo</p>
                </div>
                <p className="text-xs text-zinc-500 mb-3">2 engenheiros debugando Jetson agora</p>
                <Button variant="secondary" size="sm" className="w-full">Entrar na sala</Button>
              </Card>
            </FeatureGate>
          </aside>

          {/* Main */}
          <div className="flex-1 min-w-0">
            {/* Search and sort */}
            <div className="mb-4 flex items-center gap-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar threads..."
                  className="h-9 w-full rounded-lg border border-zinc-700 bg-zinc-800 pl-8 pr-3 text-sm text-zinc-200 placeholder-zinc-600 focus:border-brand-500 focus:outline-none"
                />
              </div>
              <select className="h-9 rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm text-zinc-300 focus:border-brand-500 focus:outline-none">
                <option>Mais recentes</option>
                <option>Mais votados</option>
                <option>Mais comentados</option>
              </select>
            </div>

            {/* Threads */}
            <div className="space-y-3">
              {filtered.map((t) => (
                <Link key={t.id} href={`/community/${t.id}`} className="block">
                <Card hover className={`cursor-pointer ${t.isPinned ? "border-brand-800/50" : ""}`}>
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center gap-1 flex-shrink-0 min-w-[40px]">
                      <button className="flex flex-col items-center text-zinc-600 hover:text-brand-400 transition-colors">
                        <ThumbsUp size={16} />
                        <span className="text-xs font-bold">{t.upvotes}</span>
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {t.isPinned && <Badge variant="yellow" className="text-[10px]">📌 Fixado</Badge>}
                        {t.isValidated && <Badge variant="green" className="text-[10px]"><Shield size={9} /> Validado</Badge>}
                      </div>
                      <h3 className="font-semibold text-zinc-100 mb-1 hover:text-brand-300 transition-colors">
                        {t.title}
                      </h3>
                      <p className="text-xs text-zinc-500 mb-3 line-clamp-2">{t.preview}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-600">
                        <span className="text-zinc-400">@{t.author}</span>
                        <span className="flex items-center gap-1"><MessageSquare size={11} /> {t.replies}</span>
                        <span className="flex items-center gap-1"><Eye size={11} /> {t.views}</span>
                        <span>{t.date}</span>
                        <div className="flex gap-1">
                          {t.tags.map((tag) => (
                            <span key={tag} className="rounded px-1.5 py-0.5 bg-zinc-800 font-mono text-[10px]">#{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
                </Link>
              ))}
            </div>

            {/* Pro feature: Moderation tools */}
            {isProOrAbove && (
              <div className="mt-8">
                <FeatureGate
                  requiredPlan="team"
                  feature="Ferramentas de Moderação"
                  reason="IA assistida para detectar benchmarks falsos, spam e código malicioso."
                >
                  <Card>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-zinc-200">Moderação por IA</p>
                        <p className="text-xs text-zinc-500 mt-0.5">3 posts aguardando revisão</p>
                      </div>
                      <Button variant="secondary" size="sm">Ver fila</Button>
                    </div>
                  </Card>
                </FeatureGate>
              </div>
            )}

            {/* Upgrade nudge for non-pro */}
            {!isProOrAbove && (
              <div className="mt-6 rounded-xl border border-violet-800/40 bg-violet-950/20 p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-violet-900/50">
                    <Star size={18} className="text-violet-300" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-zinc-200">Contribua com a comunidade</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Com o Pro, você pode publicar threads, compartilhar benchmarks privados,
                      co-editar configs e ganhar badges de reputação técnica.
                    </p>
                  </div>
                  <Button variant="upgrade" size="sm" className="flex-shrink-0" onClick={() => setUpgradeOpen(true)}>
                    <Zap size={12} /> Pro
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </div>
  );
}
