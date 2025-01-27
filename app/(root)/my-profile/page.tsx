import React from "react";
import { eq } from "drizzle-orm";

import { auth } from "@/auth";
import BookList from "@/components/BookList";
import { db } from "@/db/drizzle";
import { books, borrowRecords, users } from "@/db/schema";
import UserInformation from "@/components/UserInformation";

const page = async () => {
  const session = await auth();

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session?.user?.id as string))
    .limit(1);

  console.log(user, session);

  const borrowedBooks = (await db
    .select({
      id: books.id,
      title: books.title,
      author: books.author,
      genre: books.genre,
      rating: books.rating,
      coverUrl: books.coverUrl,
      coverColor: books.coverColor,
      description: books.description,
      totalCopies: books.totalCopies,
      availableCopies: books.availableCopies,
      videoUrl: books.videoUrl,
      summary: books.summary,
      createdAt: books.createdAt,
      borrowDate: borrowRecords.createdAt,
      dueDate: borrowRecords.dueDate,
      returnDate: borrowRecords.returnDate,
      status: borrowRecords.status,
    }) // Explicitly specify the fields from books
    .from(borrowRecords)
    .leftJoin(books, eq(borrowRecords.bookId, books.id))
    .where(eq(borrowRecords.userId, session?.user?.id as string))) as Book[];

  return (
    <div className="flex flex-col md:flex-row justify-evenly gap-10">
      <UserInformation user={user} />
      <BookList
        title="Borrowed Books"
        books={borrowedBooks}
      />
    </div>
  );
};

export default page;
