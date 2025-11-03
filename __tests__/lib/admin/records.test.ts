import dayjs from "dayjs";

import type { DbMock, MockQueryBuilder } from "../../mocks/db";
import { createQueryBuilder, resetDbMock } from "../../mocks/db";

jest.mock("@/db/drizzle", () => {
  const { createDbMock } = jest.requireActual("../../mocks/db") as typeof import("../../mocks/db");

  return {
    __esModule: true,
    db: createDbMock(),
  };
});

jest.mock("@/lib/config", () => ({
  __esModule: true,
  default: {
    env: {
      baseUrl: "https://library.test",
    },
  },
}));

jest.mock("@/lib/workflow", () => ({
  __esModule: true,
  workflowClient: {
    trigger: jest.fn(),
  },
}));

jest.mock("@/lib/utils", () => ({
  __esModule: true,
  generatePdf: jest.fn(),
}));

jest.mock("@/lib/email", () => ({
  __esModule: true,
  sendEmail: jest.fn(),
}));

import { db } from "@/db/drizzle";
import { books, borrowRecords, users } from "@/db/schema";
import {
  confirmBookBorrowStatus,
  confirmBookReturnStatus,
  deleteRecord,
  generateReceipt,
} from "@/lib/admin/actions/records";
import { sendEmail } from "@/lib/email";
import { generatePdf } from "@/lib/utils";
import { workflowClient } from "@/lib/workflow";

const dbMock = db as unknown as DbMock;

const buildQuery = <T>(result: T, returningResult?: T): MockQueryBuilder<T> =>
  createQueryBuilder<T>({ result, returningResult });

const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => undefined);

afterAll(() => {
  consoleLogSpy.mockRestore();
});

describe("confirmBookBorrowStatus", () => {
  const triggerMock = workflowClient.trigger as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy.mockImplementation(() => undefined);
    resetDbMock(dbMock);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("updates the borrow record, associated entities and triggers the workflow", async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-03-05T10:00:00.000Z"));

    const borrowDate = new Date("2024-03-01T00:00:00.000Z");

    const selectBuilder = buildQuery([
      {
        bookId: "book-1",
        userId: "user-1",
        bookTitle: "The Testing Way",
        bookAuthor: "Jon Tester",
        bookGenre: "Education",
        availableCopies: 3,
        email: "user@example.com",
        studentName: "Alex",
        userBorrowedBooks: 2,
        borrowDate,
      },
    ]);
    dbMock.select.mockReturnValue(selectBuilder);

    const updatedRecord = {
      id: "record-1",
      status: "BORROWED",
      dueDate: dayjs().add(7, "day").format("YYYY-MM-DD"),
    };

    const updateRecordBuilder = buildQuery([updatedRecord], [updatedRecord]);
    dbMock.update
      .mockReturnValueOnce(updateRecordBuilder)
      .mockReturnValueOnce(buildQuery([]))
      .mockReturnValueOnce(buildQuery([]));

    const result = await confirmBookBorrowStatus("record-1");

    expect(result).toEqual({ success: true, data: updatedRecord });

    expect(dbMock.select).toHaveBeenCalledTimes(1);
    expect(selectBuilder.leftJoin).toHaveBeenCalledTimes(2);

    expect(dbMock.update).toHaveBeenNthCalledWith(1, borrowRecords);
    expect(updateRecordBuilder.set).toHaveBeenCalledWith({
      status: "BORROWED",
      dueDate: "2024-03-12",
    });
    expect(dbMock.update).toHaveBeenNthCalledWith(2, books);
    expect(dbMock.update).toHaveBeenNthCalledWith(3, users);

    expect(triggerMock).toHaveBeenCalledTimes(1);
    expect(triggerMock).toHaveBeenCalledWith({
      url: "https://library.test/api/workflows/book",
      body: {
        bookId: "book-1",
        borrowRecordId: "record-1",
        bookTitle: "The Testing Way",
        bookBorrowDate: "2024-03-01",
        bookDueDate: "2024-03-12",
        studentName: "Alex",
        userEmail: "user@example.com",
      },
    });
  });

  it("returns an error when the borrow record update fails", async () => {
    const selectBuilder = buildQuery([
      {
        bookId: "book-1",
        userId: "user-1",
        bookTitle: "The Testing Way",
        bookAuthor: "Jon Tester",
        bookGenre: "Education",
        availableCopies: 3,
        email: "user@example.com",
        studentName: "Alex",
        userBorrowedBooks: 2,
        borrowDate: new Date("2024-03-01T00:00:00.000Z"),
      },
    ]);
    dbMock.select.mockReturnValue(selectBuilder);

    dbMock.update.mockImplementationOnce(() => {
      throw new Error("update failed");
    });

    const result = await confirmBookBorrowStatus("record-1");

    expect(result).toEqual({
      success: false,
      message: "An error occurred while updating record status",
    });
    expect(workflowClient.trigger).not.toHaveBeenCalled();
  });
});

describe("confirmBookReturnStatus", () => {
  const sendEmailMock = sendEmail as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy.mockImplementation(() => undefined);
    resetDbMock(dbMock);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("marks the record as returned and notifies the student", async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-03-05T10:00:00.000Z"));

    const selectBuilder = buildQuery([
      {
        bookId: "book-1",
        bookTitle: "The Testing Way",
        availableCopies: 2,
        email: "reader@example.com",
        studentName: "Alex",
      },
    ]);
    dbMock.select.mockReturnValue(selectBuilder);

    const updatedRecord = {
      id: "record-1",
      status: "RETURNED",
      returnDate: "2024-03-05",
    };
    const updateRecordBuilder = buildQuery([updatedRecord], [updatedRecord]);
    const updateBooksBuilder = buildQuery([]);

    dbMock.update.mockReturnValueOnce(updateRecordBuilder).mockReturnValueOnce(updateBooksBuilder);

    const result = await confirmBookReturnStatus("record-1");

    expect(result).toEqual({ success: true, data: updatedRecord });

    expect(dbMock.select).toHaveBeenCalledWith({
      bookId: borrowRecords.bookId,
      bookTitle: books.title,
      availableCopies: books.availableCopies,
      email: users.email,
      studentName: users.fullName,
    });
    expect(selectBuilder.leftJoin).toHaveBeenCalledTimes(2);

    expect(dbMock.update).toHaveBeenNthCalledWith(1, borrowRecords);
    expect(updateRecordBuilder.set).toHaveBeenCalledWith({
      status: "RETURNED",
      returnDate: "2024-03-05",
    });

    expect(dbMock.update).toHaveBeenNthCalledWith(2, books);
    expect(updateBooksBuilder.set).toHaveBeenCalledWith({
      availableCopies: 3,
    });

    expect(sendEmailMock).toHaveBeenCalledWith({
      to: "reader@example.com",
      subject: "Thank You for Returning the Book!",
      template: expect.any(String),
      data: {
        studentName: "Alex",
        bookTitle: "The Testing Way",
        exploreUrl: "https://library.test",
      },
    });
  });

  it("returns an error when the record update fails", async () => {
    const selectBuilder = buildQuery([
      {
        bookId: "book-1",
        bookTitle: "The Testing Way",
        availableCopies: 2,
        email: "reader@example.com",
        studentName: "Alex",
      },
    ]);
    dbMock.select.mockReturnValue(selectBuilder);

    dbMock.update.mockImplementationOnce(() => {
      throw new Error("update failed");
    });

    const result = await confirmBookReturnStatus("record-1");

    expect(result).toEqual({
      success: false,
      message: "An error occurred while updating record status",
    });
    expect(sendEmailMock).not.toHaveBeenCalled();
  });
});

describe("generateReceipt", () => {
  const sendEmailMock = sendEmail as jest.Mock;
  const generatePdfMock = generatePdf as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy.mockImplementation(() => undefined);
    resetDbMock(dbMock);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("creates the receipt, updates the record, and emails the user", async () => {
    jest.useFakeTimers();
    const now = new Date("2024-03-05T10:00:00.000Z");
    jest.setSystemTime(now);

    const selectBuilder = buildQuery([
      {
        bookId: "book-1",
        userId: "user-1",
        bookTitle: "The Testing Way",
        bookAuthor: "Jon Tester",
        bookGenre: "Education",
        availableCopies: 3,
        email: "user@example.com",
        studentName: "Alex",
        userBorrowedBooks: 2,
        borrowDate: new Date("2024-03-01T00:00:00.000Z"),
        dueDate: new Date("2024-03-15T00:00:00.000Z"),
      },
    ]);
    dbMock.select.mockReturnValue(selectBuilder);

    const pdfUrl = "https://library.test/receipts/receipt.pdf";
    generatePdfMock.mockResolvedValue(pdfUrl);

    const newRecord = {
      id: "record-1",
      receiptUrl: pdfUrl,
      receiptCreatedAt: now,
    };
    const updateRecordBuilder = buildQuery([newRecord], [newRecord]);
    dbMock.update.mockReturnValue(updateRecordBuilder);

    const result = await generateReceipt("record-1");

    expect(generatePdfMock).toHaveBeenCalledWith({
      receiptId: "record-1",
      studentName: "Alex",
      bookTitle: "The Testing Way",
      bookAuthor: "Jon Tester",
      bookGenre: "Education",
      borrowDate: "2024-03-01",
      dueDate: "2024-03-15",
      duration: 7,
      issueDate: "2024-03-05",
      websiteUrl: "https://library.test",
      supportEmail: "libraryview-support@mail.com",
    });

    expect(dbMock.update).toHaveBeenCalledWith(borrowRecords);
    expect(updateRecordBuilder.set).toHaveBeenCalledWith(
      expect.objectContaining({
        receiptUrl: pdfUrl,
        receiptCreatedAt: expect.any(Date),
      })
    );

    expect(sendEmailMock).toHaveBeenCalledWith({
      to: "user@example.com",
      subject: "Book receipt",
      template: expect.any(String),
      data: {
        studentName: "Alex",
        bookTitle: "The Testing Way",
        borrowDate: "2024-03-01",
        dueDate: "2024-03-15",
        downloadUrl: pdfUrl,
      },
    });

    expect(result).toEqual({
      success: true,
      data: {
        id: "record-1",
        receiptUrl: pdfUrl,
        receiptCreatedAt: now.toISOString(),
      },
  });
});

describe("deleteRecord", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy.mockImplementation(() => undefined);
    resetDbMock(dbMock);
  });

  it("deletes the borrow record", async () => {
    const deleteBuilder = buildQuery([]);
    dbMock.delete.mockReturnValue(deleteBuilder);

    const result = await deleteRecord("record-1");

    expect(dbMock.delete).toHaveBeenCalledWith(borrowRecords);
    expect(deleteBuilder.where).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ success: true });
  });

  it("returns an error when deletion fails", async () => {
    dbMock.delete.mockImplementation(() => {
      throw new Error("delete failed");
    });

    const result = await deleteRecord("record-1");

    expect(result).toEqual({
      success: false,
      message: "An error occurred while deleting the record",
    });
  });
});

  it("returns an error when the receipt generation fails", async () => {
    const selectBuilder = buildQuery([
      {
        bookId: "book-1",
        userId: "user-1",
        bookTitle: "The Testing Way",
        bookAuthor: "Jon Tester",
        bookGenre: "Education",
        availableCopies: 3,
        email: "user@example.com",
        studentName: "Alex",
        userBorrowedBooks: 2,
        borrowDate: new Date("2024-03-01T00:00:00.000Z"),
        dueDate: new Date("2024-03-15T00:00:00.000Z"),
      },
    ]);
    dbMock.select.mockReturnValue(selectBuilder);

    generatePdfMock.mockRejectedValue(new Error("render failed"));

    const result = await generateReceipt("record-1");

    expect(result).toEqual({
      success: false,
      message: "An error occurred while updating record status",
    });
    expect(dbMock.update).not.toHaveBeenCalled();
    expect(sendEmailMock).not.toHaveBeenCalled();
  });
});
