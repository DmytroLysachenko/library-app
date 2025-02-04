import React from "react";

import BookCard from "./BookCard";
import SortSelector from "./SortSelector";

interface BookListProps {
  title: string;
  books: BookCard[];
  containerClassName?: string;
  isSearch?: boolean;
  emptyState?: React.ReactNode;
}

const BookList = ({
  title,
  books,
  containerClassName,
  isSearch,
  emptyState,
}: BookListProps) => {
  return (
    <section className={containerClassName}>
      <div className="flex justify-between">
        <h2 className="font-bebas-neue text-4xl text-light-100">{title}</h2>
        {isSearch && <SortSelector />}
      </div>
      {books.length ? (
        <ul className="book-list">
          {books.map((book, index) => (
            <BookCard
              key={book.title + index}
              {...book}
            />
          ))}
        </ul>
      ) : (
        (emptyState ?? null)
      )}
    </section>
  );
};

export default BookList;
