import React from "react";
import { count, ilike, or } from "drizzle-orm";

import BookList from "@/components/BookList";
import SearchSection from "@/components/SearchSection";

import NotFoundSection from "@/components/NotFoundSection";
import { db } from "@/db/drizzle";
import { books } from "@/db/schema";
import { getBooksSortingOrder } from "@/lib/utils";
import ListPagination from "@/components/ListPagination";
import { PER_PAGE_LIMITS } from "@/constants";

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{
    query: string;
    page: string;
    sort: string;
  }>;
}) => {
  const { query, page = 1, sort } = await searchParams;
  const perPage = PER_PAGE_LIMITS.searchPage;
  const filteredBooksPromise = db
    .select({
      id: books.id,
      title: books.title,
      genre: books.genre,
      author: books.author,
      coverUrl: books.coverUrl,
      coverColor: books.coverColor,
    })
    .from(books)
    .where(
      query
        ? or(
            ilike(books.title, `%${query}%`),
            ilike(books.genre, `%${query}%`),
            ilike(books.author, `%${query}%`)
          )
        : undefined
    )
    .orderBy(getBooksSortingOrder(sort))
    .limit(perPage)
    .offset((Number(page) - 1) * perPage)
    .then((res) => res) as Promise<Book[]>;

  const totalCountResults = await db
    .select({ count: count() })
    .from(books)
    .where(
      query
        ? or(
            ilike(books.title, `%${query}%`),
            ilike(books.genre, `%${query}%`),
            ilike(books.author, `%${query}%`)
          )
        : undefined
    )
    .limit(1)
    .then((res) => res[0].count);

  return (
    <>
      <SearchSection />

      <BookList
        booksPromise={filteredBooksPromise}
        title={"Search Results"}
        containerClassName="pb-20"
        isSearch={true}
      />

      {totalCountResults > 0 ? (
        <ListPagination
          currentPage={Number(page)}
          lastPage={Math.ceil(totalCountResults / perPage)}
        />
      ) : (
        <NotFoundSection query={query} />
      )}
    </>
  );
};

export default Page;
