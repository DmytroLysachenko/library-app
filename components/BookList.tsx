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
        <BookListEntries booksPromise={booksPromise} />
      </Suspense>
    </section>
  );
};

const BookListEntries = async ({
  booksPromise,
}: {
  booksPromise: Promise<BookCard[]>;
}) => {
  const books = await booksPromise;

  return (
    books.length && (
      <ul className="book-list">
        {books.map((book, index) => (
          <BookCard
            key={book.title + index}
            {...book}
          />
        ))}
      </ul>
    )
  );
};

export default BookList;
