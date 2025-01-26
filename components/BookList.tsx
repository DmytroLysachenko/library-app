import React from "react";

import BookCard from "./BookCard";
import SortSelector from "./SortSelector";

interface BookListProps {
  title: string;
  books: Book[];
  containerClassName?: string;
  isSearch?: boolean;
}

const BookList = ({
  title,
  books,
  containerClassName,
  isSearch,
}: BookListProps) => {
  return (
    <section className={containerClassName}>
      <div className="flex justify-between">
        <h2 className="font-bebas-neue text-4xl text-light-100">{title}</h2>
        {isSearch && <SortSelector />}
      </div>

      <ul className="book-list">
        {books.map((book, index) => (
          <BookCard
            key={book.title + index}
            {...book}
          />
        ))}
      </ul>
    </section>
  );
};

export default BookList;
