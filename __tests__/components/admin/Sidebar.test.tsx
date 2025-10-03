import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("next/navigation", () => {
  const navigationModule = jest.requireActual("../../mocks/next-navigation") as typeof import("../../mocks/next-navigation");
  return {
    __esModule: true,
    ...navigationModule,
  };
});

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, fill: _fill, ...rest }: React.ComponentProps<"img"> & { fill?: boolean }) =>
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
    <a ref={ref} {...rest}>
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

import Sidebar from "@/components/admin/Sidebar";

const { usePathname, resetNavigationMocks } = jest.requireActual(
  "../../mocks/next-navigation"
) as typeof import("../../mocks/next-navigation");

describe("Admin Sidebar", () => {
  beforeEach(() => {
    resetNavigationMocks();
  });

  it("renders all navigation entries and the user summary", () => {
    (usePathname as jest.Mock).mockReturnValue("/admin");

    render(
      <Sidebar
        user={{
          fullName: "Avery Admin",
          email: "avery@example.com",
          avatar: "/avatar.png",
        }}
      />
    );

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(7);

    const nameInstances = screen.getAllByText("Avery Admin");
    expect(nameInstances).toHaveLength(2);
    expect(screen.getByText("avery@example.com")).toBeInTheDocument();

    const homeLinkWrapper = screen.getByText("Home").closest("a");
    expect(homeLinkWrapper).not.toBeNull();
    expect(homeLinkWrapper!.firstElementChild).toHaveClass("bg-primary-admin");
  });

  it("marks nested routes as active when the pathname includes them", () => {
    (usePathname as jest.Mock).mockReturnValue("/admin/books/123");

    render(
      <Sidebar
        user={{
          fullName: "Bill Librarian",
          email: "bill@example.com",
        }}
      />
    );

    const booksLinkWrapper = screen.getByText("All Books").closest("a");
    const usersLinkWrapper = screen.getByText("All Users").closest("a");

    expect(booksLinkWrapper).not.toBeNull();
    expect(usersLinkWrapper).not.toBeNull();

    expect(booksLinkWrapper!.firstElementChild).toHaveClass("bg-primary-admin");
    expect(usersLinkWrapper!.firstElementChild).not.toHaveClass("bg-primary-admin");
  });
});
