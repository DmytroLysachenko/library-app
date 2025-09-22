import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("next/navigation", () => {
  const navigationModule = jest.requireActual("../mocks/next-navigation") as typeof import("../mocks/next-navigation");
  return {
    __esModule: true,
    ...navigationModule,
  };
});

jest.mock("@/components/ui/select", () => {
  const selectModule = jest.requireActual("../mocks/components/ui/select") as typeof import("../mocks/components/ui/select");
  return {
    __esModule: true,
    ...selectModule,
  };
});

const {
  createRouterMock,
  setRouterMock,
  resetNavigationMocks,
  useSearchParams,
} = jest.requireActual("../mocks/next-navigation") as typeof import("../mocks/next-navigation");

import SortSelector from "@/components/SortSelector";

type NavigationOptions = {
  scroll?: boolean;
};

type PushHandler = (href: string, options?: NavigationOptions) => void;
type PushMock = jest.Mock<ReturnType<PushHandler>, Parameters<PushHandler>>;

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
  expect(options).toBeUndefined();

  const params = new URLSearchParams(
    path.startsWith("?") ? path.slice(1) : path
  );

  for (const [key, value] of Object.entries(expected)) {
    expect(params.get(key)).toBe(value);
  }

  return params;
};

describe("SortSelector", () => {
  beforeEach(() => {
    resetNavigationMocks();
    window.history.replaceState({}, "", "/");
    useSearchParams.mockImplementation(
      () => new URLSearchParams(window.location.search)
    );
  });

  it("renders the user variant with placeholder text and pushes updated params", () => {
    window.history.replaceState({}, "", "/books?page=2&category=fiction");

    const push = createPushMock();
    setRouterMock(createRouterMock({ push }));

    render(
      <SortSelector
        variant="user"
        param="sort"
        options={[
          { value: "popular", title: "Popular" },
          { value: "recent", title: "Recently Added" },
        ]}
      />
    );

    const trigger = screen.getByTestId("select-trigger");
    expect(trigger).toHaveClass("select-trigger");
    expect(screen.getByTestId("select-value")).toHaveTextContent("Sort by");

    fireEvent.click(screen.getByTestId("select-item-popular"));

    expect(screen.getByTestId("select-value")).toHaveTextContent("popular");
    const params = expectPushCall(push, 0, {
      page: "2",
      category: "fiction",
      sort: "popular",
    });
    expect(Array.from(params.keys()).length).toBe(3);
  });

  it("shows the current admin selection and clears the param with the cancel control", async () => {
    window.history.replaceState({}, "", "/admin?page=5&sort=recent&filter=active");

    const push = createPushMock();
    setRouterMock(createRouterMock({ push }));

    render(
      <SortSelector
        variant="admin"
        param="sort"
        options={[
          { value: "recent", title: "Recent" },
          { value: "popular", title: "Popular" },
        ]}
      />
    );

    expect(screen.getByTestId("select-trigger")).not.toHaveClass("select-trigger");
    expect(screen.getByTestId("select-value")).toHaveTextContent("recent");

    const buttons = screen.getAllByRole("button");
    const cancelButton = buttons[buttons.length - 1];
    fireEvent.click(cancelButton);

    await waitFor(() =>
      expect(screen.getByTestId("select-value")).toHaveTextContent("Sort by")
    );
    const params = expectPushCall(push, 0, {
      page: "5",
      filter: "active",
    });
    expect(params.get("sort")).toBeNull();
  });

  it("omits the cancel button when cancelButton is false", () => {
    window.history.replaceState({}, "", "/catalog");

    const push = createPushMock();
    setRouterMock(createRouterMock({ push }));

    render(
      <SortSelector
        variant="user"
        param="sort"
        options={[{ value: "popular", title: "Popular" }]}
        cancelButton={false}
      />
    );

    expect(screen.getByTestId("select-value")).toHaveTextContent("Sort by");
    expect(screen.getAllByRole("button")).toHaveLength(2);
    expect(screen.queryAllByTestId(/select-item/)).toHaveLength(1);
    expect(screen.queryByTestId("cancel-button")).toBeNull();
    expect(push).not.toHaveBeenCalled();
  });
});


