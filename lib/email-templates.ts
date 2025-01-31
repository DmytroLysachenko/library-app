import { EmailTemplate } from "@/constants";

type TemplateData = {
  studentName: string;
  [key: string]: string | number | null | undefined;
};

const baseStyles = `
  <style>
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      font-family: 'Arial', sans-serif; 
      background-color: #ffffff; 
      padding: 20px; 
      border-radius: 8px; 
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
    }
    .email-header {
      text-align: center;
      padding: 20px 0;
    }
    .email-header img {
      max-width: 150px;
      height: auto;
    }
    .email-header h1 {
      margin: 10px 0 0;
      font-size: 24px;
      color: #333333;
    }
    .horizontal-line {
      border: 0;
      height: 1px;
      background: #dddddd;
      margin: 20px 0;
    }
    .heading { 
      color: #2B6CB0; 
      font-size: 28px; 
      font-weight: bold; 
      margin-bottom: 20px; 
      text-align: center; 
    }
    .button { 
      background: #2B6CB0; 
      color: white !important; 
      padding: 12px 24px; 
      text-decoration: none; 
      border-radius: 4px; 
      display: inline-block; 
      margin: 20px 0; 
      font-size: 16px; 
      text-align: center; 
      transition: background-color 0.3s ease; 
    }
    .button:hover { 
      background-color: #1E4E8C;
    }
    .details { 
      background: #F7FAFC; 
      padding: 20px; 
      border-radius: 8px; 
      margin: 15px 0; 
      font-size: 14px; 
      color: #4A5568; 
    }
    .footer { 
      color: #718096; 
      font-size: 14px; 
      margin-top: 30px; 
      text-align: center; 
    }
    p { 
      font-size: 16px; 
      line-height: 1.5; 
      color: #4A5568; 
      margin: 10px 0; 
    }
    .receipt-table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 20px 0; 
    }
    .receipt-table td { 
      padding: 12px; 
      border-bottom: 1px solid #E2E8F0; 
      font-size: 14px; 
    }
    .receipt-heading { 
      font-size: 18px; 
      font-weight: bold; 
      margin: 15px 0; 
      color: #2B6CB0; 
    }
    body {
      padding: 10px 20px;
    }
    a { 
      color: #2B6CB0; 
      text-decoration: none; 
    }
    a:hover { 
      text-decoration: underline; 
    }
  </style>
`;

const logoHeader = `
<div class="email-header">
<svg width="37" height="37" viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="37" height="37" rx="18.5" transform="matrix(-1 0 0 1 37 0)" fill="#25388C"/>
          <path opacity="0.5" d="M18.5001 14.9322V27.9482C24.3804 24.7107 29.3358 26.825 30.3929 28.0143V14.9322C26.2304 12.5536 19.5792 12.928 18.5001 14.9322Z" fill="#DBE5FF"/>
          <path d="M18.5001 14.9322V27.9483C22.2661 23.059 27.0233 24.2483 28.5429 24.5126V11.5626C25.0411 10.4394 19.5792 12.9281 18.5001 14.9322Z" fill="#F0F4FF"/>
          <path d="M18.5001 14.7833V27.7501C20.5272 23.0768 25.8892 22.616 26.9572 22.6819V8.99098C24.4462 8.83301 19.0232 12.3479 18.5001 14.7833Z" fill="url(#paint0_linear_5530_108401)"/>
          <path opacity="0.5" d="M18.5001 14.9322V27.9482C12.6197 24.7107 7.66435 26.825 6.60721 28.0143V14.9322C10.7697 12.5536 17.4209 12.928 18.5001 14.9322Z" fill="#DBE5FF"/>
          <path d="M18.5001 14.9322V27.9483C14.734 23.059 9.97685 24.2483 8.4572 24.5126V11.5626C11.959 10.4394 17.4209 12.9281 18.5001 14.9322Z" fill="#F0F4FF"/>
          <path d="M18.5001 14.7833V27.7501C16.473 23.0768 11.111 22.616 10.0429 22.6819V8.99098C12.5539 8.83301 17.9769 12.3479 18.5001 14.7833Z" fill="url(#paint1_linear_5530_108401)"/>
          <defs>
            <linearGradient id="paint0_linear_5530_108401" x1="18.5001" y1="20.1519" x2="26.9572" y2="20.1519" gradientUnits="userSpaceOnUse">
              <stop stop-color="#FAFBFF" stop-opacity="0.49"/>
              <stop offset="1" stop-color="#FAFBFF"/>
            </linearGradient>
            <linearGradient id="paint1_linear_5530_108401" x1="18.5001" y1="20.1519" x2="10.0429" y2="20.1519" gradientUnits="userSpaceOnUse">
              <stop stop-color="#FAFBFF" stop-opacity="0.49"/>
              <stop offset="1" stop-color="#FAFBFF"/>
            </linearGradient>
          </defs>
        </svg>
    <h1 class="heading">LibraryView</h1>
    <hr class="horizontal-line">
  </div>
`;

export const emailTemplates = {
  [EmailTemplate.WELCOME]: (data: TemplateData) => `
    <!DOCTYPE html>
    <html>
      <head>${baseStyles}</head>
      <body>
        <div class="container">
          ${logoHeader}
          <h2 class="heading">Welcome to LibraryView!</h2>
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
          ${logoHeader}
          <h2 class="heading">Account Approved!</h2>
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

  [EmailTemplate.REJECTION]: (data: TemplateData) => `
    <!DOCTYPE html>
    <html>
      <head>${baseStyles}</head>
      <body>
        <div class="container">
          ${logoHeader}
          <h2 class="heading">Account Application Rejected</h2>
          <p>Hi, ${data.studentName},</p>
          <p>We regret to inform you that your LibraryView account application has been rejected. If you believe this is a mistake or need further clarification, please contact our administration team for assistance.</p>
          <p>You can reach out to us at <a href="mailto:admin@libraryview.com">admin@libraryview.com</a> or call us at +1-234-567-8900.</p>
          <div class="footer">
            <p>Thank you for your understanding,<br>The LibraryView Team</p>
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
          ${logoHeader}
          <h2 class="heading">You've Borrowed a Book!</h2>
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
          ${logoHeader}
          <h2 class="heading">Reminder: ${data.bookTitle} is Due Soon!</h2>
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
          ${logoHeader}
          <h2 class="heading">Thank You for Returning ${data.bookTitle}!</h2>
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
          ${logoHeader}
          <h2 class="heading">We Miss You at LibraryView!</h2>
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
          ${logoHeader}
          <h2 class="heading">Don't Forget to Check In at LibraryView!</h2>
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
          ${logoHeader}
          <h2 class="heading">Congratulations on Your Milestone!</h2>
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
          .receipt-heading { font-size: 18px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          ${logoHeader}
          <h2 class="heading">Your Receipt for ${data.bookTitle}</h2>
          <p>Hi, ${data.studentName},</p>
          <div class="details">
            <div class="receipt-heading">Borrow Receipt</div>
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
