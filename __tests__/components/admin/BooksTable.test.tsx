import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("next/navigation", () => {
  const navigationModule = jest.requireActual("../../mocks/next-navigation") as typeof import("../../mocks/next-navigation");
  return {
    __esModule: true,
    ...navigationModule,
  };
});

jest.mock("next/link", () => {
  const LinkMock = React.forwardRef<
    HTMLAnchorElement,
    React.PropsWithChildren<React.AnchorHTMLAttributes<HTMLAnchorElement>>
  >(({ children, ...rest }, ref) => (
    <a ref={ref} {...rest}>
      {children}
    </a>
  ));

  LinkMock.displayName = "NextLinkMock";

  return LinkMock;
});

jest.mock("@/components/BookCover", () => ({
  __esModule: true,
  default: ({ coverUrl, coverColor }: { coverUrl: string; coverColor: string }) => (
    <div data-testid="book-cover" data-url={coverUrl} data-color={coverColor} />
  ),
}));

jest.mock("@/lib/admin/actions/books", () => ({
  __esModule: true,
  deleteBook: jest.fn(),
}));

import BooksTable from "@/components/admin/BooksTable";
import { deleteBook } from "@/lib/admin/actions/books";

const {
  createRouterMock,
  setRouterMock,
  resetNavigationMocks,
  routerMock,
} = jest.requireActual("../../mocks/next-navigation") as typeof import("../../mocks/next-navigation");

const deleteBookMock = deleteBook as jest.MockedFunction<typeof deleteBook>;

const baseBook: Book = {
  id: "book-1",
  title: "The Pragmatic Programmer",
  author: "Andrew Hunt",
  genre: "Programming",
  rating: 5,
  totalCopies: 10,
  availableCopies: 7,
  description: "A practical guide for programmers.",
  coverColor: "#123456",
  coverUrl: "/covers/pragmatic.png",
  videoUrl: "/videos/pragmatic.mp4",
  summary: "Summary",
  createdAt: new Date("2024-04-15T00:00:00Z"),
};

const anotherBook: Book = {
  ...baseBook,
  id: "book-2",
  title: "Clean Code",
  author: "Robert C. Martin",
  genre: "Software",
  coverColor: "#abcdef",
  coverUrl: "/covers/clean-code.png",
  createdAt: new Date("2024-04-10T00:00:00Z"),
};

describe("BooksTable", () => {
  beforeEach(() => {
    resetNavigationMocks();
    deleteBookMock.mockReset();
    setRouterMock(createRouterMock());
  });

  it("renders a row for each book with formatted dates and edit links", () => {
    render(
      <BooksTable
        books={[baseBook, anotherBook]}
        isTestAccount={false}
      />
    );

    expect(screen.getAllByRole("row")).toHaveLength(3);
    expect(screen.getByText("The Pragmatic Programmer")).toBeInTheDocument();
    expect(screen.getByText("Clean Code")).toBeInTheDocument();
    expect(screen.getByText("Programming")).toBeInTheDocument();
    expect(screen.getByText("Software")).toBeInTheDocument();

    expect(screen.getByText("15/04/2024")).toBeInTheDocument();
    expect(screen.getByText("10/04/2024")).toBeInTheDocument();

    const editLinks = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href")?.startsWith("/admin/books/edit/"));

    expect(editLinks).toHaveLength(2);
    expect(editLinks[0]).toHaveAttribute("href", "/admin/books/edit/book-1");
    expect(editLinks[1]).toHaveAttribute("href", "/admin/books/edit/book-2");
  });

  it("deletes a book and refreshes the router for non-test accounts", async () => {
    const refresh = jest.fn();
    setRouterMock(createRouterMock({ refresh }));
    deleteBookMock.mockResolvedValue({ success: true });

    render(
      <BooksTable
        books={[baseBook]}
        isTestAccount={false}
      />
    );

    const deleteButton = screen.getAllByRole("button")[0];
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(deleteBookMock).toHaveBeenCalledWith("book-1");
    });
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("prevents deletion for test accounts and shows an alert", () => {
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => undefined);

    render(
      <BooksTable
        books={[baseBook]}
        isTestAccount={true}
      />
    );

    const deleteButton = screen.getAllByRole("button")[0];
    fireEvent.click(deleteButton);

    expect(alertSpy).toHaveBeenCalledWith("You can't delete a book from a test account.");
    expect(deleteBookMock).not.toHaveBeenCalled();
    expect(routerMock.refresh).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });
});
