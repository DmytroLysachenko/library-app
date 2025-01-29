import { EmailTemplate } from "@/constants";

type TemplateData = {
  studentName: string;
  [key: string]: string | number | null | undefined;
};

const baseStyles = `
  <style>
    .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
    .header { color: #2B6CB0; font-size: 24px; margin-bottom: 20px; }
    .button { 
      background: #2B6CB0; 
      color: white; 
      padding: 12px 24px; 
      text-decoration: none; 
      border-radius: 4px; 
      display: inline-block; 
      margin: 20px 0; 
    }
    .details { background: #F7FAFC; padding: 20px; border-radius: 8px; margin: 15px 0; }
    .footer { color: #718096; font-size: 14px; margin-top: 30px; }
  </style>
`;

export const emailTemplates = {
  [EmailTemplate.WELCOME]: (data: TemplateData) => `
    <!DOCTYPE html>
    <html>
      <head>${baseStyles}</head>
      <body>
        <div class="container">
          <h1 class="header">Welcome to LibraryView!</h1>
          <p>Hi, ${data.studentName},</p>
          <p>We're excited to have you join our community of book enthusiasts. Explore a wide range of books, borrow with ease, and manage your reading journey seamlessly.</p>
          ${data.loginUrl ? `<a href="${data.loginUrl}" class="button">Get Started</a>` : ""}
          <div class="footer">
            <p>Happy reading,<br>The LibraryView Team</p>
          </div>
        </div>
      </body>
    </html>
  `,

  [EmailTemplate.APPROVAL]: (data: TemplateData) => `
    <!DOCTYPE html>
    <html>
      <head>${baseStyles}</head>
      <body>
        <div class="container">
          <h1 class="header">Account Approved!</h1>
          <p>Hi, ${data.studentName},</p>
          <p>Congratulations! Your LibraryView account has been approved. You can now browse our library, borrow books, and enjoy all the features of your new account.</p>
          ${data.loginUrl ? `<a href="${data.loginUrl}" class="button">Log In Now</a>` : ""}
          <div class="footer">
            <p>Welcome ahead,<br>The LibraryView Team</p>
          </div>
        </div>
      </body>
    </html>
  `,

  [EmailTemplate.BORROW_CONFIRMATION]: (data: TemplateData) => `
    <!DOCTYPE html>
    <html>
      <head>${baseStyles}</head>
      <body>
        <div class="container">
          <h1 class="header">You've Borrowed a Book!</h1>
          <p>Hi, ${data.studentName},</p>
          <div class="details">
            <p><strong>Title:</strong> ${data.bookTitle}</p>
            <p><strong>Borrowed On:</strong> ${data.borrowDate}</p>
            <p><strong>Due Date:</strong> ${data.dueDate}</p>
          </div>
          ${data.borrowedBooksUrl ? `<a href="${data.borrowedBooksUrl}" class="button">View Borrowed Books</a>` : ""}
          <div class="footer">
            <p>Happy reading,<br>The LibraryView Team</p>
          </div>
        </div>
      </body>
    </html>
  `,

  [EmailTemplate.DUE_REMINDER]: (data: TemplateData) => `
    <!DOCTYPE html>
    <html>
      <head>${baseStyles}</head>
      <body>
        <div class="container">
          <h1 class="header">Reminder: ${data.bookTitle} is Due Soon!</h1>
          <p>Hi, ${data.studentName},</p>
          <p>Just a reminder that ${data.bookTitle} is due for return on ${data.dueDate}.</p>
          <div class="details">
            <p>Kindly return it on time to avoid late fees.</p>
            ${data.renewUrl ? `<p>Still reading? <a href="${data.renewUrl}">Renew the book</a></p>` : ""}
          </div>
          <div class="footer">
            <p>Keep reading,<br>The LibraryView Team</p>
          </div>
        </div>
      </body>
    </html>
  `,

  [EmailTemplate.RETURN_CONFIRMATION]: (data: TemplateData) => `
    <!DOCTYPE html>
    <html>
      <head>${baseStyles}</head>
      <body>
        <div class="container">
          <h1 class="header">Thank You for Returning ${data.bookTitle}!</h1>
          <p>Hi, ${data.studentName},</p>
          <p>We've successfully received your return of ${data.bookTitle}. Thank you for returning it on time.</p>
          ${data.exploreUrl ? `<a href="${data.exploreUrl}" class="button">Explore New Books</a>` : ""}
          <div class="footer">
            <p>Happy exploring,<br>The LibraryView Team</p>
          </div>
        </div>
      </body>
    </html>
  `,

  [EmailTemplate.INACTIVITY_REMINDER]: (data: TemplateData) => `
    <!DOCTYPE html>
    <html>
      <head>${baseStyles}</head>
      <body>
        <div class="container">
          <h1 class="header">We Miss You at LibraryView!</h1>
          <p>Hi, ${data.studentName},</p>
          <p>It's been a while since we last saw you - over three days, to be exact! New books are waiting for you, and your next great read might just be a click away.</p>
          ${data.exploreUrl ? `<a href="${data.exploreUrl}" class="button">Explore Books</a>` : ""}
          <div class="footer">
            <p>See you soon,<br>The LibraryView Team</p>
          </div>
        </div>
      </body>
    </html>
  `,
  [EmailTemplate.CHECK_IN_REMINDER]: (data: TemplateData) => `
  <!DOCTYPE html>
  <html>
    <head>${baseStyles}</head>
    <body>
      <div class="container">
        <h1 class="header">Don't Forget to Check In at LibraryView!</h1>
        <p>Hi, ${data.studentName},</p>
        <p>We noticed you haven't checked in recently. Stay active and keep track of your borrowed books, due dates, and new arrivals.</p>
        ${data.loginUrl ? `<a href="${data.loginUrl}" class="button">Log In Now</a>` : ""}
        <div class="footer">
          <p>Keep the pages turning,<br>The LibraryView Team</p>
        </div>
      </div>
    </body>
  </html>
`,

  [EmailTemplate.MILESTONE_CONGRATS]: (data: TemplateData) => `
    <!DOCTYPE html>
    <html>
      <head>${baseStyles}</head>
      <body>
        <div class="container">
          <h1 class="header">Congratulations on Your Milestone!</h1>
          <p>Hi, ${data.studentName},</p>
          <p>Great news! You've reached a new milestone in your reading journey. Whether it's finishing a challenging book, staying consistent with your goals, or exploring new genres, your dedication inspires us.</p>
          ${data.discoverUrl ? `<a href="${data.discoverUrl}" class="button">Discover New Reads</a>` : ""}
          <div class="footer">
            <p>Keep the pages turning,<br>The LibraryView Team</p>
          </div>
        </div>
      </body>
    </html>
  `,

  [EmailTemplate.RECEIPT_GENERATED]: (data: TemplateData) => `
    <!DOCTYPE html>
    <html>
      <head>
        ${baseStyles}
        <style>
          .receipt-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .receipt-table td { padding: 8px; border-bottom: 1px solid #E2E8F0; }
          .receipt-header { font-size: 18px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="header">Your Receipt for ${data.bookTitle}</h1>
          <p>Hi, ${data.studentName},</p>
          <div class="details">
            <div class="receipt-header">Borrow Receipt</div>
            <table class="receipt-table">
              <tr><td>Receipt ID:</td><td>${data.receiptId}</td></tr>
              <tr><td>Date Issued:</td><td>${data.issuedDate}</td></tr>
              <tr><td>Title:</td><td>${data.bookTitle}</td></tr>
              <tr><td>Author:</td><td>${data.bookAuthor}</td></tr>
              <tr><td>Genre:</td><td>${data.bookGenre}</td></tr>
              <tr><td>Borrowed On:</td><td>${data.borrowDate}</td></tr>
              <tr><td>Due Date:</td><td>${data.dueDate}</td></tr>
              <tr><td>Duration:</td><td>${data.durationDays} days</td></tr>
            </table>
          </div>
          ${data.downloadUrl ? `<a href="${data.downloadUrl}" class="button">Download Receipt</a>` : ""}
          <div class="footer">
            <p>Website: ${data.websiteUrl}<br>Email: ${data.supportEmail}</p>
          </div>
        </div>
      </body>
    </html>
  `,
};
