import Fastify from "fastify";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import { runsRoutes } from "./routes/runs.js";
import { judgeRoutes } from "./routes/judge.js";
// Import worker so it starts processing jobs when the server starts
import "./workers/judge.js";

const app = Fastify({ logger: { level: process.env.LOG_LEVEL ?? "info" } });

await app.register(cors, {
  origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  methods: ["GET", "POST", "PATCH", "DELETE"],
});

await app.register(websocket);

await app.register(runsRoutes);
await app.register(judgeRoutes);

app.get("/health", async () => ({
  status: "ok",
  version: "0.1.0",
  env: process.env.NODE_ENV ?? "development",
}));

const port = parseInt(process.env.PORT ?? "4000", 10);
await app.listen({ port, host: "0.0.0.0" });
console.log(`EdgeBench backend listening on :${port}`);
