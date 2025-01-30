"use server";

import { db } from "@/db/drizzle";
import { books, borrowRecords, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import dayjs from "dayjs";
import { workflowClient } from "../workflow";
import config from "../config";

export const borrowBook = async (params: BorrowBookParams) => {
  const { userId, bookId } = params;
  const dueDate = dayjs().add(7, "day").toDate().toDateString();
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
    const [user, record] = await Promise.all([
      db
        .select({
          borrowedBooks: users.borrowedBooks,
          name: users.fullName,
          mail: users.email,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)
        .then((res) => res[0]),
      db
        .insert(borrowRecords)
        .values({
          userId,
          bookId,
          dueDate,
          status: "PENDING",
        })
        .returning()
        .then((res) => res[0]),
    ]);

    Promise.all([
      db
        .update(books)
        .set({ availableCopies: book[0].availableCopies - 1 })
        .where(eq(books.id, bookId)),
      db
        .update(users)
        .set({
          lastActivityDate: new Date().toISOString().slice(0, 10),
          borrowedBooks: user.borrowedBooks + 1,
        })
        .where(eq(users.id, userId)),
      workflowClient.trigger({
        url: `${config.env.prodApiEndpoint}/api/workflows/book`,
        body: {
          bookId,
          borrowRecordId: record.id,
          bookTitle: book[0].bookTitle,
          bookBorrowDate: dayjs().toDate().toDateString(),
          bookDueDate: dueDate,
          studentName: user.name,
          userEmail: user.mail,
        },
      }),
    ]);

    return { success: true, data: JSON.parse(JSON.stringify(record)) };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      error: "An error occured while borrowing the book",
    };
  }
};
