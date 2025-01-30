import { db } from "@/db/drizzle";
import { appStatsRecords, books, borrowRecords, users } from "@/db/schema";
import { serve } from "@upstash/workflow/nextjs";
import { count, desc, eq } from "drizzle-orm";

type InitialData = {
  totalUsers: number;
  totalBooks: number;
  totalBorrowedBooks: number;
  statsRecordingStatus: boolean;
};

export const { POST } = serve<InitialData>(async (context) => {
  let { statsRecordingStatus } = context.requestPayload;

  while (statsRecordingStatus) {
    await context.run("set-record", async () => {
      const totalUsers = await db
        .select({ value: count() })
        .from(users)
        .then((res) => res[0].value);

      const totalBooks = await db
        .select({ value: count() })
        .from(books)
        .then((res) => res[0].value);

      const totalBorrowedBooks = await db
        .select({ value: count() })
        .from(borrowRecords)
        .where(eq(borrowRecords.status, "BORROWED"))
        .then((res) => res[0].value);

      const newRecord = await db.insert(appStatsRecords).values({
        totalUsers,
        totalBooks,
        totalBorrowedBooks,
      });
    });

    await context.sleep("wait-for-1-day", 60 * 60 * 24);
  }
});
