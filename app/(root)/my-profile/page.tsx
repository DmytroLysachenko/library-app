import React from "react";
import { and, eq } from "drizzle-orm";

import { auth } from "@/auth";
import BookList from "@/components/BookList";
import { db } from "@/db/drizzle";
import { books, borrowRecords, users } from "@/db/schema";
import UserInformation from "@/components/UserInformation";

const page = async () => {
  const session = await auth();

  const user = (await db
    .select()
    .from(users)
    .where(eq(users.id, session?.user?.id as string))
    .limit(1)
    .then((res) => res[0])) as User;

  const borrowedBooks = (await db
    .select({
      id: books.id,
      title: books.title,
      genre: books.genre,
      coverUrl: books.coverUrl,
      coverColor: books.coverColor,
      borrowDate: borrowRecords.createdAt,
      dueDate: borrowRecords.dueDate,
      returnDate: borrowRecords.returnDate,
      status: borrowRecords.status,
      receiptUrl: borrowRecords.receiptUrl,
    })
    .from(borrowRecords)
    .where(
      and(
        eq(borrowRecords.userId, user.id),
        eq(borrowRecords.status, "BORROWED")
      )
    )
    .leftJoin(books, eq(borrowRecords.bookId, books.id))) as BookCard[];

  const pendingBookRequests = (await db
    .select({
      id: books.id,
      title: books.title,
      genre: books.genre,
      coverUrl: books.coverUrl,
      coverColor: books.coverColor,
      borrowDate: borrowRecords.createdAt,
      dueDate: borrowRecords.dueDate,
      returnDate: borrowRecords.returnDate,
      status: borrowRecords.status,
      receiptUrl: borrowRecords.receiptUrl,
    })
    .from(borrowRecords)
    .where(
      and(
        eq(borrowRecords.userId, user.id),
        eq(borrowRecords.status, "PENDING")
      )
    )
    .leftJoin(books, eq(borrowRecords.bookId, books.id))) as BookCard[];

  return (
    <div className="flex flex-col items-center md:items-start md:flex-row gap-10">
      <UserInformation user={user} />
      <div className="grid grid-cols-1 gap-20">
        <BookList
          title="Borrowed Books"
          books={borrowedBooks}
          emptyState={
            <p className="text-light-100 mt-10 text-lg">
              No borrowed Books for the moment.
            </p>
          }
        />
        {pendingBookRequests.length > 0 && (
          <BookList
            title="Pending Book Requests"
            books={pendingBookRequests}
          />
        )}
      </div>
    </div>
  );
};

export default page;
