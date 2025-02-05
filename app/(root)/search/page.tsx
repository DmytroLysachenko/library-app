import React from "react";
import { count, ilike, or } from "drizzle-orm";

import BookList from "@/components/BookList";
import SearchSection from "@/components/SearchSection";

import NotFoundSection from "@/components/NotFoundSection";
import { db } from "@/db/drizzle";
import { books } from "@/db/schema";
import { getBooksSortingOrder } from "@/lib/utils";
import ListPagination from "@/components/ListPagination";

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

  const filteredBooks = (await db
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
    .limit(12)
    .offset(12 * (Number(page) - 1))) as Book[];

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
      {filteredBooks.length > 0 ? (
        <>
          <BookList
            books={filteredBooks}
            title={"Search Results"}
            containerClassName="pb-20"
            isSearch={true}
          />

          <ListPagination
            currentPage={Number(page)}
            lastPage={Math.ceil(totalCountResults / 12)}
          />
        </>
      ) : (
        <NotFoundSection query={query} />
      )}
    </>
  );
};

export default Page;
