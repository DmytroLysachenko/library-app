jest.mock("nodemailer", () => ({
  __esModule: true,
  default: { createTransport: jest.fn() },
}));

jest.mock("@/lib/config", () => jest.requireActual("../mocks/config"));

jest.mock("@/lib/emailTemplates", () => ({
  __esModule: true,
  emailTemplates: {
    WELCOME: jest.fn(),
  },
}));

import nodemailer from "nodemailer";
import type { Transporter, SentMessageInfo, SendMailOptions } from "nodemailer";
import configMock from "@/lib/config";
import { emailTemplates } from "@/lib/emailTemplates";
import { EmailTemplate } from "@/constants";
import type { TemplateData } from "@/lib/email";

const createTransportMock = jest.mocked(nodemailer.createTransport);
const sendMailMock = jest.fn<Promise<SentMessageInfo>, [SendMailOptions]>();
const receiptTemplateMock = jest.mocked(emailTemplates.WELCOME);
const transporterMock = { sendMail: sendMailMock } as unknown as Transporter<SentMessageInfo>;

createTransportMock.mockReturnValue(transporterMock);


let sendEmail: typeof import("@/lib/email").sendEmail;

beforeAll(async () => {
  ({ sendEmail } = await import("@/lib/email"));
});

describe("sendEmail", () => {
  beforeEach(() => {
    receiptTemplateMock.mockReset();
    sendMailMock.mockReset();
    receiptTemplateMock.mockReturnValue("<html>Welcome</html>");
    sendMailMock.mockResolvedValue({
      envelope: { from: "", to: [] },
      accepted: [],
      rejected: [],
      pending: [],
      response: "OK",
      messageId: "abc123",
    } as SentMessageInfo);
    createTransportMock.mockReturnValue(transporterMock);
  });

  it("renders the template and sends the email", async () => {
    const data: TemplateData = {
      studentName: "Ada Lovelace",
    };

    const result = await sendEmail({
      to: "student@example.com",
      subject: "Welcome to LibraryView",
      template: EmailTemplate.WELCOME,
      data,
    });

    expect(receiptTemplateMock).toHaveBeenCalledWith(data);
    const expectedFrom = `LibraryView <${configMock.env.email.GMAIL_USER}>`;
    expect(sendMailMock).toHaveBeenCalledWith({
      from: expectedFrom,
      to: "student@example.com",
      subject: "Welcome to LibraryView",
      html: "<html>Welcome</html>",
    });
    expect(result).toEqual(expect.objectContaining({ messageId: "abc123" }));
  });

  it("throws when the template handler is not found", async () => {
    const data: TemplateData = {
      studentName: "Ada Lovelace",
    };

    await expect(
      sendEmail({
        to: "student@example.com",
        subject: "Missing template",
        template: EmailTemplate.REJECTION,
        data,
      })
    ).rejects.toThrow("Template REJECTION not found");
  });
});



