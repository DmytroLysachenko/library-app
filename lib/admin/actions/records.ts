"use server";

import { EmailTemplate } from "@/constants";
import { db } from "@/db/drizzle";
import { books, borrowRecords, users } from "@/db/schema";
import config from "@/lib/config";
import { sendEmail } from "@/lib/email";
import { workflowClient } from "@/lib/workflow";
import dayjs from "dayjs";
import { eq } from "drizzle-orm";

export const confirmBookReturnStatus = async (recordId: string) => {
  try {
    const [data, newRecord] = await Promise.all([
      await db
        .select({
          bookId: borrowRecords.bookId,
          bookTitle: books.title,
          availableCopies: books.availableCopies,
          email: users.email,
          studentName: users.fullName,
        })
        .from(borrowRecords)
        .where(eq(borrowRecords.id, recordId))
        .leftJoin(books, eq(borrowRecords.bookId, books.id))
        .leftJoin(users, eq(borrowRecords.userId, users.id))
        .limit(1)
        .then((res) => res[0]),
      db
        .update(borrowRecords)
        .set({
          status: "RETURNED",
          returnDate: new Date().toISOString().slice(0, 10),
        })
        .where(eq(borrowRecords.id, recordId))
        .returning()
        .then((res) => res[0]),
    ]);

    await Promise.all([
      db
        .update(books)
        .set({
          availableCopies: (data.availableCopies || 0) + 1,
        })
        .where(eq(books.id, data.bookId)),
      sendEmail({
        to: data.email as string,
        subject: "Thank You for Returning the Book!",
        template: EmailTemplate.RETURN_CONFIRMATION,
        data: {
          studentName: data.studentName as string,
          bookTitle: data.bookTitle as string,
          exploreUrl: "https://library-app-rust-five.vercel.app",
        },
      }),
    ]);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(newRecord)),
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      message: "An error occurred while updating record status",
    };
  }
};

export const confirmBookBorrowStatus = async (recordId: string) => {
  const dueDate = dayjs().add(7, "day").format("YYYY-MM-DD");

  try {
    const [data, newRecord] = await Promise.all([
      db
        .select({
          bookId: borrowRecords.bookId,
          userId: borrowRecords.userId,
          bookTitle: books.title,
          availableCopies: books.availableCopies,
          email: users.email,
          studentName: users.fullName,
          userBorrowedBooks: users.borrowedBooks,
          borrowDate: borrowRecords.createdAt,
        })
        .from(borrowRecords)
        .where(eq(borrowRecords.id, recordId))
        .leftJoin(books, eq(borrowRecords.bookId, books.id))
        .leftJoin(users, eq(borrowRecords.userId, users.id))
        .limit(1)
        .then((res) => res[0]) as Promise<{
        bookId: string;
        userId: string;
        bookTitle: string;
        availableCopies: number;
        email: string;
        studentName: string;
        userBorrowedBooks: number;
        borrowDate: Date;
      }>,
      db
        .update(borrowRecords)
        .set({
          status: "BORROWED",
          dueDate,
        })
        .where(eq(borrowRecords.id, recordId))
        .returning()
        .then((res) => res[0]),
    ]);

    Promise.all([
      db
        .update(books)
        .set({ availableCopies: data.availableCopies - 1 })
        .where(eq(books.id, data.bookId)),
      db
        .update(users)
        .set({
          lastActivityDate: new Date().toISOString().slice(0, 10),
          borrowedBooks: data.userBorrowedBooks + 1,
        })
        .where(eq(users.id, data.userId)),
    ]);

    await workflowClient.trigger({
      url: `${config.env.prodApiEndpoint}/api/workflows/book`,
      body: {
        bookId: data.bookId,
        borrowRecordId: recordId,
        bookTitle: data.bookTitle,
        bookBorrowDate: data.borrowDate,
        bookDueDate: dueDate,
        studentName: data.studentName,
        userEmail: data.email,
      },
    });

    return {
      success: true,
      data: JSON.parse(JSON.stringify(newRecord)),
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      message: "An error occurred while updating record status",
    };
  }
};

export const deleteRecord = async (recordId: string) => {
  try {
    await db.delete(borrowRecords).where(eq(borrowRecords.id, recordId));

    return {
      success: true,
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      message: "An error occurred while deleting the record",
    };
  }
};
