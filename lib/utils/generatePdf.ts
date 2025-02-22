"use server";

import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

import { uploadToS3 } from "./awsS3";
import { emailTemplates } from "../emailTemplates";

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
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
  });

  const page = await browser.newPage();
  await page.setContent(emailTemplates.RECEIPT(data), {
    waitUntil: "networkidle0",
  });

  const pdfBytes = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
  });

  await browser.close();

  const fileName = `receipts/receipt_${Date.now()}.pdf`;

  const pdfUrl = await uploadToS3(
    Buffer.from(pdfBytes),
    fileName,
    "application/pdf"
  );

  return pdfUrl;
};
