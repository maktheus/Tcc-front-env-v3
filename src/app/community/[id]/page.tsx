"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft, ThumbsUp, Shield, Eye, Send, CheckCircle,
  Tag, MessageSquare, Pin, Cpu, ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FeatureGate } from "@/components/FeatureGate";
import { COMMUNITY_THREADS } from "@/lib/data";

export default function ThreadPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const thread = COMMUNITY_THREADS.find((t) => t.id === id);
  const [reply, setReply] = useState("");
  const [upvoted, setUpvoted] = useState(false);

  if (!thread) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-500 mb-4">Thread não encontrada.</p>
          <Link href="/community"><Button variant="secondary" size="sm">Voltar à Comunidade</Button></Link>
        </div>
      </div>
    );
  }

  /* renderiza markdown simples: **bold**, código inline, listas */
  const renderBody = (text: string) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**"))
        return <p key={i} className="font-bold text-zinc-200 mt-3 mb-1">{line.replace(/\*\*/g, "")}</p>;
      if (line.startsWith("- "))
        return <li key={i} className="ml-4 text-zinc-400 list-disc">{line.slice(2)}</li>;
      if (line.startsWith("#"))
        return <p key={i} className="text-zinc-600 text-xs mt-2">{line}</p>;
      if (line.trim() === "") return <br key={i} />;
      return <p key={i} className="text-zinc-400">{line}</p>;
    });
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 py-8 lg:px-6">

        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/community" className="hover:text-zinc-300 transition-colors">Comunidade</Link>
          <ChevronRight size={13} className="text-zinc-700" />
          <span className="text-zinc-400 truncate max-w-[300px]">{thread.title}</span>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main */}
          <div className="lg:col-span-2 space-y-5">
            {/* Post original */}
            <Card>
              <div className="flex items-start gap-4">
                {/* Upvote */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => setUpvoted(!upvoted)}
                    className={`flex flex-col items-center rounded-lg p-2 transition-colors ${upvoted ? "text-brand-400 bg-brand-500/10" : "text-zinc-600 hover:text-zinc-300"}`}
                  >
                    <ThumbsUp size={16} />
                    <span className="text-xs font-bold mt-0.5">{thread.upvotes + (upvoted ? 1 : 0)}</span>
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {thread.isPinned && <Badge variant="yellow"><Pin size={9} /> Fixado</Badge>}
                    {thread.isValidated && <Badge variant="green"><CheckCircle size={9} /> Validado</Badge>}
                  </div>

                  <h1 className="text-xl font-bold text-zinc-100 mb-1">{thread.title}</h1>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 mb-4">
                    <span className="flex items-center gap-1 text-zinc-400 font-semibold">@{thread.author}</span>
                    <span className="flex items-center gap-1"><Cpu size={11} /> {thread.hardware}</span>
                    <span className="flex items-center gap-1"><Eye size={11} /> {thread.views}</span>
                    <span>{thread.date}</span>
                  </div>

                  {/* Corpo do post */}
                  <div className="text-sm leading-relaxed space-y-1">
                    {renderBody(thread.body)}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {thread.tags.map((tag) => (
                      <span key={tag} className="rounded px-2 py-0.5 text-[10px] font-mono bg-zinc-800 text-zinc-500">#{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Replies */}
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <MessageSquare size={12} /> {thread.replies.length} resposta{thread.replies.length !== 1 ? "s" : ""}
              </p>
              <div className="space-y-3">
                {thread.replies.map((r, i) => (
                  <Card key={i} className={r.isOp ? "border-brand-700/50 bg-brand-950/10" : ""}>
                    <div className="flex items-start gap-3">
                      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${r.isOp ? "bg-brand-500/20 text-brand-400" : "bg-zinc-800 text-zinc-400"}`}>
                        {r.author[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="text-xs font-semibold text-zinc-300">@{r.author}</span>
                          {r.isOp && <Badge variant="green" className="text-[10px]">OP</Badge>}
                          <span className="text-[10px] text-zinc-600">{r.date}</span>
                        </div>
                        <p className="text-sm text-zinc-400 leading-relaxed">{r.text}</p>
                        <button className="mt-2 flex items-center gap-1 text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors">
                          <ThumbsUp size={10} /> {r.upvotes}
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Caixa de reply */}
            <FeatureGate requiredPlan="pro" feature="Responder threads" reason="Participe das discussões técnicas com o plano Pro.">
              <Card>
                <p className="text-xs font-semibold text-zinc-400 mb-3">Sua resposta</p>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Compartilhe seu resultado, dúvida ou experiência..."
                  rows={4}
                  className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:border-brand-500 focus:outline-none"
                />
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-[10px] text-zinc-700">Suporte a Markdown básico: **bold**, `código`</p>
                  <Button variant="primary" size="sm" disabled={!reply.trim()}>
                    <Send size={13} /> Publicar resposta
                  </Button>
                </div>
              </Card>
            </FeatureGate>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Hardware</p>
              <div className="flex items-center gap-2">
                <Cpu size={16} className="text-brand-400" />
                <span className="text-sm text-zinc-300">{thread.hardware}</span>
              </div>
            </Card>

            <Card>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {thread.tags.map((tag) => (
                  <span key={tag} className="rounded px-2 py-1 text-xs font-mono bg-zinc-800 text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors">
                    #{tag}
                  </span>
                ))}
              </div>
            </Card>

            <Card>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Benchmarks relacionados</p>
              <div className="space-y-2">
                {[1, 4].map((n) => (
                  <Link key={n} href={`/benchmark/b${n}`}>
                    <div className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-3 py-2 hover:bg-zinc-800 transition-colors">
                      <div>
                        <p className="text-xs font-medium text-zinc-300">Benchmark #b{n}</p>
                        <p className="text-[10px] text-zinc-600">{thread.hardware}</p>
                      </div>
                      <ChevronRight size={13} className="text-zinc-600" />
                    </div>
                  </Link>
                ))}
              </div>
            </Card>

            <Link href="/telemetria">
              <Card hover className="cursor-pointer border-purple-800/40 bg-purple-950/10">
                <div className="flex items-center gap-2 mb-1">
                  <Shield size={14} className="text-purple-400" />
                  <p className="text-sm font-semibold text-zinc-200">Validar este benchmark</p>
                </div>
                <p className="text-xs text-zinc-500">Envie seus resultados reais e contribua com a comunidade.</p>
              </Card>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
