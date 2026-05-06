import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { judgeQueue } from "../lib/queues.js";

const CreateRunBody = z.object({
  userId: z.string().optional(),
  hardwareId: z.string().optional(),
  executionMode: z.enum(["agent", "webgpu"]),
  model: z.string(),
  quantization: z.string(),
  runtime: z.string().optional(),
  benchmarkType: z.string(),
  iterations: z.number().int().positive(),
  warmupRuns: z.number().int().min(0),
  threads: z.number().int().positive().optional(),
  gpuLayers: z.number().int().min(0).optional(),
  hardwareFingerprint: z.string().optional(),
});

const SubmitResultsBody = z.object({
  tokensPerSecMean: z.number(),
  tokensPerSecStddev: z.number(),
  latencyP50Ms: z.number().int(),
  latencyP95Ms: z.number().int(),
  latencyP99Ms: z.number().int(),
  energyAvgWatts: z.number().nullable().optional(),
  energyWhPerInference: z.number().nullable().optional(),
  perplexity: z.number().optional(),
  mmluScorePct: z.number().optional(),
  consistencyPct: z.number().optional(),
  formatFollowingPct: z.number().optional(),
  totalTokens: z.number().int(),
  totalDurationMs: z.number().int(),
  timeSeries: z
    .array(
      z.object({
        runIndex: z.number().int(),
        tokensPerSec: z.number(),
        latencyMs: z.number().int(),
        watts: z.number().nullable().optional(),
      })
    )
    .optional(),
  rawOutputs: z.array(z.string()).optional(),
});

export async function runsRoutes(app: FastifyInstance) {
  // POST /api/runs — create run record, return run_id
  app.post("/api/runs", async (req, reply) => {
    const body = CreateRunBody.safeParse(req.body);
    if (!body.success) {
      return reply.status(400).send({ error: body.error.flatten() });
    }

    const run = await prisma.benchmarkRun.create({
      data: {
        executionMode: body.data.executionMode,
        model: body.data.model,
        quantization: body.data.quantization,
        runtime: body.data.runtime,
        benchmarkType: body.data.benchmarkType,
        iterations: body.data.iterations,
        warmupRuns: body.data.warmupRuns,
        threads: body.data.threads,
        gpuLayers: body.data.gpuLayers,
        userId: body.data.userId,
        hardwareId: body.data.hardwareId,
        hardwareFingerprint: body.data.hardwareFingerprint,
        status: "RUNNING",
      },
    });

    return reply.status(201).send({ runId: run.id });
  });

  // GET /api/runs — public leaderboard list
  app.get("/api/runs", async (req, reply) => {
    const query = req.query as {
      model?: string;
      hardwareId?: string;
      quantization?: string;
      executionMode?: string;
      limit?: string;
      offset?: string;
    };

    const limit = Math.min(parseInt(query.limit ?? "50", 10), 100);
    const offset = parseInt(query.offset ?? "0", 10);

    const runs = await prisma.benchmarkRun.findMany({
      where: {
        status: "COMPLETED",
        publishedToCommunity: true,
        ...(query.model ? { model: query.model } : {}),
        ...(query.hardwareId ? { hardwareId: query.hardwareId } : {}),
        ...(query.quantization ? { quantization: query.quantization } : {}),
        ...(query.executionMode
          ? { executionMode: query.executionMode as "agent" | "webgpu" }
          : {}),
      },
      include: { result: true, hardware: true },
      orderBy: { completedAt: "desc" },
      take: limit,
      skip: offset,
    });

    return reply.send({ runs, limit, offset });
  });

  // GET /api/runs/:id — single run
  app.get("/api/runs/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const run = await prisma.benchmarkRun.findUnique({
      where: { id },
      include: { result: true, hardware: true, timeSeries: { orderBy: { runIndex: "asc" } } },
    });

    if (!run) return reply.status(404).send({ error: "run not found" });
    return reply.send(run);
  });

  // POST /api/runs/:id/results — save results, mark completed, enqueue judge
  app.post("/api/runs/:id/results", async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = SubmitResultsBody.safeParse(req.body);
    if (!body.success) {
      return reply.status(400).send({ error: body.error.flatten() });
    }

    const run = await prisma.benchmarkRun.findUnique({ where: { id } });
    if (!run) return reply.status(404).send({ error: "run not found" });

    const { timeSeries, rawOutputs, ...resultData } = body.data;

    // Upsert result and time-series in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.runResult.upsert({
        where: { runId: id },
        create: { runId: id, ...resultData },
        update: resultData,
      });

      if (timeSeries?.length) {
        await tx.timeSeries.createMany({
          data: timeSeries.map((p) => ({
            runId: id,
            runIndex: p.runIndex,
            tokensPerSec: p.tokensPerSec,
            latencyMs: p.latencyMs,
            watts: p.watts ?? null,
          })),
          skipDuplicates: true,
        });
      }

      await tx.benchmarkRun.update({
        where: { id },
        data: { status: "COMPLETED", completedAt: new Date() },
      });
    });

    // Enqueue LLM-as-Judge job if raw outputs provided
    let judgeJobId: string | undefined;
    if (rawOutputs?.length) {
      const job = await judgeQueue.add("evaluate", {
        runId: id,
        rawOutputs,
        model: run.model,
        quantization: run.quantization,
      });
      judgeJobId = job.id;

      await prisma.runResult.update({
        where: { runId: id },
        data: { judgeJobId },
      });
    }

    return reply.status(200).send({ ok: true, judgeJobId });
  });

  // PATCH /api/runs/:id/publish — mark run as public
  app.patch("/api/runs/:id/publish", async (req, reply) => {
    const { id } = req.params as { id: string };
    const run = await prisma.benchmarkRun.findUnique({ where: { id } });
    if (!run) return reply.status(404).send({ error: "run not found" });
    if (run.status !== "COMPLETED") {
      return reply.status(409).send({ error: "only completed runs can be published" });
    }

    await prisma.benchmarkRun.update({
      where: { id },
      data: { publishedToCommunity: true },
    });

    return reply.send({ ok: true });
  });

  // DELETE /api/runs/:id — cancel or delete
  app.delete("/api/runs/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const run = await prisma.benchmarkRun.findUnique({ where: { id } });
    if (!run) return reply.status(404).send({ error: "run not found" });

    if (run.status === "RUNNING") {
      await prisma.benchmarkRun.update({
        where: { id },
        data: { status: "CANCELLED", completedAt: new Date() },
      });
    } else {
      await prisma.benchmarkRun.delete({ where: { id } });
    }

    return reply.status(204).send();
  });
}
