import React from "react";

import BookList from "@/components/BookList";
import SearchSection from "@/components/SearchSection";
import { db } from "@/db/drizzle";

import { books } from "@/db/schema";
import { count, ilike, or } from "drizzle-orm";
import BooksPagination from "@/components/BooksPagination";
import NotFoundSection from "@/components/NotFoundSection";

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ filter: string; page: string }>;
}) => {
  const { filter: query, page = 1 } = await searchParams;

  const filteredBooks = await db
    .select()
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
    .limit(12)
    .offset(12 * (Number(page) - 1));

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
    );

  return (
    <>
      <SearchSection />
      {filteredBooks.length > 0 ? (
        <>
          <BookList
            books={filteredBooks}
            title={"Search Results"}
            containerClassName="pb-20"
          />
          <BooksPagination
            currentPage={Number(page)}
            lastPage={Math.ceil(totalCountResults[0].count / 12)}
          />
        </>
      ) : (
        <NotFoundSection query={query} />
      )}
    </>
  );
};

export default Page;
