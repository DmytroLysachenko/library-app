import { auth, signOut } from "@/auth";
import BookList from "@/components/BookList";
import UserInfo from "@/components/UserInfo";

import { db } from "@/db/drizzle";
import { books, borrowRecords } from "@/db/schema";
import { eq } from "drizzle-orm";
import React from "react";

const page = async () => {
  const session = await auth();

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
    }) // Explicitly specify the fields from books
    .from(borrowRecords)
    .leftJoin(books, eq(borrowRecords.bookId, books.id))
    .where(eq(borrowRecords.userId, session?.user?.id as string))) as Book[];

  return (
    <>
      <UserInfo
        user={session?.user}
        containerClassName={"mb-20"}
      />
      <BookList
        title="Borrowed Books"
        books={borrowedBooks}
      />
    </>
  );
};

export default page;
