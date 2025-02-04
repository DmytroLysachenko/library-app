"use server";

import { EmailTemplate } from "@/constants";
import { db } from "@/db/drizzle";
import { books, borrowRecords, users } from "@/db/schema";
import config from "@/lib/config";
import { sendEmail } from "@/lib/email";
import { generatePdf } from "@/lib/utils";
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
          exploreUrl: config.env.prodApiEndpoint,
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
    const data = (await db
      .select({
        bookId: borrowRecords.bookId,
        userId: borrowRecords.userId,
        bookTitle: books.title,
        bookAuthor: books.author,
        bookGenre: books.genre,
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
      .then((res) => res[0])) as {
      bookId: string;
      userId: string;
      bookTitle: string;
      bookAuthor: string;
      bookGenre: string;
      availableCopies: number;
      email: string;
      studentName: string;
      userBorrowedBooks: number;
      borrowDate: Date;
    };

    const newRecord = await db
      .update(borrowRecords)
      .set({
        status: "BORROWED",
        dueDate,
      })
      .where(eq(borrowRecords.id, recordId))
      .returning()
      .then((res) => res[0]);

    await Promise.all([
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
        bookBorrowDate: data.borrowDate.toISOString().slice(0, 10),
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

export const generateReceipt = async (recordId: string) => {
  try {
    const data = (await db
      .select({
        bookId: borrowRecords.bookId,
        userId: borrowRecords.userId,
        bookTitle: books.title,
        bookAuthor: books.author,
        bookGenre: books.genre,
        availableCopies: books.availableCopies,
        email: users.email,
        studentName: users.fullName,
        userBorrowedBooks: users.borrowedBooks,
        borrowDate: borrowRecords.createdAt,
        dueDate: borrowRecords.dueDate,
      })
      .from(borrowRecords)
      .where(eq(borrowRecords.id, recordId))
      .leftJoin(books, eq(borrowRecords.bookId, books.id))
      .leftJoin(users, eq(borrowRecords.userId, users.id))
      .limit(1)
      .then((res) => res[0])) as {
      bookId: string;
      userId: string;
      bookTitle: string;
      bookAuthor: string;
      bookGenre: string;
      availableCopies: number;
      email: string;
      studentName: string;
      userBorrowedBooks: number;
      borrowDate: Date;
      dueDate: string;
    };

    const borrowReceiptPdf = await generatePdf({
      receiptId: recordId,
      studentName: data.studentName,
      bookTitle: data.bookTitle,
      bookAuthor: data.bookAuthor,
      bookGenre: data.bookGenre,
      borrowDate: dayjs(data.borrowDate).format("YYYY-MM-DD"),
      dueDate: dayjs(data.dueDate).format("YYYY-MM-DD"),
      duration: 7,
      issueDate: dayjs().format("YYYY-MM-DD"),
      websiteUrl: config.env.prodApiEndpoint,
      supportEmail: "libraryview-support@mail.com",
    });

    const newRecord = await db
      .update(borrowRecords)
      .set({
        receiptUrl: borrowReceiptPdf,
      })
      .where(eq(borrowRecords.id, recordId))
      .returning()
      .then((res) => res[0]);

    await sendEmail({
      to: data.email,
      subject: "Book receipt",
      template: EmailTemplate.RECEIPT_GENERATED,
      data: {
        studentName: data.studentName,
        bookTitle: data.bookTitle,
        borrowDate: dayjs(data.borrowDate).format("YYYY-MM-DD"),
        dueDate: dayjs(data.dueDate).format("YYYY-MM-DD"),
        downloadUrl: borrowReceiptPdf,
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
