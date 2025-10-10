import React from "react";
import Link from "next/link";
import { asc, count, desc, eq, ilike } from "drizzle-orm";

import { auth } from "@/auth";
import { alphabeticalSortOptions, PER_PAGE_LIMITS } from "@/constants";
import BooksTable from "@/components/admin/BooksTable";
import SortSelector from "@/components/SortSelector";
import { Button } from "@/components/ui/button";
import ListPagination from "@/components/ListPagination";
import EmptyState from "@/components/admin/EmptyState";
import { db } from "@/db/drizzle";
import { books, users } from "@/db/schema";

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ page: string; sort: string; query: string }>;
}) => {
  const { sort, query, page = 1 } = await searchParams;
  const perPage = PER_PAGE_LIMITS.adminBooks;

  const session = await auth();

  const [allBooks, totalCountResults, userRole] = await Promise.all([
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
    db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session?.user?.id as string))
      .limit(1)
      .then((res) => res[0].role),
  ]);

  const isTestAccount = userRole === "TEST";

  return (
    <div className="admin-container">
      <section className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold" data-testid="admin-books-heading">
          All Books
        </h2>
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
              className="text-white hover:bg-primary-admin/80"
              data-testid="admin-books-create"
            >
              + Create new book
            </Link>
          </Button>
        </div>
      </section>

      {allBooks.length ? (
        <BooksTable
          books={allBooks}
          isTestAccount={isTestAccount}
        />
      ) : (
        <EmptyState
          title="No Books"
          description="There are currently no any books in library collection."
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
    </div>
  );
};

export default Page;
