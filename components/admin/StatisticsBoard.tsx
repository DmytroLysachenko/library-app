import React from "react";
import { asc, count, desc, eq, gt } from "drizzle-orm";
import dayjs from "dayjs";

import { db } from "@/db/drizzle";
import { appStatsRecords, books, borrowRecords, users } from "@/db/schema";
import AutoRecorderIndicator from "./AutoRecorderIndicator";

const StatCard = ({
  label,
  count,
  change,
}: {
  label: string;
  count: number;
  change: number | null;
}) => {
  return (
    <div className="stat">
      <div className="stat-info">
        <p className="stat-label">{label}</p>
        {change && (
          <p
            className={`text-sm font-medium ${change > 0 ? "text-green-500" : change < 0 ? "text-red-500" : "text-gray-500"}`}
          >
            {change > 0 ? "+" : change < 0 ? "-" : ""} {Math.abs(change)}
          </p>
        )}
      </div>
      <p className="stat-count">{count}</p>
    </div>
  );
};

const StatisticsBoard = async () => {
  const [
    lastStatsRecord,
    totalBooks,
    totalUsers,
    totalBorrowedBooks,
    lastStatRecordStatus,
  ] = await Promise.all([
    db
      .select()
      .from(appStatsRecords)
      .orderBy(asc(appStatsRecords.createdAt))
      .where(gt(appStatsRecords.createdAt, dayjs().subtract(2, "day").toDate()))
      .then((res) => (res.length ? res[0] : null)),

    db
      .select({ totalCopies: books.totalCopies })
      .from(books)
      .then((res) => res.reduce((total, book) => total + book.totalCopies, 0)),

    db
      .select({ count: count(users.id) })
      .from(users)
      .then((res) => res[0].count),

    db
      .select({ count: count(borrowRecords.id) })
      .from(borrowRecords)
      .where(eq(borrowRecords.status, "BORROWED"))
      .then((res) => res[0].count),
    db
      .select()
      .from(appStatsRecords)
      .orderBy(desc(appStatsRecords.createdAt))
      .limit(1)
      .then((res) => (res.length ? res[0].statsRecordingStatus : false)),
  ]);

  const changedUsers = lastStatsRecord
    ? totalUsers - lastStatsRecord.totalUsers
    : null;
  const changedBooks = lastStatsRecord
    ? totalBooks - lastStatsRecord.totalBooks
    : null;
  const changedBorrowedBooks = lastStatsRecord
    ? totalBorrowedBooks - lastStatsRecord.totalBorrowedBooks
    : null;

  return (
    <section className="grid grid-cols-3 gap-5 mb-10">
      <AutoRecorderIndicator status={lastStatRecordStatus} />
      <StatCard
        label="Borrowed Books"
        count={totalBorrowedBooks}
        change={changedBorrowedBooks}
      />
      <StatCard
        label="Total Users"
        count={totalUsers}
        change={changedUsers}
      />
      <StatCard
        label="Total Books"
        count={totalBooks}
        change={changedBooks}
      />
    </section>
  );
};

export default StatisticsBoard;
