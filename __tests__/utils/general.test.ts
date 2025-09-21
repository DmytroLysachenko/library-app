jest.mock("drizzle-orm", () => ({
  asc: jest.fn((column) => ({ direction: "asc", column })),
  desc: jest.fn((column) => ({ direction: "desc", column })),
}));

jest.mock("@/db/schema", () => ({
  books: {
    createdAt: { name: "createdAt" },
    availableCopies: { name: "availableCopies" },
    rating: { name: "rating" },
  },
}));

import { asc, desc } from "drizzle-orm";
import { books } from "@/db/schema";
import {
  cn,
  getInitials,
  getBooksSortingOrder,
  getBorrowRequestsFilterValue,
  getUsersFilterValue,
  getUserStatusIcon,
  getUserStatusLabel,
  getNextStatus,
} from "@/lib/utils/general";

type UserStatus = Parameters<typeof getUserStatusIcon>[0];

describe("cn", () => {
  it("merges class names using tailwind-merge", () => {
    expect(cn("px-2", "px-4", { hidden: false, block: true })).toBe(
      "px-4 block"
    );
  });

  it("filters out falsy values", () => {
    expect(cn("text-sm", null, undefined, "font-medium")).toBe(
      "text-sm font-medium"
    );
  });
});

describe("getInitials", () => {
  it.each([
    ["Ada Lovelace", "AL"],
    ["grace hopper", "GH"],
    ["Single", "S"],
    ["alan mathison turing", "AM"],
    ["", ""],
  ])("%s => %s", (input, expected) => {
    expect(getInitials(input)).toBe(expected);
  });
});

describe("getBooksSortingOrder", () => {
  const ascMock = jest.mocked(asc);
  const descMock = jest.mocked(desc);

  beforeEach(() => {
    ascMock.mockClear();
    descMock.mockClear();
  });

  it("uses ascending order for the oldest sort", () => {
    const result = getBooksSortingOrder("oldest");

    expect(ascMock).toHaveBeenCalledWith(books.createdAt);
    expect(result).toEqual({ direction: "asc", column: books.createdAt });
  });

  it("uses createdAt descending for newest and default", () => {
    const newestResult = getBooksSortingOrder("newest");
    const defaultResult = getBooksSortingOrder(undefined);

    expect(descMock).toHaveBeenCalledWith(books.createdAt);
    expect(newestResult).toEqual({
      direction: "desc",
      column: books.createdAt,
    });
    expect(defaultResult).toEqual({
      direction: "desc",
      column: books.createdAt,
    });
  });

  it("uses availableCopies when filtering by availability", () => {
    const result = getBooksSortingOrder("available");

    expect(descMock).toHaveBeenCalledWith(books.availableCopies);
    expect(result).toEqual({
      direction: "desc",
      column: books.availableCopies,
    });
  });

  it("uses rating when sorting by highest rating", () => {
    const result = getBooksSortingOrder("highestRated");

    expect(descMock).toHaveBeenCalledWith(books.rating);
    expect(result).toEqual({ direction: "desc", column: books.rating });
  });
});

describe("getBorrowRequestsFilterValue", () => {
  it.each([
    ["pending", "PENDING"],
    ["borrowed", "BORROWED"],
    ["unknown", "PENDING"],
    [undefined, "PENDING"],
  ])("%s => %s", (input, expected) => {
    expect(getBorrowRequestsFilterValue(input as string | undefined)).toBe(
      expected
    );
  });
});

describe("getUsersFilterValue", () => {
  it.each([
    ["pending", "PENDING"],
    ["approved", "APPROVED"],
    ["rejected", "REJECTED"],
    ["unknown", "APPROVED"],
    [undefined, "APPROVED"],
  ])("%s => %s", (input, expected) => {
    expect(getUsersFilterValue(input as string | undefined)).toBe(expected);
  });
});

describe("getUserStatusIcon", () => {
  const iconCases = [
    ["APPROVED", "/icons/verified.svg"],
    ["REJECTED", "/icons/warning.svg"],
    ["PENDING", "/icons/clock.svg"],
    [null, "/icons/clock.svg"],
  ] as const satisfies ReadonlyArray<[UserStatus, string]>;

  it.each(iconCases)("%s => %s", (status, expected) => {
    expect(getUserStatusIcon(status)).toBe(expected);
  });
});

describe("getUserStatusLabel", () => {
  const labelCases = [
    ["APPROVED", "Verified Student"],
    ["REJECTED", "Account rejected, contact admin"],
    ["PENDING", "Status Pending"],
    [null, "Status Pending"],
  ] as const satisfies ReadonlyArray<[UserStatus, string]>;

  it.each(labelCases)("%s => %s", (status, expected) => {
    expect(getUserStatusLabel(status)).toBe(expected);
  });
});

describe("getNextStatus", () => {
  it.each([
    ["PENDING", "BORROWED"],
    ["BORROWED", "RETURNED"],
    ["RETURNED", null],
    ["UNKNOWN", null],
  ])("%s => %s", (status, expected) => {
    expect(getNextStatus(status)).toBe(expected);
  });
});
