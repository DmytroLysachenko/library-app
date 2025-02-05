"use server";

import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

import { uploadToS3 } from "./awsS3";
import { emailTemplates } from "../email-templates";

export const generatePdf = async (data: {
  receiptId: string;
  studentName: string;
  bookTitle: string;
  bookAuthor: string;
  bookGenre: string;
  borrowDate: string;
  dueDate: string;
  duration: string | number;
  issueDate: string;
  websiteUrl: string;
  supportEmail: string;
}) => {
  console.log("Launching Puppeteer...");

  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
  });

  console.log("Puppeteer launched successfully.");

  const page = await browser.newPage();
  await page.setContent(emailTemplates.RECEIPT(data), {
    waitUntil: "networkidle0",
  });

  console.log("Generating PDF...");

  const pdfBytes = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
  });

  await browser.close();

  console.log("PDF generated. Uploading to S3...");

  const fileName = `receipts/receipt_${Date.now()}.pdf`;

  const pdfUrl = await uploadToS3(
    Buffer.from(pdfBytes),
    fileName,
    "application/pdf"
  );

  console.log("PDF uploaded to S3:", pdfUrl);

  return pdfUrl;
};
