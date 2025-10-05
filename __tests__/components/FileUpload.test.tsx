import React, { forwardRef, useImperativeHandle, type FC, type ReactNode } from "react";
import { act, render, screen } from "@testing-library/react";

import FileUpload from "@/components/FileUpload";
import { toast } from "@/lib/actions/hooks/use-toast";
import type { IKUploadResponse, UploadError } from "imagekitio-next/dist/types/components/IKUpload/props";

type UploadProgress = {
  loaded: number;
  total: number;
};

interface MockIKUploadProps {
  onError?: (error: UploadError) => void;
  onSuccess?: (response: IKUploadResponse) => void;
  validateFile?: (file: File) => boolean;
  onUploadStart?: () => void;
  onUploadProgress?: (progress: UploadProgress) => void;
  folder?: string;
  accept?: string;
  children?: ReactNode;
}

type UploadHandle = {
  click: () => void;
};

let latestUploadProps: MockIKUploadProps | null = null;
const uploadClickMock = jest.fn();

jest.mock("imagekitio-next", () => {
  const MockImageKitProvider: FC<{ children: ReactNode }> = ({ children }) => <>{children}</>;

  const MockIKUpload = forwardRef<UploadHandle, MockIKUploadProps>((props, ref) => {
    latestUploadProps = props;
    useImperativeHandle(ref, () => ({
      click: uploadClickMock,
    }));
    return (
      <div
        data-testid="ik-upload"
        data-folder={props.folder}
        data-accept={props.accept}
      />
    );
  });
  MockIKUpload.displayName = "MockIKUpload";


  const MockIKImage: FC<{ path?: string; alt?: string }> = ({ path, alt }) => (
    <img
      data-testid="ik-image"
      data-path={path ?? ""}
      alt={alt ?? "image"}
    />
  );

  const MockIKVideo: FC<{ path?: string }> = ({ path }) => (
    <video
      data-testid="ik-video"
      data-path={path ?? ""}
    />
  );

  return {
    __esModule: true,
    ImageKitProvider: MockImageKitProvider,
    IKUpload: MockIKUpload,
    IKImage: MockIKImage,
    IKVideo: MockIKVideo,
  };
});

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}));

jest.mock("@/lib/actions/hooks/use-toast", () => ({
  __esModule: true,
  toast: jest.fn(),
}));

const toastMock = jest.mocked(toast);

const ensureUploadProps = (): MockIKUploadProps => {
  if (!latestUploadProps) {
    throw new Error("IKUpload props have not been initialised");
  }
  return latestUploadProps;
};

const buildUploadResponse = (overrides: Partial<IKUploadResponse> = {}): IKUploadResponse => ({
  fileId: "file_1",
  name: "upload.bin",
  url: "https://cdn.example/upload.bin",
  thumbnailUrl: "https://cdn.example/upload-thumb.bin",
  height: 100,
  width: 100,
  size: 1024,
  fileType: "image",
  filePath: "/uploads/upload.bin",
  isPrivateFile: false,
  customCoordinates: null,
  $ResponseMetadata: { statusCode: 200, headers: {} },
  ...overrides,
});

describe("FileUpload", () => {
  beforeAll(() => {
    process.env.NEXT_PUBLIC_BASE_URL ??= "http://localhost";
    process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY ??= "public_test_key";
    process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ??= "https://cdn.example";
  });

  beforeEach(() => {
    latestUploadProps = null;
    uploadClickMock.mockClear();
    toastMock.mockClear();
  });

  it("rejects images larger than 20MB and allows smaller uploads", () => {
    render(
      <FileUpload
        type="image"
        accept="image/*"
        placeholder="Upload an image"
        folder="library/images"
        variant="dark"
        onFileChange={jest.fn()}
      />
    );

    const uploadProps = ensureUploadProps();
    const validateFile = uploadProps.validateFile;
    expect(validateFile).toBeDefined();
    if (!validateFile) {
      throw new Error("validateFile should be provided");
    }

    const oversizedImage = new File([new ArrayBuffer(21 * 1024 * 1024)], "large.png", {
      type: "image/png",
    });
    const validImage = new File([new ArrayBuffer(5 * 1024 * 1024)], "small.png", {
      type: "image/png",
    });

    expect(validateFile(oversizedImage)).toBe(false);
    expect(toastMock).toHaveBeenCalledWith({
      title: "File size is too large",
      description: "Please upload a file up to 20MB in size.",
      variant: "destructive",
    });

    toastMock.mockClear();
    expect(validateFile(validImage)).toBe(true);
    expect(toastMock).not.toHaveBeenCalled();
  });

  it("updates progress and renders an image preview after a successful upload", () => {
    const handleFileChange = jest.fn();

    render(
      <FileUpload
        type="image"
        accept="image/*"
        placeholder="Upload an image"
        folder="library/images"
        variant="light"
        onFileChange={handleFileChange}
      />
    );

    const uploadProps = ensureUploadProps();
    const handleProgress = uploadProps.onUploadProgress;
    const handleSuccess = uploadProps.onSuccess;
    expect(handleProgress).toBeDefined();
    expect(handleSuccess).toBeDefined();
    if (!handleProgress || !handleSuccess) {
      throw new Error("Upload callbacks should be defined");
    }

    act(() => {
      handleProgress({ loaded: 45, total: 100 });
    });
    expect(screen.getByText("45%")).toBeInTheDocument();

    const response = buildUploadResponse({ filePath: "/uploads/avatar.png" });
    act(() => {
      handleSuccess(response);
    });

    expect(handleFileChange).toHaveBeenCalledWith("/uploads/avatar.png");
    expect(toastMock).toHaveBeenCalledWith({
      title: "image uploaded successfully",
      description: "/uploads/avatar.png uploaded",
    });
    expect(screen.getByTestId("ik-image")).toHaveAttribute("data-path", "/uploads/avatar.png");
  });

  it("renders a video preview and success toast for video uploads", () => {
    const handleFileChange = jest.fn();

    render(
      <FileUpload
        type="video"
        accept="video/*"
        placeholder="Upload a video"
        folder="library/videos"
        variant="dark"
        onFileChange={handleFileChange}
      />
    );

    const uploadProps = ensureUploadProps();
    const handleSuccess = uploadProps.onSuccess;
    expect(handleSuccess).toBeDefined();
    if (!handleSuccess) {
      throw new Error("onSuccess should be provided for video uploads");
    }

    const response = buildUploadResponse({
      fileType: "non-image",
      filePath: "/uploads/video.mp4",
    });

    act(() => {
      handleSuccess(response);
    });

    expect(handleFileChange).toHaveBeenCalledWith("/uploads/video.mp4");
    expect(toastMock).toHaveBeenCalledWith({
      title: "video uploaded successfully",
      description: "/uploads/video.mp4 uploaded",
    });
    expect(screen.getByTestId("ik-video")).toHaveAttribute("data-path", "/uploads/video.mp4");
  });

  it("notifies the user when an upload error occurs", () => {
    render(
      <FileUpload
        type="image"
        accept="image/*"
        placeholder="Upload"
        folder="library/images"
        variant="dark"
        onFileChange={jest.fn()}
      />
    );

    const uploadProps = ensureUploadProps();
    const handleError = uploadProps.onError;
    expect(handleError).toBeDefined();
    if (!handleError) {
      throw new Error("onError should be provided");
    }

    const error: UploadError = { message: "network" };

    act(() => {
      handleError(error);
    });

    expect(toastMock).toHaveBeenCalledWith({
      title: "image upload failed",
      description: "Your image could not be uploaded. Please try again.",
      variant: "destructive",
    });
  });
});


