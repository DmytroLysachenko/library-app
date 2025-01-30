"use server";

import { EmailTemplate } from "@/constants";
import { db } from "@/db/drizzle";
import { books, borrowRecords, users } from "@/db/schema";
import { sendEmail } from "@/lib/email";
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
