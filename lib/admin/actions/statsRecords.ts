"use server";

import { headers } from "next/headers";
import { workflowClient } from "@/lib/workflow";
import config from "@/lib/config";
import { statsRecorderRatelimit } from "@/lib/ratelimit";

export const setStatsRecorderStatus = async (statsRecordingStatus: boolean) => {
  try {
    const { success } = await statsRecorderRatelimit.limit(
      (await headers()).get("x-forwarded-for") || "127.0.0.1"
    );

    if (!success) throw new Error("Too many requests, try again later");

    await workflowClient.trigger({
      url: `${config.env.prodApiEndpoint}/api/workflows/app-stats`,
      body: {
        statsRecordingStatus,
      },
    });

    return { success: true };
  } catch (error) {
    console.log(error, "ChangeRecordingStatus error");
    return { success: false, error: "Change recording status error" };
  }
};
