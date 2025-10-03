import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("next/navigation", () => {
  const navigationModule = jest.requireActual(
    "../mocks/next-navigation"
  ) as typeof import("../mocks/next-navigation");
  return {
    __esModule: true,
    ...navigationModule,
  };
});

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({
    src,
    alt,
    ...rest
  }: React.ComponentProps<"img"> & { fill?: boolean }) =>
    React.createElement("img", {
      src: typeof src === "string" ? src : "",
      alt: alt ?? "",
      ...rest,
    }),
}));

jest.mock("next/link", () => {
  const LinkMock = React.forwardRef<
    HTMLAnchorElement,
    React.PropsWithChildren<React.AnchorHTMLAttributes<HTMLAnchorElement>>
  >(({ children, ...rest }, ref) => (
    <a
      ref={ref}
      {...rest}
    >
      {children}
    </a>
  ));

  LinkMock.displayName = "NextLinkMock";

  return LinkMock;
});

jest.mock("@/components/UserAvatar", () => ({
  __esModule: true,
  default: ({ fullName }: { fullName?: string }) => (
    <div data-testid="user-avatar">{fullName}</div>
  ),
}));

jest.mock("@/lib/actions/auth", () => ({
  __esModule: true,
  signOutAction: jest.fn().mockResolvedValue({ success: true }),
}));

import Header from "@/components/Header";

const { usePathname, resetNavigationMocks } = jest.requireActual(
  "../mocks/next-navigation"
) as typeof import("../mocks/next-navigation");

describe("Header", () => {
  beforeEach(() => {
    resetNavigationMocks();
  });

  it("renders navigation links and highlights the active route", () => {
    (usePathname as jest.Mock).mockReturnValue("/search");

    render(
      <Header
        user={{
          fullName: "Jane Reader",
          role: "USER",
          email: "jane@example.com",
        }}
      />
    );

    expect(screen.getByRole("link", { name: /libraryview/i })).toHaveAttribute(
      "href",
      "/"
    );

    const homeLink = screen.getByRole("link", { name: "Home" });
    const searchLink = screen.getByRole("link", { name: "Search" });

    expect(homeLink).toHaveClass("text-white");
    expect(searchLink).toHaveClass("text-amber-100");

    expect(screen.getByTestId("user-avatar")).toHaveTextContent("Jane Reader");
    expect(screen.getByText("Jane")).toBeInTheDocument();
  });

  it("shows the admin console shortcut for admin and test accounts", () => {
    (usePathname as jest.Mock).mockReturnValue("/admin");

    const { rerender } = render(
      <Header
        user={{
          fullName: "Alex Admin",
          role: "ADMIN",
        }}
      />
    );

    const adminLink = screen.getByRole("link", { name: "Admin Console" });
    expect(adminLink).toHaveAttribute("href", "/admin");
    expect(adminLink).toHaveClass("text-amber-100");

    (usePathname as jest.Mock).mockReturnValue("/dashboard");
    rerender(
      <Header
        user={{
          fullName: "Terry Tester",
          role: "TEST",
        }}
      />
    );

    expect(screen.getByRole("link", { name: "Admin Console" })).toHaveClass(
      "text-white"
    );
  });

  it("hides the admin console link for standard users", () => {
    (usePathname as jest.Mock).mockReturnValue("/");

    render(
      <Header
        user={{
          fullName: "Sam Student",
          role: "USER",
        }}
      />
    );

    expect(screen.queryByText("Admin Console")).not.toBeInTheDocument();
  });
});
