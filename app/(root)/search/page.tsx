import React, { Suspense } from "react";

import BookList from "@/components/BookList";
import SearchSection from "@/components/SearchSection";
import { db } from "@/db/drizzle";

import { books } from "@/db/schema";
import { count, desc, ilike, or } from "drizzle-orm";
import BooksPagination from "@/components/BooksPagination";
import NotFoundSection from "@/components/NotFoundSection";
import { getBooksSortingOrder } from "@/lib/utils";

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{
    query: string;
    page: string;
    sort: "oldest" | "newest" | "available" | "highestRated";
  }>;
}) => {
  const { query, page = 1, sort } = await searchParams;

  const filteredBooks = (await db
    .select({
      id: books.id,
      title: books.title,
      genre: books.genre,
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
    );

  return (
    <>
      <SearchSection />
      {filteredBooks.length > 0 ? (
        <>
          <Suspense fallback={"Loading"}>
            <BookList
              books={filteredBooks}
              title={"Search Results"}
              containerClassName="pb-20"
              isSearch={true}
            />
          </Suspense>
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
