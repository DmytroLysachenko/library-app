jest.mock("@/lib/config", () => {
  const configModule = jest.requireActual("../mocks/config") as typeof import("../mocks/config");
  return {
    __esModule: true,
    ...configModule,
    default: configModule.default,
  };
});

jest.mock("@/components/ui/avatar", () => {
  const avatarModule = jest.requireActual(
    "../mocks/components/ui/avatar"
  ) as typeof import("../mocks/components/ui/avatar");
  return {
    __esModule: true,
    ...avatarModule,
  };
});

import React from "react";
import { render, screen } from "@testing-library/react";

import UserAvatar from "@/components/UserAvatar";

describe("UserAvatar", () => {
  it("renders the user's initials when no avatar image is provided", () => {
    render(
      <UserAvatar
        fullName="Ada Lovelace"
        className="custom-class"
      />
    );

    const fallback = screen.getByTestId("avatar-fallback");

    expect(fallback).toHaveTextContent("AL");
    expect(fallback).toHaveClass("bg-amber-100");
  });

  it("renders the avatar image when an avatar URL is provided", () => {
    render(
      <UserAvatar
        fullName="Grace Hopper"
        avatarUrl="/profiles/grace.png"
      />
    );

    const image = screen.getByTestId("avatar-image") as HTMLImageElement;

    expect(image.src).toBe("https://cdn.test/profiles/grace.png");
    expect(image.alt).toBe("");
  });
});
