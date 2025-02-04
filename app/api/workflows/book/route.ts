import dayjs from "dayjs";
import { serve } from "@upstash/workflow/nextjs";
import { eq } from "drizzle-orm";

import { EmailTemplate } from "@/constants";
import { db } from "@/db/drizzle";
import { borrowRecords } from "@/db/schema";
import { sendEmail } from "@/lib/email";
import config from "@/lib/config";

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
        borrowedBooksUrl: `${config.env.prodApiEndpoint}/my-profile`,
      },
    });
  });

  const waitingDays = dayjs(bookDueDate).diff(dayjs(), "day") - 1;

  await context.sleep("wait-for-return-date", 60 * 60 * 24 * waitingDays);

  const status = await context.run("check-record-status", async () => {
    return await db
      .select({ status: borrowRecords.status })
      .from(borrowRecords)
      .where(eq(borrowRecords.id, borrowRecordId))
      .limit(1)
      .then((res) => res.length && res[0]?.status);
  });

  if (status !== "RETURNED") {
    await context.run("reminder-borrow-record", async () => {
      await sendEmail({
        to: userEmail,
        template: EmailTemplate.DUE_REMINDER,
        subject: `Remember borrowing ${bookTitle} on LibraryView?`,
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
