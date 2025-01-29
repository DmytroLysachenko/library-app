import { Client as WorkflowClient } from "@upstash/workflow";
import { config } from "dotenv";

config({ path: ".env.local" });

const getWorkflowClient = () => {
  console.log({
    baseUrl: process.env.UPSTASH_QSTASH_URL!,
    token: process.env.UPSTASH_QSTASH_TOKEN!,
  });
  return new WorkflowClient({
    baseUrl: process.env.UPSTASH_QSTASH_URL!,
    token: process.env.UPSTASH_QSTASH_TOKEN!,
  });
};

export const workflowClient = getWorkflowClient();
