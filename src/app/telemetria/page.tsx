"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GitBranch, CheckCircle, ArrowRight, TrendingUp,
  TrendingDown, Minus, Trophy, Zap, BarChart2,
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip,
} from "recharts";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { BENCHMARKS, TELEMETRY_DATA } from "@/lib/data";

export default function TelemetriaPage() {
  const [benchmarkId, setBenchmarkId] = useState("b1");
  const [realTps, setRealTps] = useState("");
  const [realW, setRealW] = useState("");
  const [realAccuracy, setRealAccuracy] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const benchmark = BENCHMARKS.find((b) => b.id === benchmarkId)!;
  const existingTelemetry = TELEMETRY_DATA.filter((t) => t.benchmarkId === benchmarkId);

  const tpsNum = parseFloat(realTps);
  const wNum = parseFloat(realW);
  const accNum = parseFloat(realAccuracy);

  const tpsDelta = tpsNum && benchmark.tokensPerSec
    ? ((tpsNum - benchmark.tokensPerSec) / benchmark.tokensPerSec * 100).toFixed(1)
    : null;
  const wDelta = wNum
    ? ((wNum - benchmark.energyW) / benchmark.energyW * 100).toFixed(1)
    : null;
  const accDelta = accNum
    ? ((accNum - benchmark.accuracyPct) / benchmark.accuracyPct * 100).toFixed(2)
    : null;

  const canSubmit = realTps || realW || realAccuracy;

  const radarData = benchmark.tokensPerSec > 0 && tpsNum && wNum && accNum ? [
    { metric: "Throughput", estimado: 100, real: Math.min(150, (tpsNum / benchmark.tokensPerSec) * 100) },
    { metric: "Eficiência", estimado: 100, real: Math.min(150, (benchmark.energyW / wNum) * 100) },
    { metric: "Acurácia", estimado: 100, real: Math.min(105, (accNum / benchmark.accuracyPct) * 100) },
  ] : null;

  const handleSubmit = () => setSubmitted(true);

  const DeltaBadge = ({ delta }: { delta: string | null; inverse?: boolean }) => {
    if (!delta) return null;
    const n = parseFloat(delta);
    if (Math.abs(n) < 0.5) return <Badge variant="gray" className="text-[10px]"><Minus size={9} /> {delta}%</Badge>;
    if (n > 0) return <Badge variant="green" className="text-[10px]"><TrendingUp size={9} /> +{delta}%</Badge>;
    return <Badge variant="yellow" className="text-[10px]"><TrendingDown size={9} /> {delta}%</Badge>;
  };

  if (submitted) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="mx-auto max-w-xl px-4 py-24 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-500/20 ring-1 ring-brand-500/30">
            <Trophy size={36} className="text-brand-400" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-100 mb-3">Telemetria enviada!</h2>
          <p className="text-zinc-400 mb-2">
            Seus resultados foram registrados e contribuirão para melhorar as estimativas
            do motor de recomendação para todos os usuários.
          </p>
          <div className="my-6 rounded-xl border border-brand-700/30 bg-brand-950/20 p-4 text-left space-y-2">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Resumo da validação</p>
            {realTps && <div className="flex justify-between text-sm"><span className="text-zinc-500">Throughput real</span><span className="text-zinc-200 font-mono">{realTps} tok/s</span></div>}
            {realW && <div className="flex justify-between text-sm"><span className="text-zinc-500">Consumo real</span><span className="text-zinc-200 font-mono">{realW}W</span></div>}
            {realAccuracy && <div className="flex justify-between text-sm"><span className="text-zinc-500">Acurácia real</span><span className="text-zinc-200 font-mono">{realAccuracy}%</span></div>}
          </div>
          <Badge variant="green" className="mb-6"><CheckCircle size={12} /> Badge "Validado em Produção" concedido</Badge>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={`/benchmark/${benchmarkId}`}>
              <Button variant="primary" size="md">Ver benchmark atualizado <ArrowRight size={14} /></Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="secondary" size="md">Explorar benchmarks</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 py-8 lg:px-6">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Link href="/deploy" className="text-sm text-zinc-500 hover:text-zinc-300">Deploy</Link>
            <ArrowRight size={13} className="text-zinc-700" />
            <span className="text-sm text-zinc-300">Telemetria</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 mb-1">Enviar Resultados Reais</h1>
          <p className="text-zinc-500 text-sm">
            Compare suas medições com as estimativas do EdgeBench. Cada validação melhora a precisão do motor de recomendação.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Formulário */}
          <div className="space-y-4">
            <Card>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Benchmark de referência</p>
              <select
                value={benchmarkId}
                onChange={(e) => setBenchmarkId(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none"
              >
                {BENCHMARKS.map((b) => (
                  <option key={b.id} value={b.id}>{b.model} — {b.hardware}</option>
                ))}
              </select>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                {[
                  { label: "Estimado tok/s", value: benchmark.tokensPerSec || "—" },
                  { label: "Estimado W", value: `${benchmark.energyW}W` },
                  { label: "Estimado acc", value: `${benchmark.accuracyPct}%` },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg bg-zinc-800/60 p-2">
                    <p className="text-zinc-400 font-semibold">{s.value}</p>
                    <p className="text-zinc-600">{s.label}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Suas medições reais</p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-1.5 block">
                    Throughput real <span className="text-zinc-600">(tokens/s)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={realTps}
                      onChange={(e) => setRealTps(e.target.value)}
                      placeholder={`estimado: ${benchmark.tokensPerSec}`}
                      className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:border-brand-500 focus:outline-none"
                    />
                    <DeltaBadge delta={tpsDelta} />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-1.5 block">
                    Consumo real <span className="text-zinc-600">(Watts)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={realW}
                      onChange={(e) => setRealW(e.target.value)}
                      placeholder={`estimado: ${benchmark.energyW}`}
                      className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:border-brand-500 focus:outline-none"
                    />
                    <DeltaBadge delta={wDelta} />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-1.5 block">
                    Acurácia real <span className="text-zinc-600">(%)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={realAccuracy}
                      onChange={(e) => setRealAccuracy(e.target.value)}
                      placeholder={`estimado: ${benchmark.accuracyPct}`}
                      className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:border-brand-500 focus:outline-none"
                    />
                    <DeltaBadge delta={accDelta} />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Observações</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Descreva condições do teste: temperatura, heatsink, versão do driver..."
                    rows={3}
                    className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full mt-4"
                disabled={!canSubmit}
                onClick={handleSubmit}
              >
                <GitBranch size={14} /> Enviar telemetria e validar
              </Button>
              <p className="text-[10px] text-zinc-700 text-center mt-2">
                Dados anonimizados por padrão. Opt-in para publicação com nome.
              </p>
            </Card>
          </div>

          {/* Preview + histórico */}
          <div className="space-y-4">
            {/* Radar de comparação */}
            {radarData ? (
              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <BarChart2 size={14} className="text-purple-400" />
                  <p className="text-sm font-semibold text-zinc-200">Estimado vs. Real</p>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#27272a" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: "#71717a", fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: "8px" }} labelStyle={{ color: "#e4e4e7" }} />
                    <Radar name="Estimado" dataKey="estimado" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.1} />
                    <Radar name="Real" dataKey="real" stroke="#22a36b" fill="#22a36b" fillOpacity={0.15} />
                  </RadarChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-400" /> Estimado</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-brand-400" /> Real</span>
                </div>
              </Card>
            ) : (
              <Card className="flex items-center justify-center py-12 text-center">
                <div>
                  <BarChart2 size={28} className="text-zinc-700 mx-auto mb-2" />
                  <p className="text-sm text-zinc-600">Preencha as métricas para ver a comparação</p>
                </div>
              </Card>
            )}

            {/* Histórico de validações */}
            {existingTelemetry.length > 0 && (
              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={14} className="text-brand-400" />
                  <p className="text-sm font-semibold text-zinc-200">Validações existentes</p>
                  <Badge variant="gray" className="ml-auto text-[10px]">{existingTelemetry.length} registros</Badge>
                </div>
                <div className="space-y-3">
                  {existingTelemetry.map((t) => (
                    <div key={t.id} className="rounded-lg bg-zinc-800/50 p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-zinc-300">@{t.author}</span>
                        <span className="text-[10px] text-zinc-600">{t.date}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[10px] text-center">
                        <div>
                          <p className="text-zinc-400 font-semibold">{t.realTps} tok/s</p>
                          <p className="text-zinc-600">throughput</p>
                        </div>
                        <div>
                          <p className="text-zinc-400 font-semibold">{t.realW}W</p>
                          <p className="text-zinc-600">consumo</p>
                        </div>
                        <div>
                          <p className="text-zinc-400 font-semibold">{t.realAccuracy}%</p>
                          <p className="text-zinc-600">acurácia</p>
                        </div>
                      </div>
                      {t.notes && <p className="mt-1.5 text-[10px] text-zinc-600 italic">"{t.notes}"</p>}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <div className="rounded-xl border border-brand-700/30 bg-brand-950/20 p-4">
              <div className="flex items-start gap-2.5">
                <Zap size={14} className="text-brand-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-zinc-300 mb-1">Como isso melhora o EdgeBench</p>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    Cada validação real reduz o desvio médio das estimativas. Com {existingTelemetry.length + 1}+ validações,
                    o motor de recomendação ajusta automaticamente os coeficientes preditivos para este hardware/modelo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
