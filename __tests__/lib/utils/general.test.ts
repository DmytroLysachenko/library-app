import * as drizzle from "drizzle-orm";

import {
  cn,
  getBooksSortingOrder,
  getBorrowRequestsFilterValue,
  getInitials,
  getNextStatus,
  getUserStatusIcon,
  getUserStatusLabel,
  getUsersFilterValue,
} from "@/lib/utils";
import { books } from "@/db/schema";

jest.mock("drizzle-orm", () => {
  const actual = jest.requireActual("drizzle-orm") as typeof import("drizzle-orm");

  return {
    __esModule: true,
    ...actual,
    asc: jest.fn(actual.asc),
    desc: jest.fn(actual.desc),
  };
});

describe("lib/utils/general", () => {
  describe("cn", () => {
    it("merges class names and resolves Tailwind conflicts", () => {
      const result = cn(
        "px-4",
        "text-sm",
        null,
        undefined,
        ["font-bold", { block: true, hidden: false }],
        "text-lg"
      );

      const classes = result.split(" ");

      expect(classes).toHaveLength(4);
      expect(classes).toEqual(
        expect.arrayContaining(["px-4", "text-lg", "font-bold", "block"])
      );
    });
  });

  describe("getInitials", () => {
    it("builds uppercase initials and limits to two characters", () => {
      expect(getInitials("Ada Lovelace")).toBe("AL");
      expect(getInitials("grace brewster murray hopper")).toBe("GB");
    });
  });

  describe("getBooksSortingOrder", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("uses ascending order by creation date for oldest", () => {
      const ascMock = jest.mocked(drizzle.asc);

      const sort = getBooksSortingOrder("oldest");

      expect(ascMock).toHaveBeenCalledWith(books.createdAt);
      expect(sort).toBe(ascMock.mock.results[0]?.value);
    });

    it("returns descending order by creation date by default", () => {
      const descMock = jest.mocked(drizzle.desc);

      const sort = getBooksSortingOrder();

      expect(descMock).toHaveBeenCalledWith(books.createdAt);
      expect(sort).toBe(descMock.mock.results[0]?.value);
    });

    it("supports available copies and rating sorting options", () => {
      const descMock = jest.mocked(drizzle.desc);

      const availableSort = getBooksSortingOrder("available");
      const ratingSort = getBooksSortingOrder("highestRated");

      expect(descMock).toHaveBeenNthCalledWith(1, books.availableCopies);
      expect(descMock).toHaveBeenNthCalledWith(2, books.rating);

      expect(availableSort).toBe(descMock.mock.results[0]?.value);
      expect(ratingSort).toBe(descMock.mock.results[1]?.value);
    });
  });

  describe("getBorrowRequestsFilterValue", () => {
    it("returns status tokens for known values and defaults to pending", () => {
      expect(getBorrowRequestsFilterValue("borrowed")).toBe("BORROWED");
      expect(getBorrowRequestsFilterValue("pending")).toBe("PENDING");
      expect(getBorrowRequestsFilterValue()).toBe("PENDING");
    });
  });

  describe("getUsersFilterValue", () => {
    it("returns correct filter token for all statuses", () => {
      expect(getUsersFilterValue("pending")).toBe("PENDING");
      expect(getUsersFilterValue("approved")).toBe("APPROVED");
      expect(getUsersFilterValue("rejected")).toBe("REJECTED");
      expect(getUsersFilterValue()).toBe("APPROVED");
    });
  });

  describe("status helpers", () => {
    it("maps status icons correctly", () => {
      expect(getUserStatusIcon("APPROVED")).toBe("/icons/verified.svg");
      expect(getUserStatusIcon("REJECTED")).toBe("/icons/warning.svg");
      expect(getUserStatusIcon(null)).toBe("/icons/clock.svg");
    });

    it("maps status labels correctly", () => {
      expect(getUserStatusLabel("APPROVED")).toBe("Verified Student");
      expect(getUserStatusLabel("REJECTED")).toBe("Account rejected, contact admin");
      expect(getUserStatusLabel(null)).toBe("Status Pending");
    });
  });

  describe("getNextStatus", () => {
    it("returns the following borrow status or null", () => {
      expect(getNextStatus("PENDING")).toBe("BORROWED");
      expect(getNextStatus("BORROWED")).toBe("RETURNED");
      expect(getNextStatus("RETURNED")).toBeNull();
      expect(getNextStatus("UNKNOWN")).toBeNull();
    });
  });
});
