function createChromiumArgs() {
  return ["--no-sandbox", "--disable-gpu"] as const;
}

jest.mock("puppeteer-core", () => ({
  __esModule: true,
  default: { launch: jest.fn() },
}));

jest.mock("@sparticuz/chromium", () => ({
  __esModule: true,
  default: {
    args: createChromiumArgs(),
    executablePath: jest.fn(),
  },
}));

jest.mock("@/lib/utils/awsS3", () => ({
  __esModule: true,
  uploadToS3: jest.fn(),
}));

jest.mock("@/lib/emailTemplates", () => ({
  __esModule: true,
  emailTemplates: {
    RECEIPT: jest.fn(),
  },
}));

import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { uploadToS3 } from "@/lib/utils/awsS3";
import { emailTemplates } from "@/lib/emailTemplates";
import { generatePdf } from "@/lib/utils/generatePdf";

const launchMock = jest.mocked(puppeteer.launch);
const executablePathMock = jest.mocked(chromium.executablePath);
const uploadToS3Mock = jest.mocked(uploadToS3);
const receiptTemplateMock = jest.mocked(emailTemplates.RECEIPT);

const setContentMock = jest.fn<
  Promise<void>,
  [string, { waitUntil: "networkidle0" }]
>();
const pdfMock = jest.fn<
  Promise<Uint8Array>,
  [
    {
      format: string;
      printBackground: boolean;
      margin: { top: string; right: string; bottom: string; left: string };
    },
  ]
>();
const newPageMock = jest.fn<
  Promise<{ setContent: typeof setContentMock; pdf: typeof pdfMock }>,
  []
>();
const closeMock = jest.fn<Promise<void>, []>();

describe("generatePdf", () => {
  const baseData = {
    receiptId: "receipt-123",
    studentName: "Ada Lovelace",
    bookTitle: "The Art of Testing",
    bookAuthor: "Grace Hopper",
    bookGenre: "Non-fiction",
    borrowDate: "2024-01-01",
    dueDate: "2024-01-08",
    duration: "7 days",
    issueDate: "2024-01-01",
    websiteUrl: "https://library.test",
    supportEmail: "support@library.test",
  } as const;

  beforeEach(() => {
    jest.clearAllMocks();

    setContentMock.mockResolvedValue();
    pdfMock.mockResolvedValue(new Uint8Array([1, 2, 3]));
    newPageMock.mockResolvedValue({ setContent: setContentMock, pdf: pdfMock });
    closeMock.mockResolvedValue();
    launchMock.mockResolvedValue({
      newPage: newPageMock,
      close: closeMock,
    } as unknown as Awaited<ReturnType<typeof puppeteer.launch>>);
    uploadToS3Mock.mockResolvedValue("https://cdn.example/receipt.pdf");
    receiptTemplateMock.mockReturnValue("<html>Receipt</html>");
    executablePathMock.mockResolvedValue("/opt/chromium");
  });

  it("renders the receipt template, generates a PDF, and uploads it to S3", async () => {
    const result = await generatePdf(baseData);

    expect(launchMock).toHaveBeenCalledWith({
      args: createChromiumArgs(),
      executablePath: "/opt/chromium",
    });
    expect(newPageMock).toHaveBeenCalledTimes(1);
    expect(receiptTemplateMock).toHaveBeenCalledWith(baseData);
    expect(setContentMock).toHaveBeenCalledWith("<html>Receipt</html>", {
      waitUntil: "networkidle0",
    });
    expect(pdfMock).toHaveBeenCalledWith({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
    });

    expect(uploadToS3Mock).toHaveBeenCalledTimes(1);
    const [bufferArg, keyArg, contentType] = uploadToS3Mock.mock.calls[0];
    expect(Buffer.isBuffer(bufferArg)).toBe(true);
    expect(bufferArg.equals(Buffer.from([1, 2, 3]))).toBe(true);
    expect(keyArg).toMatch(/^receipts\/receipt_\d+\.pdf$/);
    expect(contentType).toBe("application/pdf");
    expect(closeMock).toHaveBeenCalledTimes(1);
    expect(result).toBe("https://cdn.example/receipt.pdf");
  });

  it("propagates errors from S3 uploads after closing the browser", async () => {
    uploadToS3Mock.mockRejectedValueOnce(new Error("upload failed"));

    await expect(generatePdf(baseData)).rejects.toThrow("upload failed");
    expect(closeMock).toHaveBeenCalledTimes(1);
  });
});
