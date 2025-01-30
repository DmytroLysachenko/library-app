import React from "react";
import { asc, count, eq, gt } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { appStatsRecords, books, borrowRecords, users } from "@/db/schema";
import dayjs from "dayjs";

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
  const [lastStatsRecord, totalBooks, totalUsers, totalBorrowedBooks] =
    await Promise.all([
      await db
        .select()
        .from(appStatsRecords)
        .orderBy(asc(appStatsRecords.createdAt))
        .where(
          gt(appStatsRecords.createdAt, dayjs().subtract(2, "day").toDate())
        )
        .then((res) => (res.length ? res[0] : null)),

      await db
        .select({ totalCopies: books.totalCopies })
        .from(books)
        .then((res) =>
          res.reduce((total, book) => total + book.totalCopies, 0)
        ),

      await db
        .select({ count: count(users.id) })
        .from(users)
        .then((res) => res[0].count),

      await db
        .select({ count: count(borrowRecords.id) })
        .from(borrowRecords)
        .where(eq(borrowRecords.status, "BORROWED"))
        .then((res) => res[0].count),
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
