import { Client as WorkflowClient } from "@upstash/workflow";
import { config } from "dotenv";

config({ path: ".env.local" });

export const workflowClient = new WorkflowClient({
  baseUrl: process.env.UPSTASH_QSTASH_URL!,
  token: process.env.UPSTASH_QSTASH_TOKEN!,
});
