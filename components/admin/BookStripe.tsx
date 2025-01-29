import React from "react";
import BookCover from "../BookCover";
import { Calendar } from "lucide-react";
import dayjs from "dayjs";
import Link from "next/link";

const BookStripe = ({ book }: { book: Book }) => {
  return (
    <Link
      href={`/books/${book.id}`}
      target="_blank"
      className="book-stripe"
    >
      <BookCover
        coverUrl={book.coverUrl}
        coverColor={book.coverColor}
        variant="small"
      />
      <div className="flex-1">
        <h3 className="title">{book.title}</h3>
        <div className="author">
          <p>By {book.author}</p>
          <div />
          <p>{book.genre}</p>
        </div>
        <div className="borrow-date">
          <Calendar className="w-3" />
          <p>{dayjs(book.createdAt).format("DD/MM/YY")}</p>
        </div>
      </div>
    </Link>
  );
};
export default BookStripe;
