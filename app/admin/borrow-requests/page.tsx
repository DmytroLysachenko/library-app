import React from "react";
import { and, asc, count, desc, eq, ilike, ne, or } from "drizzle-orm";

import BorrowRecordsTable from "@/components/admin/BorrowRecordsTable";
import SortSelector from "@/components/SortSelector";
import { db } from "@/db/drizzle";
import { books, borrowRecords, users } from "@/db/schema";
import { dateSortOptions, requestStatusSortOptions } from "@/constants";
import { LucideFileQuestion } from "lucide-react";
import { getBorrowRequestsFilterValue } from "@/lib/utils";
import ListPagination from "@/components/ListPagination";
import EmptyState from "@/components/admin/EmptyState";

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{
    page: string;
    sort: string;
    query: string;
    status: string;
  }>;
}) => {
  const { sort, query, status, page = 1 } = await searchParams;
  const perPage = 6;

  const [allRequests, totalCountResults] = await Promise.all([
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
          status
            ? eq(borrowRecords.status, getBorrowRequestsFilterValue(status))
            : ne(borrowRecords.status, "RETURNED"),
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
          status
            ? eq(borrowRecords.status, getBorrowRequestsFilterValue(status))
            : ne(borrowRecords.status, "RETURNED"),
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
        <h2 className="text-xl font-semibold"> Borrow book requests</h2>

        <div className="flex flex-row items-center gap-4">
          <SortSelector
            options={requestStatusSortOptions}
            param="status"
            variant="admin"
            placeholder="Request status"
            placeholderIcon={<LucideFileQuestion className="mr-2 h-4 w-4" />}
          />

          <SortSelector
            options={dateSortOptions}
            param="sort"
            variant="admin"
          />
        </div>
      </div>

      <BorrowRecordsTable
        records={allRequests}
        isRequest
      />

      {allRequests.length === 0 && (
        <EmptyState
          title="No Requests"
          description="There are no borrow requests at the moment."
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
