import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import dayjs from "dayjs";

import type ReceiptLinkComponent from "@/components/admin/ReceiptLink";
type ReceiptLinkProps = React.ComponentProps<typeof ReceiptLinkComponent>;

import * as navigationMocks from "../../mocks/next-navigation";
import * as selectMocks from "../../mocks/components/ui/select";

type ComponentRecord = Omit<BorrowRecord, "book" | "user">;

const { createRouterMock, setRouterMock, resetNavigationMocks } = navigationMocks;
const receiptLinkRenderMock = jest.fn<void, [ReceiptLinkProps]>();

jest.mock("next/navigation", () => ({
  __esModule: true,
  ...navigationMocks,
}));

jest.mock("@/components/ui/select", () => ({
  __esModule: true,
  ...selectMocks,
}));

jest.mock("@/components/BookCover", () => ({
  __esModule: true,
  default: ({ coverUrl }: { coverUrl: string }) => (
    <div data-testid="book-cover" data-cover-url={coverUrl} />
  ),
}));

jest.mock("@/components/UserAvatar", () => ({
  __esModule: true,
  default: ({ fullName }: { fullName: string }) => (
    <div data-testid="user-avatar">{fullName}</div>
  ),
}));

jest.mock("@/components/admin/ReceiptLink", () => ({
  __esModule: true,
  default: (props: ReceiptLinkProps) => {
    receiptLinkRenderMock(props);
    return (
      <div data-testid="receipt-link">
        {props.canGenerateReceipt ? "can-generate" : props.receiptUrl ?? "none"}
      </div>
    );
  },
}));

jest.mock("@/lib/actions/hooks/use-toast", () => ({
  __esModule: true,
  toast: jest.fn(),
}));

jest.mock("@/lib/admin/actions/records", () => ({
  __esModule: true,
  confirmBookBorrowStatus: jest.fn(),
  generateReceipt: jest.fn(),
}));

import BorrowRecordRow from "@/components/admin/BorrowRecord";
import { toast } from "@/lib/actions/hooks/use-toast";
import {
  confirmBookBorrowStatus,
  generateReceipt,
} from "@/lib/admin/actions/records";

type RenderBorrowRecordProps = React.ComponentProps<typeof BorrowRecordRow>;

const toastMock = toast as jest.Mock;
const confirmBookBorrowStatusMock = confirmBookBorrowStatus as jest.Mock;
const generateReceiptMock = generateReceipt as jest.Mock;

const baseBook: Book = {
  id: "book-1",
  title: "Library 101",
  author: "Ann Author",
  genre: "Education",
  rating: 4.2,
  totalCopies: 5,
  availableCopies: 3,
  description: "An introduction to the library system.",
  coverColor: "#FFFFFF",
  coverUrl: "/covers/library.png",
  videoUrl: "https://cdn.example/video.mp4",
  summary: "Summary",
  createdAt: new Date("2024-01-01T00:00:00Z"),
};

const baseUser: User = {
  status: "APPROVED",
  role: "ADMIN",
  id: "user-1",
  fullName: "Casey Admin",
  email: "casey@example.com",
  universityId: 123456,
  password: "hashed",
  universityCard: "/cards/card.png",
  lastActivityDate: null,
  createdAt: new Date("2024-01-10T00:00:00Z"),
  avatar: "/avatars/casey.png",
  borrowedBooks: 1,
};

const baseRecord: ComponentRecord = {
  id: "record-1",
  bookId: "book-1",
  userId: "user-1",
  createdAt: new Date("2024-03-01T00:00:00Z"),
  dueDate: null,
  returnDate: null,
  status: "PENDING",
  receiptUrl: null,
  receiptCreatedAt: null,
};

const renderBorrowRecord = (props: RenderBorrowRecordProps) =>
  render(
    <table>
      <tbody>
        <BorrowRecordRow {...props} />
      </tbody>
    </table>
  );

const getLastReceiptProps = (): ReceiptLinkProps => {
  const lastCall = receiptLinkRenderMock.mock.calls.at(-1);

  if (!lastCall) {
    throw new Error("ReceiptLink mock was not called");
  }

  return lastCall[0];
};

describe("BorrowRecord", () => {
  beforeEach(() => {
    resetNavigationMocks();
    toastMock.mockReset();
    confirmBookBorrowStatusMock.mockReset();
    generateReceiptMock.mockReset();
    receiptLinkRenderMock.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("promotes a pending request to borrowed and enables receipt generation", async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-03-10T00:00:00Z"));

    setRouterMock(createRouterMock());
    confirmBookBorrowStatusMock.mockResolvedValue({ success: true });

    renderBorrowRecord({
      record: { ...baseRecord },
      book: { ...baseBook },
      user: { ...baseUser },
      isRequest: true,
    });

    expect(screen.getByTestId("select-value")).toHaveTextContent("PENDING");

    fireEvent.click(screen.getByTestId("select-item-BORROWED"));

    await waitFor(() =>
      expect(confirmBookBorrowStatusMock).toHaveBeenCalledWith("record-1")
    );

    expect(toastMock).toHaveBeenCalledWith({
      title: "Success",
      description: "Record status changed successfully",
    });

    await waitFor(() =>
      expect(screen.getByTestId("select-value")).toHaveTextContent("BORROWED")
    );

    const expectedDueDate = dayjs("2024-03-10").add(7, "day").format("YYYY-MM-DD");
    await waitFor(() => expect(screen.getByText(expectedDueDate)).toBeInTheDocument());

    const latestReceiptProps = getLastReceiptProps();
    expect(latestReceiptProps.canGenerateReceipt).toBe(true);
    expect(latestReceiptProps.isChangingStatus).toBe(false);
  });

  it("restores the original status and shows an error when the update fails", async () => {
    setRouterMock(createRouterMock());
    confirmBookBorrowStatusMock.mockResolvedValue({ success: false });

    renderBorrowRecord({
      record: { ...baseRecord },
      book: { ...baseBook },
      user: { ...baseUser },
      isRequest: true,
    });

    fireEvent.click(screen.getByTestId("select-item-BORROWED"));

    await waitFor(() =>
      expect(confirmBookBorrowStatusMock).toHaveBeenCalledWith("record-1")
    );

    expect(toastMock).toHaveBeenCalledWith({
      title: "Error",
      description: "An error occurred during status change",
      variant: "destructive",
    });

    await waitFor(() =>
      expect(screen.getByTestId("select-value")).toHaveTextContent("PENDING")
    );

    const latestReceiptProps = getLastReceiptProps();
    expect(latestReceiptProps.canGenerateReceipt).toBe(false);
  });

  it("triggers receipt generation and refreshes the table on success", async () => {
    const refresh = jest.fn();
    setRouterMock(createRouterMock({ refresh }));
    generateReceiptMock.mockResolvedValue({ success: true });

    renderBorrowRecord({
      record: {
        ...baseRecord,
        status: "BORROWED",
        dueDate: new Date("2024-03-18T00:00:00Z"),
        receiptUrl: null,
        receiptCreatedAt: null,
      },
      book: { ...baseBook },
      user: { ...baseUser },
      isRequest: false,
    });

    const receiptProps = getLastReceiptProps();
    expect(receiptProps.canGenerateReceipt).toBe(true);

    await act(async () => {
      await receiptProps.onGenerateReceipt();
    });

    await waitFor(() =>
      expect(generateReceiptMock).toHaveBeenCalledWith("record-1")
    );

    expect(toastMock).toHaveBeenCalledWith({
      title: "Success",
      description: "Receipt generated successfully",
    });
    await waitFor(() => expect(refresh).toHaveBeenCalled());

    const latestReceiptProps = getLastReceiptProps();
    expect(latestReceiptProps.canGenerateReceipt).toBe(false);
  });
});
