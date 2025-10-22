import { EmailTemplate } from "@/constants";
import { emailTemplates } from "@/lib/emailTemplates";
import type { TemplateData } from "@/lib/email";

describe("emailTemplates", () => {
  it("renders the welcome email with a fallback name and login link", () => {
    const html = emailTemplates[EmailTemplate.WELCOME]({
      studentName: null,
      loginUrl: "https://library.test/login",
    } as TemplateData);

    expect(html).toContain("Hi User");
    expect(html).toContain(
      '<a href="https://library.test/login" class="button">Log in to LibraryView</a>'
    );
  });

  it("includes the renew call-to-action only when a renew URL is present", () => {
    const baseData: TemplateData = {
      studentName: "Ada Lovelace",
      bookTitle: "API Design Patterns",
      dueDate: "2024-03-01",
      renewUrl: "https://library.test/renew",
    };

    const htmlWithRenew = emailTemplates[EmailTemplate.DUE_REMINDER](baseData);
    expect(htmlWithRenew).toContain("Renew Book Now");
    expect(htmlWithRenew).toContain(
      '<a href="https://library.test/renew" class="button">Renew Book Now</a>'
    );

    const { renewUrl, ...withoutRenew } = baseData;
    const htmlWithoutRenew = emailTemplates[EmailTemplate.DUE_REMINDER](
      withoutRenew as TemplateData
    );

    expect(htmlWithoutRenew).not.toContain("Renew Book Now");
  });

  it("renders the receipt template with all details and formats the duration", () => {
    const baseData: TemplateData = {
      studentName: "Ada Lovelace",
      receiptId: "receipt-123",
      issueDate: "2024-02-01",
      bookTitle: "API Design Patterns",
      bookAuthor: "JJ Geewax",
      bookGenre: "Technology",
      borrowDate: "2024-02-01",
      dueDate: "2024-02-08",
      duration: 7,
      websiteUrl: "https://library.test",
      supportEmail: "support@library.test",
    };

    const fullReceipt = emailTemplates[EmailTemplate.RECEIPT](baseData);

    expect(fullReceipt).toContain("<!DOCTYPE html>");
    expect(fullReceipt).toContain("Borrow Receipt");
    expect(fullReceipt).toContain("Duration");
    expect(fullReceipt).toContain("7 Days");
    expect(fullReceipt).toContain('href="mailto:support@library.test"');

    const htmlWithoutDuration = emailTemplates[EmailTemplate.RECEIPT]({
      ...baseData,
      duration: null,
    });

    expect(htmlWithoutDuration).not.toContain("Days</p>");
  });

  it("renders the receipt generated email with a download link opening in a new tab", () => {
    const html = emailTemplates[EmailTemplate.RECEIPT_GENERATED]({
      studentName: "Ada Lovelace",
      bookTitle: "API Design Patterns",
      borrowDate: "2024-02-01",
      dueDate: "2024-02-08",
      downloadUrl: "https://library.test/receipt.pdf",
    } as TemplateData);

    expect(html).toContain("Download Receipt");
    expect(html).toContain(
      '<a href="https://library.test/receipt.pdf" class="button" target="_blank">Download Receipt</a>'
    );
  });
});

