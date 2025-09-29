import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("next/navigation", () => {
  const navigationModule = jest.requireActual("../mocks/next-navigation") as typeof import("../mocks/next-navigation");
  return {
    __esModule: true,
    ...navigationModule,
  };
});

jest.mock("@/components/ui/tooltip", () => {
  const React = require("react");
  const passthrough = ({ children }: { children: React.ReactNode }) => <>{children}</>;
  const TooltipContent = ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <div {...props}>{children}</div>
  );
  return {
    __esModule: true,
    TooltipProvider: passthrough,
    Tooltip: passthrough,
    TooltipTrigger: passthrough,
    TooltipContent,
  };
});

jest.mock("@/lib/actions/hooks/use-toast", () => ({
  __esModule: true,
  toast: jest.fn(),
}));

jest.mock("@/lib/actions/book", () => ({
  __esModule: true,
  borrowBook: jest.fn(),
}));

const {
  createRouterMock,
  setRouterMock,
  resetNavigationMocks,
} = jest.requireActual("../mocks/next-navigation") as typeof import("../mocks/next-navigation");

import BorrowBook from "@/components/BorrowBook";
import { toast } from "@/lib/actions/hooks/use-toast";
import { borrowBook } from "@/lib/actions/book";

const toastMock = toast as jest.Mock;
const borrowBookMock = borrowBook as jest.Mock;
let consoleSpy: jest.SpyInstance;

describe("BorrowBook", () => {
  beforeEach(() => {
    resetNavigationMocks();
    toastMock.mockReset();
    borrowBookMock.mockReset();
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it("disables the button and shows the tooltip message when the user is not eligible", () => {
    render(
      <BorrowBook
        bookId="book-1"
        userId="user-1"
        borrowingEligibility={{
          isEligible: false,
          message: "You have already borrowed this title",
        }}
      />
    );

    const button = screen.getByRole("button", { name: /borrow book/i });
    expect(button).toBeDisabled();
    expect(screen.getByText("You have already borrowed this title")).toBeInTheDocument();
  });

  it("borrows the book, shows success feedback, and navigates to the profile", async () => {
    const push = jest.fn();
    setRouterMock(createRouterMock({ push }));
    borrowBookMock.mockResolvedValue({ success: true });

    render(
      <BorrowBook
        bookId="book-1"
        userId="user-1"
        borrowingEligibility={{
          isEligible: true,
          message: "",
        }}
      />
    );

    const button = screen.getByRole("button", { name: /borrow book/i });

    await act(async () => {
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(borrowBookMock).toHaveBeenCalledWith({
        userId: "user-1",
        bookId: "book-1",
      });
    });

    expect(toastMock).toHaveBeenCalledWith({
      title: "Success",
      description:
        "Your borrow request sent successfully, book will appear in your profile soon!",
    });
    expect(push).toHaveBeenCalledWith("/my-profile");
  });

  it("shows an error toast when borrowing fails", async () => {
    setRouterMock(createRouterMock());
    borrowBookMock.mockRejectedValue(new Error("network"));

    render(
      <BorrowBook
        bookId="book-2"
        userId="user-2"
        borrowingEligibility={{
          isEligible: true,
          message: "",
        }}
      />
    );

    const button = screen.getByRole("button", { name: /borrow book/i });

    await act(async () => {
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    });
  });
});
