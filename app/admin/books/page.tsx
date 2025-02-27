import React from "react";
import Link from "next/link";
import { asc, count, desc, ilike } from "drizzle-orm";

import BooksTable from "@/components/admin/BooksTable";
import SortSelector from "@/components/SortSelector";
import { Button } from "@/components/ui/button";
import { db } from "@/db/drizzle";
import { books } from "@/db/schema";
import { alphabeticalSortOptions } from "@/constants";
import ListPagination from "@/components/ListPagination";
import EmptyState from "@/components/admin/EmptyState";

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ page: string; sort: string; query: string }>;
}) => {
  const { sort, query, page = 1 } = await searchParams;
  const perPage = 6;
  const [allBooks, totalCountResults] = await Promise.all([
    db
      .select()
      .from(books)
      .where(query ? ilike(books.title, `%${query}%`) : undefined)
      .limit(perPage)
      .offset((Number(page) - 1) * perPage)
      .orderBy(
        sort === "asc" ? asc(books.title) : desc(books.title)
      ) as Promise<Book[]>,
    db
      .select({ count: count() })
      .from(books)
      .where(query ? ilike(books.title, `%${query}%`) : undefined)
      .limit(1)
      .then((res) => res[0].count),
  ]);

  return (
    <div className="admin-container">
      <section className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold"> All Books</h2>
        <div className="flex flex-row items-center gap-10">
          <SortSelector
            options={alphabeticalSortOptions}
            param="sort"
            variant="admin"
          />
          <Button
            className="bg-primary-admin"
            asChild
          >
            <Link
              href={"/admin/books/new"}
              className="text-white"
            >
              + Create new book
            </Link>
          </Button>
        </div>
      </section>
      <BooksTable books={allBooks} />

      {allBooks.length === 0 && (
        <EmptyState
          title="No Books"
          description="There are currently no any books in library collection."
        />
      )}

      {Number(page) <= Math.ceil(totalCountResults / perPage) && (
        <ListPagination
          currentPage={Number(page)}
          lastPage={Math.ceil(totalCountResults / perPage)}
          variant="admin"
        />
      )}
    </div>
  );
};

export default Page;
