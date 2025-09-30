import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("lucide-react", () => ({
  __esModule: true,
  BookCopyIcon: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="book-copy-icon" {...props} />
  ),
}));

import EmptyState from "@/components/admin/EmptyState";

describe("EmptyState", () => {
  it("renders the title, description, and icon", () => {
    render(
      <EmptyState
        title="No books found"
        description="Try adjusting your filters"
      />
    );

    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "No books found"
    );
    expect(screen.getByText("Try adjusting your filters")).toBeInTheDocument();
    expect(screen.getByTestId("book-copy-icon")).toBeInTheDocument();
  });

  it("merges custom container styles with the default card styles", () => {
    const { container } = render(
      <EmptyState
        title="No data"
        description="Nothing to show"
        containerStyle="custom-border"
      />
    );

    const card = container.firstElementChild as HTMLElement | null;
    expect(card).not.toBeNull();
    expect(card).toHaveClass("p-8", "custom-border");
  });
});
