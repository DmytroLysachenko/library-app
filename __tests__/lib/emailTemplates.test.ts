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

  describe("remaining templates", () => {
    const baseData: TemplateData = {
      studentName: "Ada Lovelace",
      loginUrl: "https://library.test/login",
      supportEmail: "support@library.test",
      bookTitle: "Clean Code",
      borrowDate: "2025-02-01",
      dueDate: "2025-02-08",
      borrowedBooksUrl: "https://library.test/borrowed",
      exploreUrl: "https://library.test/explore",
      discoverUrl: "https://library.test/discover",
    };

    const scenarios: Array<
      [EmailTemplate, Partial<TemplateData>, string[]]
    > = [
      [
        EmailTemplate.APPROVAL,
        {},
        [
          "Your LibraryView Account Has Been Approved!",
          "Log in to LibraryView",
        ],
      ],
      [
        EmailTemplate.REJECTION,
        {},
        [
          "Account Application Rejected",
          'href="mailto:support@library.test"',
        ],
      ],
      [
        EmailTemplate.BORROW_CONFIRMATION,
        {},
        [
          "You've successfully borrowed Clean Code",
          "View Borrowed Books",
        ],
      ],
      [
        EmailTemplate.RETURN_CONFIRMATION,
        {},
        [
          "Thank You for Returning Clean Code!",
          "Explore New Books",
        ],
      ],
      [
        EmailTemplate.INACTIVITY_REMINDER,
        {},
        [
          "We Miss You at LibraryView!",
          "Explore Books on LibraryView",
        ],
      ],
      [
        EmailTemplate.CHECK_IN_REMINDER,
        {},
        [
          "Don't Forget to Check In at LibraryView",
          "Log in to LibraryView",
        ],
      ],
      [
        EmailTemplate.MILESTONE_CONGRATS,
        {},
        [
          "Congratulations on Reaching a New Milestone!",
          "Discover New Reads",
        ],
      ],
    ];

    it.each(scenarios)(
      "renders the %s template with the expected content",
      (template, overrides, snippets) => {
        const html = emailTemplates[template]({
          ...baseData,
          ...overrides,
        } as TemplateData);

        expect(html.startsWith("<!DOCTYPE html>")).toBe(true);
        snippets.forEach((text) => {
          expect(html).toContain(text);
        });
        expect(html).not.toContain("undefined");
      }
    );

    it("omits detail rows for empty values in borrow confirmation", () => {
      const html = emailTemplates[EmailTemplate.BORROW_CONFIRMATION]({
        ...baseData,
        dueDate: "",
      } as TemplateData);

      expect(html).toContain("Borrowed On");
      expect(html).not.toContain("Due Date");
    });
  });
});
