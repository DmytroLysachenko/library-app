import { EmailTemplate } from "@/constants";
import { baseStyles, receiptStyles } from "@/styles/emailStyles";
import { TemplateData } from "./email";

/* ---------- Reusable HTML helpers ---------- */

const Doc = (styles: string, body: string) =>
  `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  ${styles}
</head>
<body>${body}</body>
</html>`.trim();

const Container = (inner: string) =>
  `
  <div class="container">
    ${Logo}
    ${inner}
  </div>
`.trim();

const Logo = `
  <div class="logo">
    <span class="logo-icon">📖</span>
    <span class="logo-title">LibraryView</span>
  </div>
`.trim();

const Title = (t: string) => `<h1 class="title">${t}</h1>`;
const P = (t: string) => `<p class="text">${t}</p>`;
const Button = (href: string, text: string, extra: string = "") =>
  `<a href="${href}" class="button"${extra}>${text}</a>`;

const Footer = (line1: string, line2 = "The LibraryView Team") =>
  `
  <div class="footer">
    <p>${line1}</p>
    <p>${line2}</p>
  </div>
`.trim();

const Details = (
  rows: Array<[label: string, value: string | number | null | undefined]>
) =>
  `
  <div class="details">
    ${rows
      .filter(([, v]) => v !== null && v !== undefined && `${v}`.length > 0)
      .map(
        ([label, value]) =>
          `<p class="details-item">${label}: <span class="detail-value">${value}</span></p>`
      )
      .join("")}
  </div>
`.trim();

const Greeting = (name: string) => P(`Hi ${name},`);

/* ---------- Common “page” builder for base emails ---------- */

const Page = (title: string, bodyHtml: string) =>
  Doc(baseStyles, Container(`${Title(title)}${bodyHtml}`));

/* ---------- EMAILS ---------- */

export const emailTemplates = {
  [EmailTemplate.WELCOME]: (data: TemplateData) =>
    Page(
      "Welcome to LibraryView, Your Reading Companion!",
      [
        Greeting(data.studentName || "User"),
        P(
          `Welcome to LibraryView! We're excited to have you join our community of book enthusiasts. 
           Explore a wide range of books, borrow with ease, and manage your reading journey seamlessly.`
        ),
        P("Get started by logging in to your account:"),
        Button(String(data.loginUrl), "Log in to LibraryView"),
        Footer("Happy reading,"),
      ].join("")
    ),

  [EmailTemplate.APPROVAL]: (data: TemplateData) =>
    Page(
      "Your LibraryView Account Has Been Approved!",
      [
        Greeting(data.studentName || "User"),
        P(
          `Congratulations! Your LibraryView account has been approved. You can now browse our library, 
           borrow books, and enjoy all the features of your new account.`
        ),
        P("Log in to get started:"),
        Button(String(data.loginUrl), "Log in to LibraryView"),
        Footer("Welcome aboard,"),
      ].join("")
    ),

  [EmailTemplate.REJECTION]: (data: TemplateData) =>
    Page(
      "Account Application Rejected",
      [
        Greeting(data.studentName || "User"),
        P(
          `We regret to inform you that your LibraryView account application has been rejected. 
           If you believe this is a mistake or need further clarification, please contact our 
           administration team for assistance.`
        ),
        P("You can reach out to us:"),
        P(
          `Email: <a class="detail-value" href="mailto:${data.supportEmail}">${data.supportEmail}</a>`
        ),
        P(
          `Telephone: <a class="detail-value" href="tel:123-456-7890">+123-456-7890</a>`
        ),
        Footer("Thank you for your understanding,"),
      ].join("")
    ),

  [EmailTemplate.BORROW_CONFIRMATION]: (data: TemplateData) =>
    Page(
      "You've Borrowed a Book!",
      [
        Greeting(data.studentName || "User"),
        P(
          `You've successfully borrowed ${data.bookTitle}. Here are the details:`
        ),
        Details([
          ["Borrowed On", String(data.borrowDate)],
          ["Due Date", String(data.dueDate)],
        ]),
        P("Enjoy your reading, and don't forget to return the book on time!"),
        Button(String(data.borrowedBooksUrl), "View Borrowed Books"),
        Footer("Happy reading,"),
      ].join("")
    ),

  [EmailTemplate.DUE_REMINDER]: (data: TemplateData) =>
    Page(
      `Reminder: ${data.bookTitle} is Due Soon!`,
      [
        Greeting(data.studentName || "User"),
        P(
          `Just a reminder that ${data.bookTitle} is due for return on ${data.dueDate}.
           Kindly return it on time to avoid late fees.`
        ),
        data.renewUrl
          ? [
              P(
                `If you're still reading, you can renew the book in your account.`
              ),
              Button(String(data.renewUrl), "Renew Book Now"),
            ].join("")
          : "",
        Footer("Keep reading,"),
      ].join("")
    ),

  [EmailTemplate.RETURN_CONFIRMATION]: (data: TemplateData) =>
    Page(
      `Thank You for Returning ${data.bookTitle}!`,
      [
        Greeting(data.studentName || "User"),
        P(
          `We've successfully received your return of ${data.bookTitle}. Thank you for returning it on time.`
        ),
        P(
          `Looking for your next read? Browse our collection and borrow your next favorite book!`
        ),
        Button(String(data.exploreUrl), "Explore New Books"),
        Footer("Happy exploring,"),
      ].join("")
    ),

  [EmailTemplate.INACTIVITY_REMINDER]: (data: TemplateData) =>
    Page(
      "We Miss You at LibraryView!",
      [
        Greeting(data.studentName || "User"),
        P(
          `It's been a while since we last saw you—over three days, to be exact! 
           New books are waiting for you, and your next great read might just be a click away.`
        ),
        P("Come back and explore now:"),
        Button(String(data.exploreUrl), "Explore Books on LibraryView"),
        Footer("See you soon,"),
      ].join("")
    ),

  [EmailTemplate.CHECK_IN_REMINDER]: (data: TemplateData) =>
    Page(
      "Don't Forget to Check In at LibraryView",
      [
        Greeting(data.studentName || "User"),
        P(
          `We noticed you haven't checked in recently. Stay active and keep track of your 
           borrowed books, due dates, and new arrivals.`
        ),
        P("Log in now to stay on top of your reading:"),
        Button(String(data.loginUrl), "Log in to LibraryView"),
        Footer("Keep the pages turning,"),
      ].join("")
    ),

  [EmailTemplate.MILESTONE_CONGRATS]: (data: TemplateData) =>
    Page(
      "Congratulations on Reaching a New Milestone!",
      [
        Greeting(data.studentName || "User"),
        P(
          `Great news! You've reached a new milestone in your reading journey with LibraryView. ⭐ 
           Whether it's finishing a challenging book, staying consistent with your reading goals, 
           or exploring new genres, your dedication inspires us.`
        ),
        P(
          `Keep the momentum going—there are more exciting books and features waiting for you!`
        ),
        P("Log in now to discover your next adventure:"),
        Button(String(data.discoverUrl), "Discover New Reads"),
        Footer("Keep the pages turning,"),
      ].join("")
    ),

  [EmailTemplate.RECEIPT_GENERATED]: (data: TemplateData) =>
    Page(
      `Your Receipt for ${data.bookTitle} is Ready!`,
      [
        Greeting(data.studentName || "User"),
        P(
          `Your receipt for borrowing ${data.bookTitle} has been generated. Here are the details:`
        ),
        Details([
          ["Borrowed On", String(data.borrowDate)],
          ["Due Date", String(data.dueDate)],
        ]),
        P("You can download the receipt here:"),
        Button(
          String(data.downloadUrl),
          "Download Receipt",
          ' target="_blank"'
        ),
        Footer("Keep the pages turning,"),
      ].join("")
    ),

  /* ---------- RECEIPT (separate layout/styles) ---------- */

  [EmailTemplate.RECEIPT]: (data: TemplateData) =>
    Doc(
      receiptStyles,
      `
    <div class="receipt-container">
      <header class="header">
        <div class="brand">
          <span class="brand-icon">📖</span>
          <h1 class="brand-name">LibraryView</h1>
        </div>
        <h2 class="receipt-title">Borrow Receipt</h2>
        <div class="receipt-info">
          <p>Receipt ID: <span class="detail-value">${data.receiptId}</span></p>
          <p>Date Issued: <span class="detail-value">${data.issueDate}</span></p>
        </div>
      </header>

      <section class="section">
        <h3 class="section-title">Book Details:</h3>
        <div class="book-details">
          ${[
            ["Title", data.bookTitle],
            ["Author", data.bookAuthor],
            ["Genre", data.bookGenre],
            ["Borrowed on", data.borrowDate],
            ["Due Date", data.dueDate],
            ["Duration", data.duration ? `${data.duration} Days` : ""],
          ]
            .map(
              ([label, value]) => `
            <div class="detail-card">
              <p class="detail-label">${label}</p>
              <p class="detail-value">${value ?? ""}</p>
            </div>`
            )
            .join("")}
        </div>
      </section>

      <section class="section terms">
        <h3 class="section-title">Terms</h3>
        <ul class="terms-list">
          <li>Please return the book by the due date.</li>
          <li>Lost or damaged books may incur replacement costs.</li>
        </ul>
      </section>

      <footer class="footer">
        <p>Thank you for using LibraryView!</p>
        <p>Website: <a href="${data.websiteUrl}">${data.websiteUrl}</a></p>
        <p>Email: <a href="mailto:${data.supportEmail}">${data.supportEmail}</a></p>
      </footer>
    </div>
  `.trim()
    ),
};
