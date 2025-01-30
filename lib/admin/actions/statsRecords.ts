"use server";

import { headers } from "next/headers";
import { workflowClient } from "@/lib/workflow";
import config from "@/lib/config";
import { statsRecorderRatelimit } from "@/lib/ratelimit";
import { db } from "@/db/drizzle";
import { count, eq } from "drizzle-orm";
import { books, borrowRecords, users } from "@/db/schema";

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

export const fetchStatistics = async () => {
  const [userCount, bookCount, borrowedCount] = await Promise.all([
    db
      .select({ count: count(users.id) })
      .from(users)
      .then((res) => res[0]?.count || 0),
    db
      .select({ totalCopies: books.totalCopies })
      .from(books)
      .then((res) => res.reduce((total, book) => total + book.totalCopies, 0)),
    db
      .select({ count: count(borrowRecords.id) })
      .from(borrowRecords)
      .where(eq(borrowRecords.status, "BORROWED"))
      .then((res) => res[0]?.count || 0),
  ]);

  return {
    totalUsers: userCount,
    totalBooks: bookCount,
    totalBorrowedBooks: borrowedCount,
  };
};
