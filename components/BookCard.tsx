import Link from "next/link";
import React from "react";
import BookCover from "./BookCover";
import { cn } from "@/lib/utils";
import Image from "next/image";
import dayjs from "dayjs";

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
}: BookCard) => {
  const isLoanedBook = Boolean(status);
  const isReturnedBook = status === "RETURNED";

  const remainingDays = dayjs(dueDate).diff(dayjs(), "days");

  return (
    <li className={cn(isLoanedBook && "xs:w-52 w-full")}>
      <Link
        href={`/books/${id}`}
        className={cn(
          isLoanedBook && "w-full flex flex-col items-center relative"
        )}
      >
        {isLoanedBook && !isReturnedBook && remainingDays <= 0 && (
          <Image
            src="/icons/warning.svg"
            alt="warning"
            width={20}
            height={20}
            className="absolute -top-3 left-1"
          />
        )}

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
                src={
                  isReturnedBook
                    ? "/icons/tick.svg"
                    : remainingDays >= 0
                      ? "/icons/calendar.svg"
                      : "/icons/warning.svg"
                }
                alt={
                  isReturnedBook
                    ? "tick"
                    : remainingDays >= 0
                      ? "calendar"
                      : "warning"
                }
                width={18}
                height={18}
                className="object-contain"
              />

              {isReturnedBook ? (
                <p className="text-light-100">
                  Returned on {dayjs(returnDate).format("MMM DD")}
                </p>
              ) : remainingDays >= 0 ? (
                <p className="text-light-100">{remainingDays} days left</p>
              ) : (
                <p className="text-[#FF6C6F]">Overdue Return</p>
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
