import { serve } from "@upstash/workflow/nextjs";
import { desc } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { appStatsRecords } from "@/db/schema";
import { fetchStatistics } from "@/lib/admin/actions/statsRecords";

interface InitialData {
  statsRecordingStatus: boolean;
}

export const { POST } = serve<InitialData>(async (context) => {
  const { statsRecordingStatus } = context.requestPayload;

  await context.run("set-first-record", async () => {
    const stats = await fetchStatistics();

    await db.insert(appStatsRecords).values({
      ...stats,
      statsRecordingStatus,
    });
  });

  while (statsRecordingStatus) {
    await context.sleep("wait-for-1-day", 60 * 60 * 24);

    const latestStatus = await db
      .select({ status: appStatsRecords.statsRecordingStatus })
      .from(appStatsRecords)
      .orderBy(desc(appStatsRecords.createdAt))
      .limit(1)
      .then((res) => res[0]?.status ?? false);

    if (!latestStatus) break;

    await context.run("set-record", async () => {
      const stats = await fetchStatistics();

      await db.insert(appStatsRecords).values({
        ...stats,
        statsRecordingStatus: latestStatus,
      });
    });
  }
});
