import { Client as WorkflowClient } from "@upstash/workflow";

export const workflowClient = new WorkflowClient({
  baseUrl: process.env.UPSTASH_QSTASH_URL!,
  token: process.env.UPSTASH_QSTASH_TOKEN!,
});
