import Link from "next/link";
import { Cpu } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 py-10 mt-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/20 ring-1 ring-brand-500/40">
                <Cpu size={14} className="text-brand-400" />
              </div>
              <span className="font-mono font-bold text-zinc-100">
                Edge<span className="text-brand-400">Bench</span>
              </span>
            </div>
            <p className="text-xs text-zinc-500 max-w-xs">
              Plataforma de benchmarking de LLMs para edge computing. Da teoria ao deploy com confiança.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-8 text-sm">
            <div>
              <p className="font-semibold text-zinc-400 mb-2">Plataforma</p>
              {[["Dashboard", "/dashboard"], ["Simulador", "/simulator"], ["Comunidade", "/community"]].map(([l, h]) => (
                <Link key={h} href={h} className="block text-zinc-600 hover:text-zinc-300 mb-1">{l}</Link>
              ))}
            </div>
            <div>
              <p className="font-semibold text-zinc-400 mb-2">Produto</p>
              {[["Preços", "/pricing"], ["Analytics", "/analytics"], ["Onboarding", "/onboarding"]].map(([l, h]) => (
                <Link key={h} href={h} className="block text-zinc-600 hover:text-zinc-300 mb-1">{l}</Link>
              ))}
            </div>
            <div>
              <p className="font-semibold text-zinc-400 mb-2">Legal</p>
              {["Privacidade", "Termos", "Cookies"].map((l) => (
                <button key={l} className="block text-zinc-600 hover:text-zinc-300 mb-1">{l}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-zinc-800/50 pt-6 text-center text-xs text-zinc-700">
          © 2025 EdgeBench · TCC Plataforma de Benchmarking de LLMs para Edge · Todos os direitos reservados
        </div>
      </div>
    </footer>
  );
}
