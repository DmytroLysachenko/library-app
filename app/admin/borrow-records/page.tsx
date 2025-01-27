import BorrowRequestsTable from "@/components/admin/BorrowRequestsTable";
import { db } from "@/db/drizzle";
import { books, borrowRecords, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import React from "react";

const Page = async () => {
  const allRecords = (await db
    .select()
    .from(borrowRecords)
    .leftJoin(books, eq(borrowRecords.bookId, books.id))
    .leftJoin(users, eq(borrowRecords.userId, users.id))
    .then((res) => {
      return res.map((record) => ({
        ...record.borrow_records,
        book: { ...record.books },
        user: { ...record.users },
      }));
    })) as BorrowRecord[];

  return (
    <section className="w-full rounded-2xl bg-white p-7">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold"> Borrow book requests</h2>
      </div>
      <BorrowRequestsTable records={allRecords} />
    </section>
  );
};

export default Page;
