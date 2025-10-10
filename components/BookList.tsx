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
  const baseTestId =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "book-list";

  return (
    <section
      className={containerClassName}
      data-testid={`book-list-${baseTestId}`}
    >
      <div className="flex justify-between" data-testid={`book-list-header-${baseTestId}`}>
        <h2
          className="font-bebas-neue text-4xl text-light-100"
          data-testid={`book-list-heading-${baseTestId}`}
        >
          {title}
        </h2>

        {isSearch && (
          <SortSelector
            options={userSideBookSorts}
            param="sort"
            variant="user"
            dataTestId={`sort-selector-${baseTestId}`}
          />
        )}
      </div>

      <Suspense fallback={<BookCardsListLoadingSkeleton />}>
        <BookListEntries
          booksPromise={booksPromise}
          emptyState={emptyState}
          baseTestId={baseTestId}
        />
      </Suspense>
    </section>
  );
};

const BookListEntries = async ({
  booksPromise,
  emptyState,
  baseTestId,
}: {
  booksPromise: Promise<BookCard[]>;
  emptyState?: React.ReactNode;
  baseTestId: string;
}) => {
  const books = await booksPromise;
  return books.length ? (
    <ul
      className="book-list"
      data-testid={`book-list-items-${baseTestId}`}
    >
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
