import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("next/navigation", () => {
  const navigationModule = jest.requireActual("../mocks/next-navigation") as typeof import("../mocks/next-navigation");
  return {
    __esModule: true,
    ...navigationModule,
  };
});

const fileUploadHandlers: Array<(filePath: string) => void> = [];

jest.mock("@/components/FileUpload", () => ({
  __esModule: true,
  default: ({
    onFileChange,
    placeholder,
  }: {
    onFileChange: (value: string) => void;
    placeholder: string;
  }) => {
    fileUploadHandlers.push(onFileChange);
    return (
      <button
        type="button"
        data-testid="file-upload"
        onClick={() => onFileChange("uploads/university-card.png")}
      >
        {placeholder}
      </button>
    );
  },
}));

jest.mock("@/lib/actions/hooks/use-toast", () => ({
  __esModule: true,
  toast: jest.fn(),
}));

const {
  createRouterMock,
  setRouterMock,
  resetNavigationMocks,
} = jest.requireActual("../mocks/next-navigation") as typeof import("../mocks/next-navigation");

import AuthForm from "@/components/AuthForm";
import { toast } from "@/lib/actions/hooks/use-toast";
import { signInSchema, signUpSchema } from "@/lib/validations";

const toastMock = toast as jest.Mock;

describe("AuthForm", () => {
  beforeEach(() => {
    resetNavigationMocks();
    toastMock.mockReset();
    fileUploadHandlers.length = 0;
  });

  it("submits valid sign-in credentials and redirects on success", async () => {
    const push = jest.fn();
    setRouterMock(createRouterMock({ push }));
    const onSubmit = jest.fn().mockResolvedValue({ success: true });

    render(
      <AuthForm
        type="SIGN_IN"
        schema={signInSchema}
        defaultValues={{ email: "", password: "" }}
        onSubmit={onSubmit}
      />
    );

    expect(
      screen.getByRole("heading", { name: /welcome back to libraryview/i })
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "reader@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toEqual({
      email: "reader@example.com",
      password: "Password123",
    });

    expect(toastMock).toHaveBeenCalledWith({
      title: "Success",
      description: "You are signed in!",
    });
    expect(push).toHaveBeenCalledWith("/");
    expect(screen.getByRole("link", { name: /create an account/i })).toHaveAttribute(
      "href",
      "/sign-up"
    );
  });

  it("surfaces backend errors while signing up and keeps the user on the page", async () => {
    const push = jest.fn();
    setRouterMock(createRouterMock({ push }));
    const onSubmit = jest
      .fn()
      .mockResolvedValue({ success: false, error: "Email already registered" });

    render(
      <AuthForm
        type="SIGN_UP"
        schema={signUpSchema}
        defaultValues={{
          email: "",
          password: "",
          fullName: "",
          universityId: 0,
          universityCard: "",
        }}
        onSubmit={onSubmit}
      />
    );

    expect(
      screen.getByRole("heading", { name: /create your library account/i })
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Full name"), {
      target: { value: "Jane Reader" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "jane@example.com" },
    });
    fireEvent.change(screen.getByLabelText("University ID Number"), {
      target: { value: "123456" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "StrongPass123" },
    });

    const uploadButton = screen.getByTestId("file-upload");
    expect(uploadButton).toBeInTheDocument();
    fireEvent.click(uploadButton);

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const submittedData = onSubmit.mock.calls[0][0];
    expect(submittedData).toMatchObject({
      fullName: "Jane Reader",
      email: "jane@example.com",
      password: "StrongPass123",
      universityCard: "uploads/university-card.png",
    });
    expect(Number(submittedData.universityId)).toBe(123456);

    expect(toastMock).toHaveBeenCalledWith({
      title: "Error during signing up",
      description: "Email already registered",
      variant: "destructive",
    });
    expect(push).not.toHaveBeenCalled();

    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute(
      "href",
      "/sign-in"
    );
  });
});
