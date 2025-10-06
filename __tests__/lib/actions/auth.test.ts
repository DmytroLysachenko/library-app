import type { DbMock, MockQueryBuilder } from "../../mocks/db";
import { createQueryBuilder, resetDbMock } from "../../mocks/db";

type MockRatelimitResponse = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  pending: Promise<unknown>;
};

jest.mock("@/db/drizzle", () => {
  const { createDbMock } = jest.requireActual("../../mocks/db") as typeof import("../../mocks/db");

  return {
    __esModule: true,
    db: createDbMock(),
  };
});

jest.mock("@/lib/config", () => jest.requireActual("../../mocks/config"));

jest.mock("@/lib/ratelimit", () => ({
  __esModule: true,
  authRatelimit: { limit: jest.fn() },
  statsRecorderRatelimit: { limit: jest.fn() },
}));

jest.mock("@/lib/workflow", () => ({
  __esModule: true,
  workflowClient: { trigger: jest.fn() },
}));

jest.mock("next/headers", () => ({
  __esModule: true,
  headers: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  __esModule: true,
  redirect: jest.fn(),
}));

jest.mock("@/auth", () => ({
  __esModule: true,
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import configMock from "@/lib/config";
import { authRatelimit } from "@/lib/ratelimit";
import { workflowClient } from "@/lib/workflow";
import { signIn, signOut } from "@/auth";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import * as authActions from "@/lib/actions/auth";

type DbUser = {
  id: string;
  email: string;
  fullName: string;
  password: string;
  universityId: number;
  universityCard: string;
};

const dbMock = db as unknown as DbMock;

const buildQuery = <T>(result: T, returningResult?: T): MockQueryBuilder<T> =>
  createQueryBuilder<T>({ result, returningResult });

const toMockQuery = <T>(builder: MockQueryBuilder<T>): MockQueryBuilder<unknown> =>
  builder as unknown as MockQueryBuilder<unknown>;

describe("auth actions", () => {
  const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => undefined);
  const headersMock = jest.mocked(headers);
  const redirectMock = jest.mocked(redirect);
  const limitFn = jest.mocked(authRatelimit.limit);
  const workflowTrigger = jest.mocked(workflowClient.trigger);
  const signInMock = jest.mocked(signIn);
  const signOutMock = jest.mocked(signOut);

  type HeadersReturn = Awaited<ReturnType<typeof headers>>;

  const createHeadersStub = (ip: string): HeadersReturn => {
    const headerInstance = new Headers();
    headerInstance.set("x-forwarded-for", ip);
    return headerInstance as unknown as HeadersReturn;
  };

  const setHeaders = (ip: string) => {
    headersMock.mockResolvedValue(createHeadersStub(ip));
  };

  const setSelectResult = (result: Array<DbUser>) => {
    dbMock.select.mockImplementation(() =>
      toMockQuery(buildQuery<Array<DbUser>>(result))
    );
  };

  const setInsertResult = (returningResult?: Array<DbUser>) => {
    dbMock.insert.mockImplementation(() =>
      toMockQuery(
        buildQuery<Array<DbUser>>(returningResult ?? [], returningResult ?? [])
      )
    );
  };

  const createRatelimitResponse = (success: boolean): MockRatelimitResponse => ({
    success,
    limit: 5,
    remaining: success ? 4 : 0,
    reset: Date.now() + 60_000,
    pending: Promise.resolve(),
  });

  beforeEach(() => {
    jest.clearAllMocks();
    resetDbMock(dbMock);
    setHeaders("203.0.113.10");
    limitFn.mockResolvedValue(createRatelimitResponse(true));
    workflowTrigger.mockResolvedValue({ workflowRunId: "wfr_default" });
    setSelectResult([]);
    setInsertResult();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  describe("signInWithCredentials", () => {
    it("returns success when signIn resolves without error", async () => {
      signInMock.mockResolvedValue(undefined);

      const result = await authActions.signInWithCredentials({
        email: "reader@example.com",
        password: "StrongPass1",
      });

      expect(signInMock).toHaveBeenCalledWith("credentials", {
        email: "reader@example.com",
        password: "StrongPass1",
        redirect: false,
      });
      expect(result).toEqual({ success: true });
    });

    it("returns an error when signIn provides an error message", async () => {
      signInMock.mockResolvedValue({ error: "Invalid credentials" } as never);

      const result = await authActions.signInWithCredentials({
        email: "reader@example.com",
        password: "StrongPass1",
      });

      expect(result).toEqual({ success: false, error: "Invalid credentials" });
    });

    it("returns a generic error when signIn throws", async () => {
      signInMock.mockRejectedValue(new Error("network"));

      const result = await authActions.signInWithCredentials({
        email: "reader@example.com",
        password: "StrongPass1",
      });

      expect(result).toEqual({ success: false, error: "Sign in error" });
    });
  });

  describe("signUp", () => {
    const credentials = {
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      password: "SecurePass123",
      universityId: 42,
      universityCard: "uploads/card.png",
    } as const satisfies AuthCredentials;

    it("inserts a new user, triggers workflows, and signs them in", async () => {
      signInMock.mockResolvedValue(undefined);
      workflowTrigger.mockResolvedValue({ workflowRunId: "wfr_signup" });

      const insertBuilder = buildQuery<Array<DbUser>>([], []);
      dbMock.insert.mockReturnValueOnce(toMockQuery(insertBuilder));

      const result = await authActions.signUp(credentials);

      expect(limitFn).toHaveBeenCalledWith("203.0.113.10");
      expect(dbMock.select).toHaveBeenCalled();
      expect(dbMock.insert).toHaveBeenCalledWith(users);
      expect(insertBuilder.values).toHaveBeenCalledWith({
        fullName: credentials.fullName,
        email: credentials.email,
        universityId: credentials.universityId,
        password: expect.any(String),
        universityCard: credentials.universityCard,
      });
      expect(workflowTrigger).toHaveBeenCalledWith({
        url: `${configMock.env.baseUrl}/api/workflows/onboarding`,
        body: {
          email: credentials.email,
          fullName: credentials.fullName,
        },
        retries: 0,
      });
      expect(signInMock).toHaveBeenCalledWith("credentials", {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      });
      expect(result).toEqual({ success: true });
    });

    it("returns an error when a user already exists", async () => {
      setSelectResult([
        {
          id: "user-1",
          email: credentials.email,
          fullName: credentials.fullName,
          password: "hash",
          universityId: credentials.universityId,
          universityCard: credentials.universityCard,
        },
      ]);

      const result = await authActions.signUp(credentials);

      expect(result).toEqual({ success: false, error: "User already exists" });
      expect(dbMock.insert).not.toHaveBeenCalled();
      expect(workflowTrigger).not.toHaveBeenCalled();
    });

    it("redirects when the auth rate limit is exceeded", async () => {
      limitFn.mockResolvedValue(createRatelimitResponse(false));
      redirectMock.mockImplementation(() => {
        throw new Error("redirect triggered");
      });

      await expect(authActions.signUp(credentials)).rejects.toThrow("redirect triggered");
      expect(redirectMock).toHaveBeenCalledWith("too-fast");
    });

    it("returns an error when inserting a new user fails", async () => {
      const failingBuilder = buildQuery<Array<DbUser>>([]);
      failingBuilder.values = jest.fn(() => {
        throw new Error("insert failure");
      }) as unknown as typeof failingBuilder.values;
      dbMock.insert.mockReturnValueOnce(toMockQuery(failingBuilder));

      const result = await authActions.signUp(credentials);

      expect(result).toEqual({ success: false, error: "Signup error" });
      expect(workflowTrigger).not.toHaveBeenCalled();
    });
  });

  describe("signOutAction", () => {
    it("returns success when signOut resolves", async () => {
      signOutMock.mockResolvedValue(undefined);

      const result = await authActions.signOutAction();

      expect(signOutMock).toHaveBeenCalledWith({ redirect: false });
      expect(result).toEqual({ success: true });
    });

    it("returns an error when signOut throws", async () => {
      signOutMock.mockRejectedValue(new Error("network"));

      const result = await authActions.signOutAction();

      expect(result).toEqual({ success: false, error: "Signout error" });
    });
  });

  describe("uploadAvatar", () => {
    it("updates the user avatar and returns the updated records", async () => {
      const updatedUser = {
        id: "user-1",
        email: "ada@example.com",
        fullName: "Ada Lovelace",
        password: "hash",
        universityId: 42,
        universityCard: "uploads/card.png",
      } satisfies DbUser;

      const updateBuilder = buildQuery<Array<DbUser>>([updatedUser], [updatedUser]);
      dbMock.update.mockReturnValueOnce(toMockQuery(updateBuilder));

      const result = await authActions.uploadAvatar(
        "user-1",
        "https://cdn.example/avatar.png"
      );

      expect(dbMock.update).toHaveBeenCalledWith(users);
      expect(updateBuilder.set).toHaveBeenCalledWith({
        avatar: "https://cdn.example/avatar.png",
      });
      expect(updateBuilder.where).toHaveBeenCalled();
      expect(updateBuilder.returning).toHaveBeenCalled();
      expect(result).toEqual({ success: true, updatedUser: [updatedUser] });
    });

    it("returns an error when the update fails", async () => {
      dbMock.update.mockImplementation(() => {
        throw new Error("update failure");
      });

      const result = await authActions.uploadAvatar(
        "user-1",
        "https://cdn.example/avatar.png"
      );

      expect(result).toEqual({ success: false, error: "Avatar update error" });
    });
  });
});
