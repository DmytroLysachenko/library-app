import React, {
  forwardRef,
  useImperativeHandle,
  type FC,
  type ReactNode,
} from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";

import FileUpload from "@/components/FileUpload";
import config from "@/lib/config";
import { toast } from "@/lib/actions/hooks/use-toast";
import type {
  IKUploadResponse,
  UploadError,
} from "imagekitio-next/dist/types/components/IKUpload/props";

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
type AuthenticatorResult = {
  token: string;
  expire: number;
  signature: string;
};
type Authenticator = () => Promise<AuthenticatorResult>;
let latestAuthenticator: Authenticator | null = null;
const uploadClickMock = jest.fn();

jest.mock("imagekitio-next", () => {
  interface MockImageKitProviderProps {
    children: ReactNode;
    authenticator?: Authenticator;
    publicKey?: string;
    urlEndpoint?: string;
  }

  const MockImageKitProvider: FC<MockImageKitProviderProps> = ({
    children,
    authenticator,
  }) => {
    latestAuthenticator = authenticator ?? null;
    return <>{children}</>;
  };

  const MockIKUpload = forwardRef<UploadHandle, MockIKUploadProps>(
    (props, ref) => {
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
    }
  );
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
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img {...props} />
  ),
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

const ensureAuthenticator = (): Authenticator => {
  if (!latestAuthenticator) {
    throw new Error("Authenticator has not been initialised");
  }
  return latestAuthenticator;
};

const buildUploadResponse = (
  overrides: Partial<IKUploadResponse> = {}
): IKUploadResponse => ({
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
    process.env.NEXT_PUBLIC_BASE_URL = "http://localhost";
    process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY = "public_test_key";
    process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT = "https://cdn.example";
    config.env.baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    config.env.imagekit.publicKey =
      process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!;
    config.env.imagekit.urlEndpoint =
      process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!;
  });

  beforeEach(() => {
    latestUploadProps = null;
    latestAuthenticator = null;
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

    const oversizedImage = new File(
      [new ArrayBuffer(21 * 1024 * 1024)],
      "large.png",
      {
        type: "image/png",
      }
    );
    const validImage = new File(
      [new ArrayBuffer(5 * 1024 * 1024)],
      "small.png",
      {
        type: "image/png",
      }
    );

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

  it("enforces the 50MB limit for video uploads", () => {
    render(
      <FileUpload
        type="video"
        accept="video/*"
        placeholder="Upload a video"
        folder="library/videos"
        variant="light"
        onFileChange={jest.fn()}
      />
    );

    const uploadProps = ensureUploadProps();
    const validateFile = uploadProps.validateFile;
    expect(validateFile).toBeDefined();
    if (!validateFile) {
      throw new Error("validateFile should be provided");
    }

    const oversizedVideo = {
      size: 51 * 1024 * 1024,
      type: "video/mp4",
    } as File;
    const validVideo = { size: 10 * 1024 * 1024, type: "video/mp4" } as File;

    expect(validateFile(oversizedVideo)).toBe(false);
    expect(toastMock).toHaveBeenCalledWith({
      title: "File size is too large",
      description: "Please upload a file up to 50MB in size.",
      variant: "destructive",
    });

    toastMock.mockClear();
    expect(validateFile(validVideo)).toBe(true);
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
    expect(screen.getByTestId("ik-image")).toHaveAttribute(
      "data-path",
      "/uploads/avatar.png"
    );
  });

  it("resets progress when a new upload starts and triggers the hidden input on click", () => {
    render(
      <FileUpload
        type="image"
        accept="image/*"
        placeholder="Upload an image"
        folder="library/images"
        variant="light"
        onFileChange={jest.fn()}
      />
    );

    const uploadProps = ensureUploadProps();
    const handleStart = uploadProps.onUploadStart;
    const handleProgress = uploadProps.onUploadProgress;
    expect(handleStart).toBeDefined();
    expect(handleProgress).toBeDefined();
    if (!handleStart || !handleProgress) {
      throw new Error("Upload callbacks should be defined");
    }

    act(() => {
      handleProgress({ loaded: 25, total: 100 });
    });
    expect(screen.getByText("25%")).toBeInTheDocument();

    act(() => {
      handleStart();
    });
    expect(screen.queryByText("25%")).toBeNull();

    fireEvent.click(screen.getByRole("button"));
    expect(uploadClickMock).toHaveBeenCalled();
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
    expect(screen.getByTestId("ik-video")).toHaveAttribute(
      "data-path",
      "/uploads/video.mp4"
    );
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

  it("authenticates uploads through the API endpoint", async () => {
    const originalFetch = globalThis.fetch;
    const fetchMock = jest.fn();
    const payload: AuthenticatorResult = {
      token: "token",
      expire: 1700,
      signature: "signature",
    };
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => payload,
    } as Response);
    globalThis.fetch = fetchMock;

    try {
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

      const authenticator = ensureAuthenticator();
      await expect(authenticator()).resolves.toEqual(payload);
      expect(fetchMock).toHaveBeenCalledWith("http://localhost/api/imagekit");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("surfaces detailed errors when authentication fails", async () => {
    const originalFetch = globalThis.fetch;
    const fetchMock = jest.fn();
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => "boom",
    } as Response);
    globalThis.fetch = fetchMock;

    try {
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

      const authenticator = ensureAuthenticator();
      await expect(authenticator()).rejects.toThrow(
        "Authentication request failed: Error: Request failed with status 500: boom"
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
