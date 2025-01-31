import React from "react";
import { and, asc, desc, eq, ilike, ne } from "drizzle-orm";

import BorrowRecordsTable from "@/components/admin/BorrowRecordsTable";
import SortSelector from "@/components/admin/SortSelector";
import { db } from "@/db/drizzle";
import { books, borrowRecords, users } from "@/db/schema";

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ page: string; sort: "asc" | "desc"; query: string }>;
}) => {
  const { sort, query } = await searchParams;

  const allRecords = (await db
    .select()
    .from(borrowRecords)
    .leftJoin(books, eq(borrowRecords.bookId, books.id))
    .leftJoin(users, eq(borrowRecords.userId, users.id))
    .orderBy(
      sort === "asc"
        ? asc(borrowRecords.createdAt)
        : desc(borrowRecords.createdAt)
    )
    .where(
      and(
        ne(borrowRecords.status, "RETURNED"),
        query ? ilike(users.fullName, `%${query}%`) : undefined
      )
    )
    .then((res) => {
      return res.map((record) => ({
        ...record.borrow_records,
        book: { ...record.books },
        user: { ...record.users },
      }));
    })) as BorrowRecord[];

  return (
    <section className="admin-container">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold"> Borrow book requests</h2>
        <SortSelector type="date" />
      </div>
      <BorrowRecordsTable
        records={allRecords}
        isRequest
      />
    </section>
  );
};

export default Page;
