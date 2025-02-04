"use server";

import { uploadToS3 } from "./awsS3";

import puppeteer from "puppeteer";
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
  try {
    const browser = await puppeteer.launch({
      headless: true,
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

    const fileName = `receipts/receipt_${Date.now()}.pdf`;

    const pdfUrl = await uploadToS3(
      Buffer.from(pdfBytes),
      fileName,
      "application/pdf"
    );

    return pdfUrl;
  } catch (error) {
    console.log(error);
  }
};
