"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft, Zap, Clock, Battery, Shield, CheckCircle, ThumbsUp,
  Share2, GitBranch, AlertTriangle, BarChart2, Terminal, Send,
  ChevronRight, Users, ExternalLink,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FeatureGate } from "@/components/FeatureGate";
import { BENCHMARKS, BENCHMARK_COMMENTS, TELEMETRY_DATA } from "@/lib/data";

/* gera dados históricos fictícios de throughput ao longo do tempo */
function mockHistory(base: number) {
  return ["Set", "Out", "Nov", "Dez", "Jan", "Fev"].map((m, i) => ({
    month: m,
    tps: parseFloat((base * (0.88 + i * 0.03 + Math.sin(i) * 0.04)).toFixed(1)),
  }));
}

export default function BenchmarkDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const benchmark = BENCHMARKS.find((b) => b.id === id);
  const [upvoted, setUpvoted] = useState(false);
  const [comment, setComment] = useState("");

  if (!benchmark) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-500 mb-4">Benchmark não encontrado.</p>
          <Link href="/dashboard"><Button variant="secondary" size="sm">Voltar ao Dashboard</Button></Link>
        </div>
      </div>
    );
  }

  const comments = BENCHMARK_COMMENTS[id] ?? [];
  const telemetries = TELEMETRY_DATA.filter((t) => t.benchmarkId === id);
  const history = benchmark.tokensPerSec > 0 ? mockHistory(benchmark.tokensPerSec) : null;

  const avgRealTps = telemetries.length
    ? telemetries.reduce((s, t) => s + t.realTps, 0) / telemetries.length
    : null;
  const avgRealW = telemetries.length
    ? telemetries.reduce((s, t) => s + t.realW, 0) / telemetries.length
    : null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 py-8 lg:px-6">

        {/* ── Breadcrumb ── */}
        <button onClick={() => router.back()} className="mb-6 flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-200 transition-colors">
          <ArrowLeft size={15} /> Voltar
        </button>

        {/* ── Hero ── */}
        <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {benchmark.validated && (
                  <Badge variant="green"><CheckCircle size={10} /> Validado em Produção</Badge>
                )}
                {benchmark.peerReviewed && (
                  <Badge variant="blue"><Shield size={10} /> Peer-reviewed</Badge>
                )}
                <Badge variant="gray">{benchmark.modelSize}</Badge>
              </div>
              <h1 className="text-2xl font-extrabold text-zinc-100 font-mono mb-1">{benchmark.model}</h1>
              <p className="text-zinc-400">
                em <span className="font-semibold text-zinc-200">{benchmark.hardware}</span>
                {" · "}{benchmark.technique}{" · "}{benchmark.runtime}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {benchmark.tags.map((t) => (
                  <span key={t} className="rounded px-2 py-0.5 text-[10px] font-mono bg-zinc-800 text-zinc-500">#{t}</span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setUpvoted(!upvoted)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${upvoted ? "border-brand-500 bg-brand-500/10 text-brand-400" : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600"}`}
              >
                <ThumbsUp size={14} /> {benchmark.upvotes + (upvoted ? 1 : 0)}
              </button>
              <Button variant="secondary" size="sm"><Share2 size={13} /> Compartilhar</Button>
              <Link href={`/deploy?benchmark=${id}`}>
                <Button variant="primary" size="sm"><Zap size={13} /> Deploy este config</Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* ── Coluna principal ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Métricas principais */}
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Métricas Medidas</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Tokens/s", value: benchmark.tokensPerSec || "—", unit: "", icon: Zap, color: "text-brand-400", real: avgRealTps ? avgRealTps.toFixed(1) : null },
                  { label: "Latência", value: benchmark.latencyMs, unit: "ms", icon: Clock, color: "text-blue-400", real: null },
                  { label: "Consumo", value: benchmark.energyW, unit: "W", icon: Battery, color: "text-yellow-400", real: avgRealW ? avgRealW.toFixed(1) : null },
                  { label: "Acurácia", value: benchmark.accuracyPct, unit: "%", icon: Shield, color: "text-purple-400", real: null },
                ].map((m) => (
                  <Card key={m.label} className="text-center">
                    <m.icon size={18} className={`${m.color} mx-auto mb-2`} />
                    <div className="text-2xl font-extrabold text-zinc-100">{m.value}{m.unit}</div>
                    <div className="text-xs text-zinc-500">{m.label}</div>
                    {m.real && (
                      <div className="mt-1 text-[10px] text-zinc-600">
                        Real médio: <span className="text-zinc-400">{m.real}{m.unit}</span>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>

            {/* Gráfico histórico */}
            {history && (
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BarChart2 size={15} className="text-brand-400" />
                    <p className="text-sm font-semibold text-zinc-200">Evolução do Throughput (tokens/s)</p>
                  </div>
                  <Badge variant="gray" className="text-[10px]">últimos 6 meses</Badge>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="month" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} />
                    <YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} domain={["auto", "auto"]} />
                    <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: "8px" }} labelStyle={{ color: "#e4e4e7" }} itemStyle={{ color: "#a1a1aa" }} />
                    <ReferenceLine y={benchmark.tokensPerSec} stroke="#22a36b" strokeDasharray="4 2" label={{ value: "benchmark", fill: "#22a36b", fontSize: 10 }} />
                    <Line type="monotone" dataKey="tps" stroke="#60a5fa" strokeWidth={2} dot={{ fill: "#60a5fa", r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Telemetria real */}
            {telemetries.length > 0 && (
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <GitBranch size={15} className="text-purple-400" />
                    <p className="text-sm font-semibold text-zinc-200">Resultados Reais da Comunidade</p>
                  </div>
                  <Badge variant="green" className="text-[10px]">{telemetries.length} validações</Badge>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-500">
                        <th className="py-2 text-left font-medium">Usuário</th>
                        <th className="py-2 text-center font-medium">tok/s estimado</th>
                        <th className="py-2 text-center font-medium">tok/s real</th>
                        <th className="py-2 text-center font-medium">Watts estimado</th>
                        <th className="py-2 text-center font-medium">Watts real</th>
                        <th className="py-2 text-center font-medium">Desvio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {telemetries.map((t) => {
                        const tpsDev = Math.abs(((t.realTps - t.estimatedTps) / t.estimatedTps) * 100);
                        return (
                          <tr key={t.id} className="text-zinc-400">
                            <td className="py-2.5">@{t.author}</td>
                            <td className="py-2.5 text-center text-zinc-500">{t.estimatedTps}</td>
                            <td className={`py-2.5 text-center font-semibold ${t.realTps >= t.estimatedTps ? "text-brand-400" : "text-yellow-400"}`}>{t.realTps}</td>
                            <td className="py-2.5 text-center text-zinc-500">{t.estimatedW}W</td>
                            <td className={`py-2.5 text-center font-semibold ${t.realW <= t.estimatedW ? "text-brand-400" : "text-yellow-400"}`}>{t.realW}W</td>
                            <td className="py-2.5 text-center">
                              <Badge variant={tpsDev <= 10 ? "green" : "yellow"} className="text-[10px]">
                                {tpsDev.toFixed(1)}%
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-[10px] text-zinc-700">Desvio médio: {(telemetries.reduce((s, t) => s + Math.abs(((t.realTps - t.estimatedTps) / t.estimatedTps) * 100), 0) / telemetries.length).toFixed(1)}% — dentro da margem de ±15%</p>
              </Card>
            )}

            {/* Seção de comentários */}
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Users size={13} /> Discussão da Comunidade ({comments.length})
              </p>
              <div className="space-y-3 mb-4">
                {comments.map((c, i) => (
                  <Card key={i} className="flex gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-400">
                      {c.author[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-zinc-300">@{c.author}</span>
                        <span className="text-[10px] text-zinc-600">{c.date}</span>
                      </div>
                      <p className="text-sm text-zinc-400 leading-relaxed">{c.text}</p>
                      <button className="mt-1.5 flex items-center gap-1 text-[10px] text-zinc-600 hover:text-zinc-400">
                        <ThumbsUp size={10} /> {c.upvotes}
                      </button>
                    </div>
                  </Card>
                ))}
                {comments.length === 0 && (
                  <p className="text-sm text-zinc-600 py-4 text-center">Seja o primeiro a comentar.</p>
                )}
              </div>

              {/* Caixa de comentário — gated */}
              <FeatureGate requiredPlan="pro" feature="Comentar" reason="Participe das discussões com o plano Pro.">
                <Card>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Compartilhe seu resultado ou dúvida técnica..."
                    rows={3}
                    className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:border-brand-500 focus:outline-none"
                  />
                  <div className="mt-2 flex justify-end">
                    <Button variant="primary" size="sm" disabled={!comment.trim()}>
                      <Send size={13} /> Publicar
                    </Button>
                  </div>
                </Card>
              </FeatureGate>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-4">
            <Card>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Detalhes</p>
              <dl className="space-y-2 text-sm">
                {[
                  ["Publicado", benchmark.publishedAt],
                  ["Autor", `@${benchmark.author}`],
                  ["Hardware", benchmark.hardware],
                  ["Técnica", benchmark.technique],
                  ["Runtime", benchmark.runtime],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-2">
                    <dt className="text-zinc-500">{k}</dt>
                    <dd className="text-zinc-300 text-right font-mono text-xs">{v}</dd>
                  </div>
                ))}
              </dl>
            </Card>

            <Link href={`/deploy?benchmark=${id}`}>
              <Card hover className="border-brand-700/50 bg-brand-950/20 cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <Terminal size={15} className="text-brand-400" />
                  <p className="text-sm font-semibold text-zinc-200">Reproduzir este benchmark</p>
                </div>
                <p className="text-xs text-zinc-500 mb-3">Guia passo a passo com scripts gerados automaticamente.</p>
                <div className="flex items-center text-xs text-brand-400 font-semibold">
                  Iniciar deploy <ChevronRight size={13} />
                </div>
              </Card>
            </Link>

            <Link href="/telemetria">
              <Card hover className="cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <GitBranch size={15} className="text-purple-400" />
                  <p className="text-sm font-semibold text-zinc-200">Enviar seus resultados</p>
                </div>
                <p className="text-xs text-zinc-500">Compare suas medições reais com as estimativas.</p>
              </Card>
            </Link>

            {benchmark.validated && (
              <div className="rounded-xl border border-brand-700/30 bg-brand-950/20 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle size={14} className="text-brand-400" />
                  <p className="text-xs font-semibold text-brand-300">Precisão das estimativas</p>
                </div>
                <p className="text-2xl font-extrabold text-zinc-100">
                  {telemetries.length
                    ? `${(100 - telemetries.reduce((s, t) => s + Math.abs(((t.realTps - t.estimatedTps) / t.estimatedTps) * 100), 0) / telemetries.length).toFixed(1)}%`
                    : "—"}
                </p>
                <p className="text-[10px] text-zinc-600 mt-0.5">baseado em {telemetries.length} validações reais</p>
              </div>
            )}

            <div className="rounded-xl border border-yellow-800/30 bg-yellow-950/20 p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle size={13} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-zinc-500 leading-relaxed">
                  Estimativas com margem de ±15%. Resultados reais variam com temperatura, firmware e carga do sistema.
                </p>
              </div>
            </div>

            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="w-full">
                <ExternalLink size={13} /> Ver mais benchmarks
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
