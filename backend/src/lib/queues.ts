import { Queue } from "bullmq";
import { redis } from "./redis.js";

export interface JudgeJobData {
  runId: string;
  rawOutputs: string[];
  model: string;
  quantization: string;
}

export const judgeQueue = new Queue<JudgeJobData>("judge", { connection: redis });
