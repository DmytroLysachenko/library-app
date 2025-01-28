import dayjs from "dayjs";
import { EmailTemplate } from "@/constants";
import { db } from "@/db/drizzle";
import { books, borrowRecords, users } from "@/db/schema";
import { sendEmail } from "@/lib/email";
import { serve } from "@upstash/workflow/nextjs";
import { eq } from "drizzle-orm";

type InitialData = {
  bookId: string;
  borrowRecordId: string;
  bookTitle: string;
  bookBorrowDate: string;
  bookDueDate: string;
  studentName: string;
  userEmail: string;
};

export const { POST } = serve<InitialData>(async (context) => {
  const {
    bookId,
    borrowRecordId,
    bookTitle,
    bookBorrowDate,
    bookDueDate,
    studentName,
    userEmail,
  } = context.requestPayload;

  await context.run("new-borrow-record", async () => {
    await sendEmail({
      to: userEmail,
      template: EmailTemplate.BORROW_CONFIRMATION,
      subject: `Thank You for borrowing ${bookTitle}!`,
      data: {
        studentName,
        bookTitle,
        borrowDate: dayjs(bookBorrowDate).format("DD MMMM YYYY"),
        dueDate: dayjs(bookDueDate).format("DD MMMM YYYY"),
        borrowedBookUrl: `https://library-app-rust-five.vercel.app/books/${bookId}`,
      },
    });
  });

  const waitingTime = dayjs(bookDueDate).diff(dayjs(), "day") - 1;

  await context.sleep("wait-for-return-date", 60 * 60 * 24 * waitingTime);

  const status = await context.run("check-record-status", async () => {
    return await db
      .select({ status: borrowRecords.status })
      .from(borrowRecords)
      .where(eq(borrowRecords.id, borrowRecordId))
      .limit(1)
      .then((res) => res[0]?.status);
  });

  if (status !== "RETURNED") {
    await context.run("reminder-borrow-record", async () => {
      await sendEmail({
        to: userEmail,
        template: EmailTemplate.DUE_REMINDER,
        subject: "Welcome to LibraryView!",
        data: {
          studentName: studentName,
          bookTitle: bookTitle,
          borrowDate: dayjs(bookBorrowDate).format("DD MMMM YYYY"),
          dueDate: dayjs(bookDueDate).format("DD MMMM YYYY"),
        },
      });
    });
  }
});
