import nodemailer from "nodemailer";
import { emailTemplates } from "./emailTemplates";
import { EmailTemplate } from "@/constants";
import config from "./config";

type EmailOptions = {
  to: string;
  subject: string;
  template: EmailTemplate;
  data: TemplateData;
};

type TemplateData = {
  studentName: string;
  [key: string]: string | number | undefined;
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.env.email.GMAIL_USER,
    pass: config.env.email.GMAIL_PASSWORD,
  },
});

export const sendEmail = async (options: EmailOptions) => {
  const html = generateTemplate(options.template, options.data);
  return await transporter.sendMail({
    from: `LibraryView <${config.env.email.GMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    html,
  });
};

const generateTemplate = (
  template: EmailTemplate,
  data: TemplateData
): string => {
  const templateGenerator = emailTemplates[template];
  if (!templateGenerator) {
    throw new Error(`Template ${template} not found`);
  }
  return templateGenerator(data);
};
