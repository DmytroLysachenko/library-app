import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";

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
} = jest.requireActual("../mocks/next-navigation") as typeof import("../mocks/next-navigation");

import ListPagination from "@/components/ListPagination";

type NavigationOptions = {
  scroll?: boolean;
};

type PushHandler = (href: string, options?: NavigationOptions) => void;
type PushMock = jest.MockedFunction<PushHandler>;

const createPushMock = (): PushMock =>
  jest.fn<ReturnType<PushHandler>, Parameters<PushHandler>>();

const expectPushCall = (
  push: PushMock,
  index: number,
  expected: Record<string, string>
) => {
  const call = push.mock.calls[index];
  expect(call).toBeTruthy();

  const [path, options] = call;
  expect(options).toEqual({ scroll: false });

  const params = new URLSearchParams(path.startsWith("?") ? path.slice(1) : path);

  for (const [key, value] of Object.entries(expected)) {
    expect(params.get(key)).toBe(value);
  }
};

describe("ListPagination", () => {
  beforeEach(() => {
    resetNavigationMocks();
    window.history.replaceState({}, "", "/");
  });

  it("renders user controls for middle pages and navigates via router", () => {
    window.history.replaceState({}, "", "/books?page=3&sort=asc");

    const push = createPushMock();
    setRouterMock(createRouterMock({ push }));

    render(
      <ListPagination currentPage={3} lastPage={5} variant="user" />
    );

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(3);

    const previousButton = buttons[0];
    expect(previousButton).toHaveClass("pagination-btn_dark");
    fireEvent.click(previousButton);
    expectPushCall(push, 0, { page: "2", sort: "asc" });

    const lastPageButton = screen.getByRole("button", { name: "5" });
    expect(lastPageButton).toHaveClass("pagination-btn_dark");
    fireEvent.click(lastPageButton);
    expectPushCall(push, 1, { page: "5", sort: "asc" });

    const nextButton = buttons[buttons.length - 1];
    expect(nextButton).toHaveClass("pagination-btn_dark");
    fireEvent.click(nextButton);
    expectPushCall(push, 2, { page: "4", sort: "asc" });

    expect(screen.getByText("More pages")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("omits unnecessary controls on the final admin page", () => {
    window.history.replaceState({}, "", "/books?page=5&category=fiction");

    const push = createPushMock();
    setRouterMock(createRouterMock({ push }));

    render(
      <ListPagination currentPage={5} lastPage={5} variant="admin" />
    );

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(1);

    const previousButton = buttons[0];
    expect(previousButton).toHaveClass("pagination-btn_light");
    fireEvent.click(previousButton);
    expectPushCall(push, 0, { page: "4", category: "fiction" });

    expect(screen.queryByRole("button", { name: "5" })).not.toBeInTheDocument();
    expect(screen.queryByText("More pages")).not.toBeInTheDocument();
  });

  it("hides the previous control on the first page and preserves params", () => {
    window.history.replaceState({}, "", "/books?sort=popular");

    const push = createPushMock();
    setRouterMock(createRouterMock({ push }));

    render(
      <ListPagination currentPage={1} lastPage={2} variant="user" />
    );

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);

    expect(buttons[0]).toHaveTextContent("2");

    const lastPageButton = screen.getByRole("button", { name: "2" });
    fireEvent.click(lastPageButton);
    expectPushCall(push, 0, { page: "2", sort: "popular" });

    const nextButton = buttons[buttons.length - 1];
    fireEvent.click(nextButton);
    expectPushCall(push, 1, { page: "2", sort: "popular" });

    expect(screen.queryByText("More pages")).not.toBeInTheDocument();
  });
});
