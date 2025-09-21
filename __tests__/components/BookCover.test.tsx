import React from "react";
import { render, screen } from "@testing-library/react";

type MockIkImageProps = {
  path: string;
  urlEndpoint: string;
  alt: string;
  className?: string;
  fill?: boolean;
  loading?: "lazy" | "eager";
  lqip?: { active?: boolean };
};

function renderIkImage(props: MockIkImageProps) {
  const { path, urlEndpoint, alt, className, fill, loading, lqip } = props;

  return (
    <div
      data-testid="ik-image"
      data-path={path}
      data-url-endpoint={urlEndpoint}
      data-alt={alt}
      data-class={className}
      data-fill={fill ? "true" : "false"}
      data-loading={loading}
      data-lqip-active={lqip?.active ? "true" : "false"}
    />
  );
}

jest.mock("@/lib/config", () => {
  const configModule = jest.requireActual("../mocks/config") as typeof import("../mocks/config");
  return {
    __esModule: true,
    ...configModule,
    default: configModule.default,
  };
});

jest.mock("imagekitio-next", () => ({
  __esModule: true,
  IKImage: jest.fn(renderIkImage),
}));

jest.mock("@/components/BookCoverSvg", () => ({
  __esModule: true,
  default: jest.fn(({ coverColor }: { coverColor: string }) => (
    <div
      data-testid="book-cover-svg"
      data-cover-color={coverColor}
    />
  )),
}));

import BookCover from "@/components/BookCover";

describe("BookCover", () => {
  it("renders the cover image using the ImageKit config endpoint", () => {
    render(
      <BookCover coverUrl="/covers/test-book.png" />
    );

    const image = screen.getByTestId("ik-image");

    expect(image).toHaveAttribute("data-path", "/covers/test-book.png");
    expect(image).toHaveAttribute("data-url-endpoint", "https://cdn.test");
    expect(image).toHaveAttribute("data-alt", "Book cover");

    const imageClass = image.getAttribute("data-class") ?? "";
    expect(imageClass).toContain("rounded-sm");
    expect(imageClass).toContain("object-fill");

    expect(image).toHaveAttribute("data-fill", "true");
    expect(image).toHaveAttribute("data-loading", "lazy");
    expect(image).toHaveAttribute("data-lqip-active", "true");
  });

  it("applies variant styles and forwards the cover color", () => {
    const { container } = render(
      <BookCover
        variant="wide"
        className="custom-shadow"
        coverColor="#ff6600"
      />
    );

    const wrapper = container.firstChild as HTMLElement;

    expect(wrapper).toHaveClass("book-cover_wide");
    expect(wrapper).toHaveClass("custom-shadow");

    const svg = screen.getByTestId("book-cover-svg");
    expect(svg).toHaveAttribute("data-cover-color", "#ff6600");
  });
});
