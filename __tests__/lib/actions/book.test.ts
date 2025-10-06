import type { DbMock, MockQueryBuilder } from "../../mocks/db";
import { createQueryBuilder, resetDbMock } from "../../mocks/db";

jest.mock("@/db/drizzle", () => {
  const { createDbMock } = jest.requireActual("../../mocks/db") as typeof import("../../mocks/db");

  return {
    __esModule: true,
    db: createDbMock(),
  };
});

import { db } from "@/db/drizzle";
import { borrowRecords } from "@/db/schema";
import { borrowBook } from "@/lib/actions/book";

const dbMock = db as unknown as DbMock;

type AvailabilityRow = {
  availableCopies: number;
  bookTitle: string;
};

type BorrowRecordRow = {
  id: string;
  userId: string;
  bookId: string;
  status: "PENDING" | "BORROWED" | "RETURNED";
  receiptUrl: string | null;
};

const buildQuery = <T>(result: T, returningResult?: T): MockQueryBuilder<T> =>
  createQueryBuilder<T>({ result, returningResult });

describe("borrowBook", () => {
  const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => undefined);

  const setSelectResult = (result: Array<AvailabilityRow>) => {
    dbMock.select.mockImplementation(() => buildQuery<Array<AvailabilityRow>>(result));
  };

  beforeEach(() => {
    jest.clearAllMocks();
    resetDbMock(dbMock);
    setSelectResult([]);
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  it("returns an error when the book does not exist", async () => {
    setSelectResult([]);

    const result = await borrowBook({ userId: "user-1", bookId: "book-1" });

    expect(result).toEqual({ success: false, error: "Book is not available" });
    expect(dbMock.insert).not.toHaveBeenCalled();
  });

  it("returns an error when the book has no available copies", async () => {
    setSelectResult([{ availableCopies: 0, bookTitle: "The Art of Testing" }]);

    const result = await borrowBook({ userId: "user-1", bookId: "book-1" });

    expect(result).toEqual({ success: false, error: "Book is not available" });
    expect(dbMock.insert).not.toHaveBeenCalled();
  });

  it("creates a borrow record when copies are available", async () => {
    setSelectResult([{ availableCopies: 3, bookTitle: "The Art of Testing" }]);

    const borrowRecord: BorrowRecordRow = {
      id: "record-1",
      userId: "user-1",
      bookId: "book-1",
      status: "PENDING",
      receiptUrl: null,
    };

    const insertBuilder = buildQuery<Array<BorrowRecordRow>>([borrowRecord], [borrowRecord]);
    dbMock.insert.mockReturnValue(insertBuilder);

    const result = await borrowBook({ userId: "user-1", bookId: "book-1" });

    expect(dbMock.insert).toHaveBeenCalledWith(borrowRecords);
    expect(insertBuilder.values).toHaveBeenCalledWith({
      userId: "user-1",
      bookId: "book-1",
      status: "PENDING",
    });
    expect(insertBuilder.returning).toHaveBeenCalled();
    expect(result).toEqual({ success: true, data: borrowRecord });
  });

  it("returns an error when creating the borrow record fails", async () => {
    setSelectResult([{ availableCopies: 1, bookTitle: "The Art of Testing" }]);
    dbMock.insert.mockImplementation(() => {
      throw new Error("insert failure");
    });

    const result = await borrowBook({ userId: "user-2", bookId: "book-9" });

    expect(result).toEqual({
      success: false,
      error: "An error occured while borrowing the book",
    });
  });
});
