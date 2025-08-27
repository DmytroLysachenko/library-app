import React, { Suspense } from "react";

import BookCard from "./BookCard";
import SortSelector from "./SortSelector";
import { userSideBookSorts } from "@/constants";
import BookCardsListLoadingSkeleton from "./BookCardsListLoadingSkeleton";

interface BookListProps {
  title: string;
  booksPromise: Promise<BookCard[]>;
  containerClassName?: string;
  isSearch?: boolean;
  emptyState?: React.ReactNode;
}

const BookList = ({
  title,
  booksPromise,
  containerClassName,
  isSearch,
  emptyState,
}: BookListProps) => {
  return (
    <section className={containerClassName}>
      <div className="flex justify-between">
        <h2 className="font-bebas-neue text-4xl text-light-100">{title}</h2>

        {isSearch && (
          <SortSelector
            options={userSideBookSorts}
            param="sort"
            variant="user"
          />
        )}
      </div>

      <Suspense fallback={<BookCardsListLoadingSkeleton />}>
        <BookListEntries
          booksPromise={booksPromise}
          emptyState={emptyState}
        />
      </Suspense>
    </section>
  );
};

const BookListEntries = async ({
  booksPromise,
  emptyState,
}: {
  booksPromise: Promise<BookCard[]>;
  emptyState?: React.ReactNode;
}) => {
  const books = await booksPromise;

  return books.length ? (
    <ul className="book-list">
      {books.map((book, index) => (
        <BookCard
          key={book.title + index}
          {...book}
        />
      ))}
    </ul>
  ) : emptyState ? (
    emptyState
  ) : null;
};

export default BookList;
