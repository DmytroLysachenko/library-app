import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, ...rest }: React.ComponentProps<"img">) =>
    React.createElement("img", { src: typeof src === "string" ? src : "", alt: alt ?? "", ...rest }),
}));

import NotFoundSection from "@/components/NotFoundSection";

const originalUrl = window.location.href;

const updateLocation = (path: string) => {
  window.history.replaceState({}, "", path);
};

describe("NotFoundSection", () => {
  afterEach(() => {
    updateLocation(originalUrl);
  });

  it("shows the empty state details for the provided query", () => {
    updateLocation("/search?query=science&page=2&sort=desc");

    render(<NotFoundSection query="science" />);

    expect(
      screen.getByRole("heading", { level: 2, name: /search result for/i })
    ).toHaveTextContent("Search Result for science");
    expect(screen.getByText("No Results Found")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "no books" })).toBeInTheDocument();
  });

  it("drops the query parameter when building the clear search link", () => {
    updateLocation("/search?query=science&page=2&sort=desc");

    render(<NotFoundSection query="science" />);

    const clearSearchLink = screen.getByRole("link", { name: /clear search/i });
    expect(clearSearchLink).toHaveAttribute("href", "/search?page=2&sort=desc");

    const parsedUrl = new URL(clearSearchLink.getAttribute("href")!, "http://localhost");
    expect(parsedUrl.searchParams.get("query")).toBeNull();
    expect(parsedUrl.searchParams.get("page")).toBe("2");
    expect(parsedUrl.searchParams.get("sort")).toBe("desc");
  });

  it("handles cases where the query is the only parameter", () => {
    updateLocation("/search?query=science");

    render(<NotFoundSection query="science" />);

    const clearSearchLink = screen.getByRole("link", { name: /clear search/i });
    expect(clearSearchLink).toHaveAttribute("href", "/search?");
  });
});
