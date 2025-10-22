const sendMock = jest.fn();

const S3ClientMock = jest.fn().mockImplementation(() => ({ send: sendMock }));

const PutObjectCommandMock = jest
  .fn()
  .mockImplementation((params) => ({ params }));

jest.mock("@aws-sdk/client-s3", () => ({
  __esModule: true,
  S3Client: S3ClientMock,
  PutObjectCommand: PutObjectCommandMock,
}));

describe("uploadToS3", () => {
  beforeEach(() => {
    jest.resetModules();
    sendMock.mockReset();
    sendMock.mockResolvedValue(undefined);
    S3ClientMock.mockClear();
    PutObjectCommandMock.mockClear();
  });

  it("throws when the amazon configuration is incomplete", async () => {
    jest.doMock("@/lib/config", () => ({
      __esModule: true,
      default: { env: { amazon: {} } },
    }));

    const { uploadToS3 } = await import("@/lib/utils/awsS3");

    await expect(
      uploadToS3(Buffer.from("file"), "document.pdf", "application/pdf")
    ).rejects.toThrow("Amazon S3 environment variables are not fully configured.");

    expect(S3ClientMock).not.toHaveBeenCalled();
  });

  it("uploads a file and reuses the cached S3 client", async () => {
    jest.doMock("@/lib/config", () =>
      jest.requireActual("../../mocks/config")
    );

    const { uploadToS3 } = await import("@/lib/utils/awsS3");

    const buffer = Buffer.from("content");
    const url = await uploadToS3(buffer, "covers/book.png", "image/png");

    expect(S3ClientMock).toHaveBeenCalledTimes(1);
    expect(S3ClientMock).toHaveBeenCalledWith({
      region: "us-east-1",
      credentials: {
        accessKeyId: "aws-access-key",
        secretAccessKey: "aws-secret",
      },
    });

    expect(PutObjectCommandMock).toHaveBeenCalledWith({
      Bucket: "library-test-bucket",
      Key: "covers/book.png",
      Body: buffer,
      ContentType: "image/png",
    });

    expect(sendMock).toHaveBeenCalledWith(
      PutObjectCommandMock.mock.results[0]?.value
    );
    expect(url).toBe(
      "https://library-test-bucket.s3.us-east-1.amazonaws.com/covers/book.png"
    );

    await uploadToS3(buffer, "covers/book.png", "image/png");
    expect(S3ClientMock).toHaveBeenCalledTimes(1);
  });
});
