"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { books, borrowRecords } from "@/db/schema";

export const borrowBook = async (params: BorrowBookParams) => {
  const { userId, bookId } = params;

  try {
    const book = await db
      .select({
        availableCopies: books.availableCopies,
        bookTitle: books.title,
      })
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1);

    if (!book.length || book[0].availableCopies <= 0) {
      return { success: false, error: "Book is not available" };
    }

    const record = await db
      .insert(borrowRecords)
      .values({
        userId,
        bookId,
        status: "PENDING",
      })
      .returning()
      .then((res) => res[0]);

    return { success: true, data: JSON.parse(JSON.stringify(record)) };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      error: "An error occured while borrowing the book",
    };
  }
};
