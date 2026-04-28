"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X, Zap, ArrowRight, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { usePlan } from "@/lib/planContext";
import { PRICING_TIERS } from "@/lib/data";
import type { Plan } from "@/types";

const FAQ = [
  {
    q: "O que conta como uma 'simulação'?",
    a: "Cada consulta ao Simulador de Viabilidade conta como uma simulação. Visualizar benchmarks públicos, usar o comparador e participar da comunidade não consomem simulações.",
  },
  {
    q: "Posso cancelar a qualquer momento?",
    a: "Sim. Planos mensais e anuais podem ser cancelados com um clique no painel. Você mantém acesso até o fim do período pago.",
  },
  {
    q: "O que é o Data Marketplace?",
    a: "É um repositório de datasets anonimizados de telemetria de deploy em edge. Planos Team podem acessar; Enterprise podem também publicar e monetizar seus dados.",
  },
  {
    q: "Existe desconto para universidades?",
    a: "Sim. Estudantes e pesquisadores com e-mail institucional (.edu, .ac) têm 50% de desconto no Pro. Entre em contato pelo suporte.",
  },
  {
    q: "A API de benchmarking tem rate limits?",
    a: "Team: 10.000 requests/mês. Enterprise: ilimitado com SLA 99.9%. Ambos incluem acesso via CI/CD (GitHub Actions, GitLab CI).",
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);
  const { profile, setPlan } = usePlan();

  const handleSelectPlan = (planId: Plan) => {
    if (planId === "enterprise") return;
    setPlan(planId);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <Badge variant="green" className="mb-4">Preços</Badge>
          <h1 className="text-4xl font-extrabold text-zinc-100">
            Simples, transparente, escalável
          </h1>
          <p className="mt-3 text-zinc-400 text-lg">
            Comece grátis. Faça upgrade quando seu projeto exigir mais poder.
          </p>

          {/* Billing toggle */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-1.5">
            <button
              onClick={() => setAnnual(false)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${!annual ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              Mensal
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${annual ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              Anual
              <Badge variant="green" className="text-[10px]">−20%</Badge>
            </button>
          </div>
        </div>

        {/* Tier cards */}
        <div className="grid gap-6 lg:grid-cols-4 mb-16">
          {PRICING_TIERS.map((tier) => {
            const isCurrentPlan = profile.plan === tier.id;
            const price = tier.id === "enterprise"
              ? "Personalizado"
              : annual
              ? `$${tier.price.annual}`
              : `$${tier.price.monthly}`;

            return (
              <div
                key={tier.id}
                className={`relative flex flex-col rounded-2xl border p-6 transition-all ${
                  tier.highlighted
                    ? "border-brand-500 bg-gradient-to-b from-brand-950/30 to-zinc-900 shadow-xl shadow-brand-900/20"
                    : "border-zinc-800 bg-zinc-900"
                } ${isCurrentPlan ? "ring-2 ring-violet-500" : ""}`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <Badge variant="green" className="px-3 text-xs shadow-lg">Mais popular</Badge>
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-3.5 right-4">
                    <Badge variant="violet" className="text-xs">Seu plano</Badge>
                  </div>
                )}

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-bold text-zinc-100">{tier.name}</h3>
                  </div>
                  <p className="text-xs text-zinc-500">{tier.description}</p>
                </div>

                <div className="mb-6">
                  {tier.id === "enterprise" ? (
                    <div className="text-2xl font-extrabold text-zinc-100">Sob consulta</div>
                  ) : tier.id === "free" ? (
                    <div>
                      <span className="text-3xl font-extrabold text-zinc-100">Grátis</span>
                      <span className="ml-1 text-sm text-zinc-500">para sempre</span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-3xl font-extrabold text-zinc-100">{price}</span>
                      <span className="text-sm text-zinc-500">/mês</span>
                      {annual && (
                        <div className="text-xs text-zinc-600 mt-0.5">
                          Cobrado ${tier.price.annual * 12}/ano
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2.5 mb-6">
                  {tier.features.map((f) => (
                    <div key={f.label} className="flex items-center gap-2.5">
                      {f.included ? (
                        <Check size={14} className="flex-shrink-0 text-brand-400" />
                      ) : (
                        <X size={14} className="flex-shrink-0 text-zinc-700" />
                      )}
                      <span className={`text-xs ${f.included ? "text-zinc-300" : "text-zinc-600"}`}>
                        {f.label}
                        {f.note && (
                          <span className="ml-1 text-zinc-700">({f.note})</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                {tier.id === "enterprise" ? (
                  <Button variant="secondary" size="md" className="w-full">
                    Falar com vendas
                  </Button>
                ) : isCurrentPlan ? (
                  <Button variant="ghost" size="md" className="w-full" disabled>
                    Plano atual
                  </Button>
                ) : tier.highlighted ? (
                  <Button
                    variant="upgrade"
                    size="md"
                    className="w-full"
                    onClick={() => handleSelectPlan(tier.id as Plan)}
                  >
                    <Zap size={14} /> {tier.cta}
                  </Button>
                ) : (
                  <Button
                    variant={tier.id === "free" ? "ghost" : "secondary"}
                    size="md"
                    className="w-full"
                    onClick={() => handleSelectPlan(tier.id as Plan)}
                  >
                    {tier.cta}
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Feature comparison table */}
        <div className="mb-16">
          <h2 className="text-xl font-bold text-zinc-100 mb-6 text-center">Comparação detalhada</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="py-3 text-left font-medium text-zinc-400 pr-6">Recurso</th>
                  {PRICING_TIERS.map((t) => (
                    <th key={t.id} className={`py-3 text-center font-semibold min-w-[100px] ${t.highlighted ? "text-brand-400" : "text-zinc-300"}`}>
                      {t.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {[
                  ["Simulações/mês", "3", "Ilimitado", "Ilimitado", "Ilimitado"],
                  ["Benchmarks privados", "—", "10", "Ilimitado", "Ilimitado"],
                  ["Comparador (modelos)", "2", "5", "5", "5"],
                  ["Exportação CI/CD", "✗", "✓", "✓", "✓"],
                  ["API de benchmarking", "✗", "✗", "10k req/mês", "Ilimitado"],
                  ["Telemetria de deploy", "Básica", "Avançada", "Avançada", "Enterprise"],
                  ["Relatórios PDF", "✗", "✓", "✓", "✓"],
                  ["Data Marketplace (leitura)", "✗", "✗", "✓", "✓"],
                  ["Data Marketplace (publicação)", "✗", "✗", "✗", "✓"],
                  ["Suporte", "Comunidade", "24h", "4h", "24/7 dedicado"],
                  ["SLA", "—", "—", "99.5%", "99.9%"],
                  ["SSO / SAML", "✗", "✗", "✗", "✓"],
                ].map(([feature, ...values]) => (
                  <tr key={feature} className="hover:bg-zinc-900/50">
                    <td className="py-3 text-zinc-400 pr-6">{feature}</td>
                    {values.map((v, i) => (
                      <td key={i} className="py-3 text-center text-zinc-300">
                        {v === "✓" ? (
                          <Check size={16} className="mx-auto text-brand-400" />
                        ) : v === "✗" ? (
                          <X size={16} className="mx-auto text-zinc-700" />
                        ) : (
                          <span className="text-xs">{v}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="text-xl font-bold text-zinc-100 mb-8 text-center">Perguntas frequentes</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {FAQ.map((item) => (
              <div key={item.q} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
                <div className="flex items-start gap-3">
                  <HelpCircle size={16} className="text-brand-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-zinc-200 mb-1.5">{item.q}</p>
                    <p className="text-sm text-zinc-500">{item.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="rounded-2xl border border-zinc-700 bg-zinc-900 p-10 text-center">
          <h2 className="text-2xl font-bold text-zinc-100 mb-3">
            Ainda tem dúvidas?
          </h2>
          <p className="text-zinc-400 mb-6">
            Fale com nossa equipe. Ajudamos você a escolher o plano certo para seu projeto.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/onboarding">
              <Button variant="primary" size="lg">
                Começar grátis <ArrowRight size={16} />
              </Button>
            </Link>
            <Button variant="secondary" size="lg">
              Falar com vendas
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
