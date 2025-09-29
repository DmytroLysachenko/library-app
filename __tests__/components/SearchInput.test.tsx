import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";

jest.mock("next/navigation", () => {
  const navigationModule = jest.requireActual("../mocks/next-navigation") as typeof import("../mocks/next-navigation");
  return {
    __esModule: true,
    ...navigationModule,
  };
});

const {
  createRouterMock,
  setRouterMock,
  resetNavigationMocks,
  usePathname,
} = jest.requireActual("../mocks/next-navigation") as typeof import("../mocks/next-navigation");

import SearchInput from "@/components/SearchInput";

describe("SearchInput", () => {
  beforeEach(() => {
    resetNavigationMocks();
    usePathname.mockReturnValue("/library");
    window.history.replaceState({}, "", "/library?query=initial");
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("applies variant styles and prefills from the current query", () => {
    const push = jest.fn();
    setRouterMock(createRouterMock({ push }));

    render(<SearchInput variant="admin" placeholder="Find books" />);

    const input = screen.getByPlaceholderText("Find books");
    expect(input).toHaveClass("admin-search_input");
    expect(input).toHaveValue("initial");

    const searchWrapper = input.parentElement as HTMLElement;
    expect(searchWrapper).toHaveClass("admin-search");
  });

  it("debounces value changes before pushing an updated query string", () => {
    jest.useFakeTimers();
    const push = jest.fn();
    setRouterMock(createRouterMock({ push }));

    render(<SearchInput searchParam="query" />);

    const input = screen.getByPlaceholderText("Search");
    fireEvent.change(input, { target: { value: "potter" } });

    act(() => {
      jest.advanceTimersByTime(699);
    });
    expect(push).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });

    expect(push).toHaveBeenLastCalledWith("/library?query=potter", { scroll: false });
  });

  it("clears the input, removes the query param, and calls onReset", () => {
    jest.useFakeTimers();
    const push = jest.fn();
    const onReset = jest.fn();

    setRouterMock(createRouterMock({ push }));

    const { rerender } = render(
      <SearchInput
        variant="admin"
        searchParam="query"
        onReset={onReset}
      />
    );

    const input = screen.getByPlaceholderText("Search");

    fireEvent.change(input, { target: { value: "magic" } });

    rerender(
      <SearchInput
        variant="admin"
        searchParam="query"
        onReset={onReset}
      />
    );

    const clearButton = screen.getByRole("button", { name: "Clear search" });
    fireEvent.click(clearButton);

    expect(onReset).toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith("/library?", { scroll: false });
    expect(input).toHaveValue("");
  });
});
