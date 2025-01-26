import Link from "next/link";
import React from "react";
import BookCover from "./BookCover";
import { cn } from "@/lib/utils";
import Image from "next/image";
import dayjs from "dayjs";
import { Button } from "./ui/button";

const BookCard = ({
  id,
  title,
  genre,
  coverColor,
  coverUrl,
  status,
  borrowDate,
  dueDate,
  returnDate,
}: Book) => {
  const isLoanedBook = status === "BORROWED" ? true : false;

  const remainingDays = dayjs(dueDate).diff(dayjs(), "days");

  return (
    <li className={cn(isLoanedBook && "xs:w-52 w-full")}>
      <Link
        href={`/books/${id}`}
        className={cn(isLoanedBook && "w-full flex flex-col items-center")}
      >
        <BookCover
          coverColor={coverColor}
          coverUrl={coverUrl}
        />
        <div className={cn("mt-4", !isLoanedBook && "xs:max-w-40 max-w-28")}>
          <p className="book-title">{title}</p>
          <p className="book-genre">{genre}</p>
        </div>
        {isLoanedBook && (
          <div className="mt-3 w-full">
            {borrowDate && (
              <div className="book-loaned mb-2">
                <Image
                  src="/icons/book-2.svg"
                  alt="book"
                  width={18}
                  height={18}
                  className="object-contain"
                />
                <p className="text-light-100">
                  Borrowed on {dayjs(borrowDate).format("MMM DD")}
                </p>
              </div>
            )}

            <div className="book-loaned">
              <Image
                src="/icons/calendar.svg"
                alt="calendar"
                width={18}
                height={18}
                className="object-contain"
              />

              {remainingDays <= 0 ? (
                <p className="text-light-100">Overdue</p>
              ) : (
                <p className="text-light-100">{remainingDays} days left</p>
              )}

              {/* <button className="flex w-fit">
                <Image
                  src="/icons/receipt.svg"
                  alt="receipt"
                  width={18}
                  height={18}
                  className="object-contain"
                />
              </button> */}
            </div>
          </div>
        )}
      </Link>
    </li>
  );
};

export default BookCard;
