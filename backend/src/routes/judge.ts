import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";

// WebSocket endpoint: ws://host/api/runs/:id/judge
// Clients connect and receive judge scores once the async job completes.
// The worker (src/workers/judge.ts) calls broadcastJudgeScores() when done.

type JudgeScores = {
  coherence: number;
  factuality: number;
  overall: number;
};

// In-memory subscriber map: runId → set of send callbacks
const subscribers = new Map<string, Set<(scores: JudgeScores) => void>>();

export function broadcastJudgeScores(runId: string, scores: JudgeScores) {
  const subs = subscribers.get(runId);
  if (!subs) return;
  for (const send of subs) send(scores);
  subscribers.delete(runId);
}

export async function judgeRoutes(app: FastifyInstance) {
  app.get("/api/runs/:id/judge", { websocket: true }, (socket, req) => {
    const { id } = req.params as { id: string };

    // If scores already exist, send immediately and close
    prisma.runResult
      .findUnique({ where: { runId: id } })
      .then((result) => {
        if (
          result?.judgeCoherence != null &&
          result.judgeFactuality != null &&
          result.judgeOverall != null
        ) {
          socket.send(
            JSON.stringify({
              type: "judge_scores",
              coherence: result.judgeCoherence,
              factuality: result.judgeFactuality,
              overall: result.judgeOverall,
            })
          );
          socket.close();
          return;
        }

        // Otherwise subscribe for when the worker finishes
        const send = (scores: JudgeScores) => {
          if (socket.readyState === socket.OPEN) {
            socket.send(JSON.stringify({ type: "judge_scores", ...scores }));
            socket.close();
          }
        };

        if (!subscribers.has(id)) subscribers.set(id, new Set());
        subscribers.get(id)!.add(send);

        socket.on("close", () => {
          subscribers.get(id)?.delete(send);
        });
      })
      .catch(() => {
        socket.send(JSON.stringify({ type: "error", message: "run not found" }));
        socket.close();
      });
  });
}
