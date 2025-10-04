import React from "react";
import { render } from "@testing-library/react";

const providerSpy = jest.fn();
const videoSpy = jest.fn();

jest.mock("imagekitio-next", () => {
  return {
    __esModule: true,
    ImageKitProvider: ({
      children,
      ...props
    }: {
      children: React.ReactNode;
    }) => {
      providerSpy(props);
      return React.createElement(
        "div",
        { "data-testid": "imagekit-provider" },
        children
      );
    },
    IKVideo: (props: Record<string, unknown>) => {
      videoSpy(props);
      return React.createElement("div", { "data-testid": "ik-video" });
    },
  };
});

jest.mock("@/lib/config", () => ({
  __esModule: true,
  default: {
    env: {
      imagekit: {
        publicKey: "public_test_key",
        urlEndpoint: "https://ik.example.com",
      },
    },
  },
}));

import BookVideo from "@/components/BookVideo";

describe("BookVideo", () => {
  beforeEach(() => {
    providerSpy.mockClear();
    videoSpy.mockClear();
  });

  it("forwards the ImageKit configuration and video props", () => {
    render(<BookVideo videoUrl="/videos/gatsby.mp4" />);

    expect(providerSpy).toHaveBeenCalledWith({
      publicKey: "public_test_key",
      urlEndpoint: "https://ik.example.com",
    });

    expect(videoSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        path: "/videos/gatsby.mp4",
        width: "100%",
        controls: true,
        className: "w-full rounded-xl max-h-[500px]",
      })
    );
  });
});
