import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("next/navigation", () => {
  const navigationModule = jest.requireActual(
    "../../mocks/next-navigation"
  ) as typeof import("../../mocks/next-navigation");
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

jest.mock("@/components/ui/button", () => {
  interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
  }

  const Button = ({ asChild, children, ...rest }: ButtonProps) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, rest);
    }

    return <button {...rest}>{children}</button>;
  };

  return {
    __esModule: true,
    Button,
  };
});

jest.mock("@/components/ui/badge", () => ({
  __esModule: true,
  Badge: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <span
      className={className}
      data-testid="badge"
    >
      {children}
    </span>
  ),
}));

jest.mock("@/components/ui/select", () => {
  type SelectValue = "USER" | "ADMIN";

  interface SelectProps {
    value: SelectValue;
    disabled?: boolean;
    onValueChange: (value: SelectValue) => void;
    children: React.ReactNode;
  }

  const Select = ({
    value,
    disabled,
    onValueChange,
    children,
  }: SelectProps) => (
    <select
      data-testid="role-select"
      value={value}
      disabled={disabled}
      onChange={(event) => onValueChange(event.target.value as SelectValue)}
    >
      {children}
    </select>
  );

  const SelectTrigger = ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  );
  const SelectContent = ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  );
  const SelectValue = () => null;
  const SelectItem = ({ value }: { value: SelectValue }) => (
    <option value={value}>{value}</option>
  );

  return {
    __esModule: true,
    Select,
    SelectContent,
    SelectTrigger,
    SelectValue,
    SelectItem,
  };
});

jest.mock("@/lib/config", () => ({
  __esModule: true,
  default: {
    env: {
      imagekit: {
        urlEndpoint: "https://cdn.example",
      },
    },
  },
}));

jest.mock("@/lib/admin/actions/users", () => ({
  __esModule: true,
  changeUserRole: jest.fn(),
  approveUser: jest.fn(),
  deleteUser: jest.fn(),
  rejectUser: jest.fn(),
}));

jest.mock("@/lib/actions/hooks/use-toast", () => ({
  __esModule: true,
  toast: jest.fn(),
}));

import UserTableRecord from "@/components/admin/UserTableRecord";
import {
  changeUserRole,
  approveUser,
  deleteUser,
  rejectUser,
} from "@/lib/admin/actions/users";
import { toast } from "@/lib/actions/hooks/use-toast";

const { createRouterMock, setRouterMock, resetNavigationMocks, routerMock } =
  jest.requireActual(
    "../../mocks/next-navigation"
  ) as typeof import("../../mocks/next-navigation");

const changeUserRoleMock = changeUserRole as jest.MockedFunction<
  typeof changeUserRole
>;
const approveUserMock = approveUser as jest.MockedFunction<typeof approveUser>;
const deleteUserMock = deleteUser as jest.MockedFunction<typeof deleteUser>;
const rejectUserMock = rejectUser as jest.MockedFunction<typeof rejectUser>;
const toastMock = toast as jest.MockedFunction<typeof toast>;

const baseUser: User = {
  id: "user-1",
  fullName: "Dana Reader",
  email: "dana@example.com",
  role: "USER",
  status: "APPROVED",
  borrowedBooks: 3,
  avatar: "/avatars/dana.png",
  createdAt: new Date("2024-04-01T00:00:00Z"),
  lastActivityDate: null,
  universityId: 987654,
  password: "hashed",
  universityCard: "/cards/dana.png",
};

describe("UserTableRecord", () => {
  beforeEach(() => {
    resetNavigationMocks();
    setRouterMock(createRouterMock());
    changeUserRoleMock.mockReset();
    approveUserMock.mockReset();
    deleteUserMock.mockReset();
    rejectUserMock.mockReset();
    toastMock.mockReset();
  });

  const renderRecord = (
    props: Partial<React.ComponentProps<typeof UserTableRecord>> = {}
  ) => {
    const finalProps: React.ComponentProps<typeof UserTableRecord> = {
      user: baseUser,
      isUsersTable: true,
      isCurrentUser: false,
      isTestAccount: false,
      ...props,
    };

    return render(
      <table>
        <tbody>
          <UserTableRecord {...finalProps} />
        </tbody>
      </table>
    );
  };

  it("allows changing the user role and shows a success toast", async () => {
    changeUserRoleMock.mockResolvedValue({
      success: true,
      data: {},
    });

    renderRecord();

    const roleSelect = screen.getByTestId("role-select") as HTMLSelectElement;
    expect(roleSelect.value).toBe("USER");

    fireEvent.change(roleSelect, { target: { value: "ADMIN" } });

    await waitFor(() => {
      expect(changeUserRoleMock).toHaveBeenCalledWith("user-1", "ADMIN");
    });

    expect(roleSelect.value).toBe("ADMIN");
    expect(toastMock).toHaveBeenCalledWith({
      title: "Success",
      description: "User role changed successfully",
    });
  });

  it("restores the previous role and shows an error toast when updating fails", async () => {
    changeUserRoleMock.mockRejectedValueOnce(new Error("network error"));

    renderRecord();

    const roleSelect = screen.getByTestId("role-select") as HTMLSelectElement;
    fireEvent.change(roleSelect, { target: { value: "ADMIN" } });

    await waitFor(() => {
      expect(changeUserRoleMock).toHaveBeenCalledWith("user-1", "ADMIN");
    });

    expect(roleSelect.value).toBe("USER");
    expect(toastMock).toHaveBeenCalledWith({
      title: "Error",
      description: "An error occurred. Please try again.",
      variant: "destructive",
    });
  });

  it("calls deleteUser and refresh when removing a user from the users table", async () => {
    deleteUserMock.mockResolvedValue({ success: true });
    const refresh = jest.fn();
    setRouterMock(createRouterMock({ refresh }));

    renderRecord();

    const deleteButton = screen.getAllByRole("button")[0];
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(deleteUserMock).toHaveBeenCalledWith("user-1");
    });
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("prevents destructive actions on test accounts", () => {
    const alertSpy = jest
      .spyOn(window, "alert")
      .mockImplementation(() => undefined);

    renderRecord({ isTestAccount: true });

    const deleteButton = screen.getAllByRole("button")[0];
    fireEvent.click(deleteButton);

    expect(alertSpy).toHaveBeenCalledWith(
      "You cannot delete from a test account."
    );
    expect(deleteUserMock).not.toHaveBeenCalled();
    expect(routerMock.refresh).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });

  it("renders approve and reject controls for pending requests", async () => {
    approveUserMock.mockResolvedValue({ success: true, data: {} });
    rejectUserMock.mockResolvedValue({ success: true, data: {} });
    const refresh = jest.fn();
    setRouterMock(createRouterMock({ refresh }));

    renderRecord({
      isUsersTable: false,
      user: { ...baseUser, status: "PENDING" },
    });

    const approveButton = screen.getByRole("button", { name: /approve user/i });
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(approveUserMock).toHaveBeenCalledWith("user-1");
    });

    const actionButtons = screen.getAllByRole("button");
    fireEvent.click(actionButtons[actionButtons.length - 1]);

    await waitFor(() => {
      expect(rejectUserMock).toHaveBeenCalledWith("user-1");
    });

    expect(refresh).toHaveBeenCalledTimes(2);
  });
});
