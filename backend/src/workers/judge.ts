import Anthropic from "@anthropic-ai/sdk";
import { Worker } from "bullmq";
import { prisma } from "../lib/prisma.js";
import { redis } from "../lib/redis.js";
import { broadcastJudgeScores } from "../routes/judge.js";
import type { JudgeJobData } from "../lib/queues.js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const JUDGE_SYSTEM = `You are an expert LLM evaluator assessing quantized model outputs.
Score each response from 1–10 for:
- coherence: logical flow, no contradictions
- factuality: accuracy of stated facts
- overall: combined quality considering both

Return ONLY valid JSON: {"coherence": <1-10>, "factuality": <1-10>, "overall": <1-10>}`;

async function evaluateOutputs(
  outputs: string[],
  model: string,
  quantization: string
): Promise<{ coherence: number; factuality: number; overall: number }> {
  const sample = outputs.slice(0, 5).join("\n\n---\n\n");

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 128,
    system: JUDGE_SYSTEM,
    messages: [
      {
        role: "user",
        content: `Model: ${model} (${quantization})\n\nOutputs to evaluate:\n\n${sample}`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "{}";

  // Strip markdown code fences if present
  const jsonText = text.replace(/```(?:json)?\n?/g, "").trim();
  const parsed = JSON.parse(jsonText) as {
    coherence: number;
    factuality: number;
    overall: number;
  };

  return {
    coherence: Math.min(10, Math.max(1, parsed.coherence)),
    factuality: Math.min(10, Math.max(1, parsed.factuality)),
    overall: Math.min(10, Math.max(1, parsed.overall)),
  };
}

export const judgeWorker = new Worker<JudgeJobData>(
  "judge",
  async (job) => {
    const { runId, rawOutputs, model, quantization } = job.data;

    const scores = await evaluateOutputs(rawOutputs, model, quantization);

    await prisma.runResult.update({
      where: { runId },
      data: {
        judgeCoherence: scores.coherence,
        judgeFactuality: scores.factuality,
        judgeOverall: scores.overall,
      },
    });

    broadcastJudgeScores(runId, scores);
  },
  { connection: redis, concurrency: 4 }
);

judgeWorker.on("failed", (job, err) => {
  console.error(`judge job ${job?.id} failed:`, err.message);
});
