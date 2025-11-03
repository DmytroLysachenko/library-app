import type { DbMock, MockQueryBuilder } from "../../mocks/db";
import { createQueryBuilder, resetDbMock } from "../../mocks/db";

jest.mock("@/db/drizzle", () => {
  const { createDbMock } = jest.requireActual("../../mocks/db") as typeof import("../../mocks/db");

  return {
    __esModule: true,
    db: createDbMock(),
  };
});

jest.mock("@/lib/config", () => jest.requireActual("../../mocks/config"));

jest.mock("@/lib/workflow", () => ({
  __esModule: true,
  workflowClient: {
    trigger: jest.fn(),
  },
}));

jest.mock("@/lib/ratelimit", () => ({
  __esModule: true,
  statsRecorderRatelimit: {
    limit: jest.fn(),
  },
}));

jest.mock("next/headers", () => ({
  __esModule: true,
  headers: jest.fn(),
}));

import { headers } from "next/headers";
import config from "@/lib/config";
import { workflowClient } from "@/lib/workflow";
import { statsRecorderRatelimit } from "@/lib/ratelimit";
import { db } from "@/db/drizzle";
import { books, borrowRecords, users } from "@/db/schema";
import {
  fetchStatistics,
  setStatsRecorderStatus,
} from "@/lib/admin/actions/statsRecords";

const dbMock = db as unknown as DbMock;

const buildQuery = <T>(result: T, returningResult?: T): MockQueryBuilder<T> =>
  createQueryBuilder<T>({ result, returningResult });

const toMockQuery = <T>(builder: MockQueryBuilder<T>): MockQueryBuilder<unknown> =>
  builder as unknown as MockQueryBuilder<unknown>;

describe("statsRecords actions", () => {
  const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => undefined);
  const headersMock = jest.mocked(headers);
  const limitMock = jest.mocked(statsRecorderRatelimit.limit);
  const triggerMock = jest.mocked(workflowClient.trigger);

  type HeadersReturn = Awaited<ReturnType<typeof headers>>;

  const createHeadersStub = (ip: string): HeadersReturn => {
    const headerInstance = new Headers();
    headerInstance.set("x-forwarded-for", ip);
    return headerInstance as unknown as HeadersReturn;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    resetDbMock(dbMock);
    headersMock.mockResolvedValue(createHeadersStub("203.0.113.10"));
    limitMock.mockResolvedValue({ success: true });
    triggerMock.mockResolvedValue({ workflowRunId: "workflow-1" });
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  describe("setStatsRecorderStatus", () => {
    it("triggers the workflow when the rate limit allows it", async () => {
      const result = await setStatsRecorderStatus(true);

      expect(limitMock).toHaveBeenCalledWith("203.0.113.10");
      expect(triggerMock).toHaveBeenCalledWith({
        url: `${config.env.baseUrl}/api/workflows/app-stats`,
        body: {
          statsRecordingStatus: true,
        },
      });
      expect(result).toEqual({ success: true });
    });

    it("returns an error when the rate limit is exceeded", async () => {
      limitMock.mockResolvedValue({ success: false });

      const result = await setStatsRecorderStatus(false);

      expect(result).toEqual({
        success: false,
        error: "Change recording status error",
      });
      expect(triggerMock).not.toHaveBeenCalled();
    });

    it("returns an error when triggering the workflow fails", async () => {
      triggerMock.mockRejectedValue(new Error("workflow failed"));

      const result = await setStatsRecorderStatus(true);

      expect(result).toEqual({
        success: false,
        error: "Change recording status error",
      });
    });
  });

  describe("fetchStatistics", () => {
    it("aggregates the statistics from the database", async () => {
      const userCountBuilder = buildQuery([{ count: 12 }]);
      const bookCopiesBuilder = buildQuery([
        { totalCopies: 4 },
        { totalCopies: 6 },
      ]);
      const borrowedCountBuilder = buildQuery([{ count: 3 }]);

      dbMock.select
        .mockReturnValueOnce(toMockQuery(userCountBuilder))
        .mockReturnValueOnce(toMockQuery(bookCopiesBuilder))
        .mockReturnValueOnce(toMockQuery(borrowedCountBuilder));

      const result = await fetchStatistics();

      expect(dbMock.select).toHaveBeenCalledTimes(3);
      expect(userCountBuilder.from).toHaveBeenCalledWith(users);
      expect(bookCopiesBuilder.from).toHaveBeenCalledWith(books);
      expect(borrowedCountBuilder.from).toHaveBeenCalledWith(borrowRecords);
      expect(borrowedCountBuilder.where).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        totalUsers: 12,
        totalBooks: 10,
        totalBorrowedBooks: 3,
      });
    });

    it("falls back to zero when no records are returned", async () => {
      const emptyBuilder = buildQuery<unknown[]>([]);

      dbMock.select
        .mockReturnValueOnce(toMockQuery(emptyBuilder))
        .mockReturnValueOnce(toMockQuery(emptyBuilder))
        .mockReturnValueOnce(toMockQuery(emptyBuilder));

      const result = await fetchStatistics();

      expect(result).toEqual({
        totalUsers: 0,
        totalBooks: 0,
        totalBorrowedBooks: 0,
      });
    });
  });
});
