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

jest.mock("@/lib/email", () => ({
  __esModule: true,
  sendEmail: jest.fn(),
}));

import { sendEmail } from "@/lib/email";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { EmailTemplate } from "@/constants";
import {
  approveUser,
  changeUserRole,
  deleteUser,
  rejectUser,
} from "@/lib/admin/actions/users";

const dbMock = db as unknown as DbMock;
const sendEmailMock = jest.mocked(sendEmail);

const buildQuery = <T>(result: T, returningResult?: T): MockQueryBuilder<T> =>
  createQueryBuilder<T>({ result, returningResult });

const toMockQuery = <T>(builder: MockQueryBuilder<T>): MockQueryBuilder<unknown> =>
  builder as unknown as MockQueryBuilder<unknown>;

describe("admin user actions", () => {
  const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    resetDbMock(dbMock);
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  describe("changeUserRole", () => {
    it("updates the user role and returns the updated user", async () => {
      const updatedUser = {
        id: "user-1",
        email: "ada@example.com",
        role: "ADMIN",
      };

      const updateBuilder = buildQuery([updatedUser], [updatedUser]);
      dbMock.update.mockReturnValueOnce(toMockQuery(updateBuilder));

      const result = await changeUserRole("user-1", "ADMIN");

      expect(dbMock.update).toHaveBeenCalledWith(users);
      expect(updateBuilder.set).toHaveBeenCalledWith({ role: "ADMIN" });
      expect(updateBuilder.where).toHaveBeenCalledTimes(1);
      expect(updateBuilder.returning).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        data: updatedUser,
      });
    });

    it("returns an error when the update fails", async () => {
      dbMock.update.mockImplementation(() => {
        throw new Error("update failed");
      });

      const result = await changeUserRole("user-1", "USER");

      expect(result).toEqual({
        success: false,
        message: "An error occurred while changing the user role",
      });
    });
  });

  describe("deleteUser", () => {
    it("deletes the user and returns success", async () => {
      const deleteBuilder = buildQuery([]);
      dbMock.delete.mockReturnValueOnce(toMockQuery(deleteBuilder));

      const result = await deleteUser("user-1");

      expect(dbMock.delete).toHaveBeenCalledWith(users);
      expect(deleteBuilder.where).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ success: true });
    });

    it("returns an error when deletion fails", async () => {
      dbMock.delete.mockImplementation(() => {
        throw new Error("delete failed");
      });

      const result = await deleteUser("user-1");

      expect(result).toEqual({
        success: false,
        message: "An error occurred while deleting the user",
      });
    });
  });

  describe("approveUser", () => {
    it("approves the user and sends an approval email", async () => {
      const userInfo = {
        id: "user-1",
        email: "ada@example.com",
        fullName: "Ada Lovelace",
      };
      const approvedUser = {
        ...userInfo,
        status: "APPROVED",
      };

      const selectBuilder = buildQuery([userInfo]);
      const updateBuilder = buildQuery([approvedUser], [approvedUser]);

      dbMock.select.mockReturnValueOnce(toMockQuery(selectBuilder));
      dbMock.update.mockReturnValueOnce(toMockQuery(updateBuilder));

      const result = await approveUser("user-1");

      expect(dbMock.select).toHaveBeenCalledWith();
      expect(selectBuilder.from).toHaveBeenCalledWith(users);
      expect(selectBuilder.where).toHaveBeenCalledTimes(1);
      expect(selectBuilder.limit).toHaveBeenCalledWith(1);

      expect(dbMock.update).toHaveBeenCalledWith(users);
      expect(updateBuilder.set).toHaveBeenCalledWith({ status: "APPROVED" });
      expect(updateBuilder.where).toHaveBeenCalledTimes(1);
      expect(updateBuilder.returning).toHaveBeenCalledTimes(1);

      expect(sendEmailMock).toHaveBeenCalledWith({
        to: userInfo.email,
        subject: "Your account has been approved!",
        template: EmailTemplate.APPROVAL,
        data: {
          studentName: userInfo.fullName,
          loginUrl: expect.stringContaining("/sign-in"),
        },
      });

      expect(result).toEqual({
        success: true,
        data: approvedUser,
      });
    });

    it("returns an error when approving the user fails", async () => {
      dbMock.select.mockImplementation(() => {
        throw new Error("select failed");
      });

      const result = await approveUser("user-1");

      expect(result).toEqual({
        success: false,
        message: "An error occurred while approving the user",
      });
      expect(sendEmailMock).not.toHaveBeenCalled();
    });
  });

  describe("rejectUser", () => {
    it("rejects the user and sends a rejection email", async () => {
      const userInfo = {
        id: "user-1",
        email: "ada@example.com",
        fullName: "Ada Lovelace",
      };
      const rejectedUser = {
        ...userInfo,
        status: "REJECTED",
      };

      const selectBuilder = buildQuery([userInfo]);
      const updateBuilder = buildQuery([rejectedUser], [rejectedUser]);

      dbMock.select.mockReturnValueOnce(toMockQuery(selectBuilder));
      dbMock.update.mockReturnValueOnce(toMockQuery(updateBuilder));

      const result = await rejectUser("user-1");

      expect(selectBuilder.from).toHaveBeenCalledWith(users);
      expect(selectBuilder.where).toHaveBeenCalledTimes(1);
      expect(selectBuilder.limit).toHaveBeenCalledWith(1);

      expect(updateBuilder.set).toHaveBeenCalledWith({ status: "REJECTED" });
      expect(updateBuilder.where).toHaveBeenCalledTimes(1);
      expect(updateBuilder.returning).toHaveBeenCalledTimes(1);

      expect(sendEmailMock).toHaveBeenCalledWith({
        to: userInfo.email,
        subject: "Your account has been Rejected!",
        template: EmailTemplate.REJECTION,
        data: {
          studentName: userInfo.fullName,
        },
      });

      expect(result).toEqual({
        success: true,
        data: rejectedUser,
      });
    });
  });
});
