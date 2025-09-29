import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("@/components/BookCover", () => ({
  __esModule: true,
  default: ({ coverColor, coverUrl, ...rest }: { coverColor: string; coverUrl: string }) => (
    <div
      data-testid="book-cover"
      data-cover-color={coverColor}
      data-cover-url={coverUrl}
      data-variant={(rest as { variant?: string }).variant ?? "default"}
    />
  ),
}));

import BookCard from "@/components/BookCard";

const baseCard = {
  id: "book-1",
  author: "Alice Walker",
  title: "The Color Purple",
  genre: "Classics",
  coverColor: "#663399",
  coverUrl: "/covers/purple.png",
} as BookCard;

describe("BookCard", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-03-01T00:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders the basic book information with a link and cover", () => {
    render(<BookCard {...baseCard} />);

    const link = screen.getByRole("link", { name: /the color purple/i });
    expect(link).toHaveAttribute("href", "/books/book-1");

    expect(screen.getByText("Classics")).toBeInTheDocument();
    const cover = screen.getByTestId("book-cover");
    expect(cover).toHaveAttribute("data-cover-color", "#663399");
    expect(cover).toHaveAttribute("data-cover-url", "/covers/purple.png");
    expect(screen.queryByText(/days left/i)).not.toBeInTheDocument();
  });

  it("shows loan details with the remaining days when the book is borrowed", () => {
    render(
      <BookCard
        {...baseCard}
        status="BORROWED"
        borrowDate={new Date("2024-02-27T00:00:00Z")}
        dueDate="2024-03-04T00:00:00Z"
      />
    );

    expect(screen.getByText("Borrowed on Feb 27")).toBeInTheDocument();
    expect(screen.getByText("3 days left")).toBeInTheDocument();
    expect(screen.getByAltText("calendar")).toBeInTheDocument();
    expect(screen.queryByAltText("warning")).not.toBeInTheDocument();
  });

  it("highlights overdue loans with warning indicators", () => {
    render(
      <BookCard
        {...baseCard}
        status="BORROWED"
        dueDate="2024-02-27T00:00:00Z"
      />
    );

    expect(screen.getAllByAltText("warning")).toHaveLength(2);
    expect(screen.getByText("Overdue Return")).toBeInTheDocument();
  });

  it("shows the return date and tick icon for returned books", () => {
    render(
      <BookCard
        {...baseCard}
        status="RETURNED"
        returnDate={new Date("2024-02-27T00:00:00Z")}
        dueDate="2024-02-28T00:00:00Z"
      />
    );

    expect(screen.getByAltText("tick")).toBeInTheDocument();
    expect(screen.getByText("Returned on Feb 27")).toBeInTheDocument();
  });

  it("renders a receipt shortcut when the receipt is still valid", () => {
    render(
      <BookCard
        {...baseCard}
        status="BORROWED"
        dueDate="2024-03-05T00:00:00Z"
        receiptUrl="https://cdn.example/receipt.pdf"
        receiptCreatedAt={new Date("2024-02-29T12:00:00Z")}
      />
    );

    const receiptLink = screen.getByRole("link", { name: /receipt/i });
    expect(receiptLink).toHaveAttribute("href", "https://cdn.example/receipt.pdf");
  });
});
