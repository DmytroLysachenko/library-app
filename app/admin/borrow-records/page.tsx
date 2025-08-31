import React from "react";
import { and, asc, count, desc, eq, ilike, or } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { books, borrowRecords, users } from "@/db/schema";
import { dateSortOptions, PER_PAGE_LIMITS } from "@/constants";
import ListPagination from "@/components/ListPagination";
import EmptyState from "@/components/admin/EmptyState";
import BorrowRecordsTable from "@/components/admin/BorrowRecordsTable";
import SortSelector from "@/components/SortSelector";

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{
    page: string;
    sort: string;
    query: string;
  }>;
}) => {
  const { sort, query, page = 1 } = await searchParams;
  const perPage = PER_PAGE_LIMITS.adminBorrowRecords;

  const [allRecords, totalCountResults] = await Promise.all([
    db
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
          eq(borrowRecords.status, "RETURNED"),
          query
            ? or(
                ilike(users.fullName, `%${query}%`),
                ilike(books.title, `%${query}%`)
              )
            : undefined
        )
      )
      .limit(perPage)
      .offset((Number(page) - 1) * perPage)
      .then((res) => {
        return res.map((record) => ({
          ...record.borrow_records,
          book: { ...record.books },
          user: { ...record.users },
        }));
      }) as Promise<BorrowRecord[]>,
    db
      .select({ count: count() })
      .from(borrowRecords)
      .where(
        and(
          eq(borrowRecords.status, "RETURNED"),
          query
            ? or(
                ilike(users.fullName, `%${query}%`),
                ilike(books.title, `%${query}%`)
              )
            : undefined
        )
      )
      .limit(1)
      .then((res) => res[0].count),
  ]);

  return (
    <section className="admin-container">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold"> Borrow book records</h2>

        <SortSelector
          options={dateSortOptions}
          param="sort"
          variant="admin"
        />
      </div>

      {allRecords.length ? (
        <BorrowRecordsTable records={allRecords} />
      ) : (
        <EmptyState
          title="No Record"
          description="There are currently no any borrow records exists."
          containerStyle="mt-20"
        />
      )}

      {Number(page) <= Math.ceil(totalCountResults / perPage) && (
        <ListPagination
          currentPage={Number(page)}
          lastPage={Math.ceil(totalCountResults / perPage)}
          variant="admin"
        />
      )}
    </section>
  );
};

export default Page;
