import { EmailTemplate } from "@/constants";
import { baseStyles, receiptStyles } from "@/styles/emailStyles";

type TemplateData = {
  studentName: string;
  [key: string]: string | number | null | undefined;
};

export const emailTemplates = {
  [EmailTemplate.WELCOME]: (data: TemplateData) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  ${baseStyles}
</head>
<body>
  <div class="container">
    <div class="logo">
      <span class="logo-icon">📖</span>
      <span class="logo-title">LibraryView</span>
    </div>
    
    <h1 class="title">Welcome to LibraryView, Your Reading Companion!</h1>
    
    <p class="text">Hi ${data.studentName},</p>
    
    <p class="text">
      Welcome to LibraryView! We're excited to have you join our community of book enthusiasts. 
      Explore a wide range of books, borrow with ease, and manage your reading journey seamlessly.
    </p>
    
    <p class="text">Get started by logging in to your account:</p>
    
    <a href="${data.loginUrl}" class="button">Log in to LibraryView</a>
    
    <div class="footer">
      <p>Happy reading,</p>
      <p>The LibraryView Team</p>
    </div>
  </div>
</body>
</html>
  `,

  [EmailTemplate.APPROVAL]: (data: TemplateData) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  ${baseStyles}
</head>
<body>
  <div class="container">
    <div class="logo">
      <span class="logo-icon">📖</span>
      <span class="logo-title">LibraryView</span>
    </div>
    
    <h1 class="title">Your LibraryView Account Has Been Approved!</h1>
    
    <p class="text">Hi ${data.studentName},</p>
    
    <p class="text">
      Congratulations! Your LibraryView account has been approved. You can now browse our library, 
      borrow books, and enjoy all the features of your new account.
    </p>
    
    <p class="text">Log in to get started:</p>
    
    <a href="${data.loginUrl}" class="button">Log in to LibraryView</a>
    
    <div class="footer">
      <p>Welcome aboard,</p>
      <p>The LibraryView Team</p>
    </div>
  </div>
</body>
</html>
  `,

  [EmailTemplate.REJECTION]: (data: TemplateData) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  ${baseStyles}
</head>
<body>
  <div class="container">
    <div class="logo">
      <span class="logo-icon">📖</span>
      <span class="logo-title">LibraryView</span>
    </div>
    
    <h1 class="title">Account Application Rejected</h1>
    
    <p class="text">Hi ${data.studentName},</p>
    
    <p class="text">
      We regret to inform you that your LibraryView account application has been rejected. 
      If you believe this is a mistake or need further clarification, please contact our 
      administration team for assistance.
    </p>
    
    <p class="text">You can reach out to us:</p>
    <p class="text">Email: <a class="detail-value" href="mailto:${data.supportEmail}">${data.supportEmail}</a></p>
    <p class="text">Telephone: <a class="detail-value" href="tel:123-456-7890">+123-456-7890</a></p>
    
    <div class="footer">
      <p>Thank you for your understanding,</p>
      <p>The LibraryView Team</p>
    </div>
  </div>
</body>
</html>
  `,

  [EmailTemplate.BORROW_CONFIRMATION]: (data: TemplateData) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  ${baseStyles}
</head>
<body>
  <div class="container">
    <div class="logo">
      <span class="logo-icon">📖</span>
      <span class="logo-title">LibraryView</span>
    </div>
    
    <h1 class="title">You've Borrowed a Book!</h1>
    
    <p class="text">Hi ${data.studentName},</p>
    
    <p class="text">You've successfully borrowed ${data.bookTitle}. Here are the details:</p>
    
    <div class="details">
      <p class="details-item">Borrowed On: <span class="detail-value">${data.borrowDate}</span> </p>
      <p class="details-item">Due Date: <span class="detail-value">${data.dueDate}</span></p>
    </div>
    
    <p class="text">Enjoy your reading, and don't forget to return the book on time!</p>
    
    <a href="${data.borrowedBooksUrl}" class="button">View Borrowed Books</a>
    
    <div class="footer">
      <p>Happy reading,</p>
      <p>The LibraryView Team</p>
    </div>
  </div>
</body>
</html>
  `,

  [EmailTemplate.DUE_REMINDER]: (data: TemplateData) => `
    <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  ${baseStyles}
</head>
<body>
  <div class="container">
    <div class="logo">
      <span class="logo-icon">📖</span>
      <span class="logo-title">LibraryView</span>
    </div>
    
    <h1 class="title">Reminder: ${data.bookTitle} is Due Soon!</h1>
    
    <p class="text">Hi ${data.studentName},</p>
    
    <p class="text">
      Just a reminder that ${data.bookTitle} is due for return on ${data.dueDate}.
      Kindly return it on time to avoid late fees.
    </p>
    ${
      data.renewUrl &&
      `<p class="text">If you're still reading, you can renew the book in your account.</p>
    <a href="${data.renewUrl}" class="button">Renew Book Now</a>`
    }
    <div class="footer">
      <p>Keep reading,</p>
      <p>The LibraryView Team</p>
    </div>
  </div>
</body>
</html>
  `,

  [EmailTemplate.RETURN_CONFIRMATION]: (data: TemplateData) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  ${baseStyles}
</head>
<body>
  <div class="container">
    <div class="logo">
      <span class="logo-icon">📖</span>
      <span class="logo-title">LibraryView</span>
    </div>
    
    <h1 class="title">Thank You for Returning ${data.bookTitle}!</h1>
    
    <p class="text">Hi ${data.studentName},</p>
    
    <p class="text">
      We've successfully received your return of ${data.bookTitle}. Thank you for returning it on time.
    </p>
    
    <p class="text">Looking for your next read? Browse our collection and borrow your next favorite book!</p>
    
    <a href="${data.exploreUrl}" class="button">Explore New Books</a>
    
    <div class="footer">
      <p>Happy exploring,</p>
      <p>The LibraryView Team</p>
    </div>
  </div>
</body>
</html>
  `,

  [EmailTemplate.INACTIVITY_REMINDER]: (data: TemplateData) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  ${baseStyles}
</head>
<body>
  <div class="container">
    <div class="logo">
      <span class="logo-icon">📖</span>
      <span class="logo-title">LibraryView</span>
    </div>
    
    <h1 class="title">We Miss You at LibraryView!</h1>
    
    <p class="text">Hi ${data.studentName},</p>
    
    <p class="text">
      It's been a while since we last saw you—over three days, to be exact! 
      New books are waiting for you, and your next great read might just be a click away.
    </p>
    
    <p class="text">Come back and explore now:</p>
    
    <a href="${data.exploreUrl}" class="button">Explore Books on LibraryView</a>
    
    <div class="footer">
      <p>See you soon,</p>
      <p>The LibraryView Team</p>
    </div>
  </div>
</body>
</html>
  `,

  [EmailTemplate.CHECK_IN_REMINDER]: (data: TemplateData) => `
    <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  ${baseStyles}
</head>
<body>
  <div class="container">
    <div class="logo">
      <span class="logo-icon">📖</span>
      <span class="logo-title">LibraryView</span>
    </div>
    
    <h1 class="title">Don't Forget to Check In at LibraryView</h1>
    
    <p class="text">Hi ${data.studentName},</p>
    
    <p class="text">
      We noticed you haven't checked in recently. Stay active and keep track of your 
      borrowed books, due dates, and new arrivals.
    </p>
    
    <p class="text">Log in now to stay on top of your reading:</p>
    
    <a href="${data.loginUrl}" class="button">Log in to LibraryView</a>
    
    <div class="footer">
      <p>Keep the pages turning,</p>
      <p>The LibraryView Team</p>
    </div>
  </div>
</body>
</html>
  `,

  [EmailTemplate.MILESTONE_CONGRATS]: (data: TemplateData) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  ${baseStyles}
</head>
<body>
  <div class="container">
    <div class="logo">
      <span class="logo-icon">📖</span>
      <span class="logo-title">LibraryView</span>
    </div>
    
    <h1 class="title">Congratulations on Reaching a New Milestone!</h1>
    
    <p class="text">Hi ${data.studentName},</p>
    
    <p class="text">
      Great news! You've reached a new milestone in your reading journey with LibraryView. ⭐ 
      Whether it's finishing a challenging book, staying consistent with your reading goals, 
      or exploring new genres, your dedication inspires us.
    </p>
    
    <p class="text">
      Keep the momentum going—there are more exciting books and features waiting for you!
    </p>
    
    <p class="text">Log in now to discover your next adventure:</p>
    
    <a href="${data.discoverUrl}" class="button">Discover New Reads</a>
    
    <div class="footer">
      <p>Keep the pages turning,</p>
      <p>The LibraryView Team</p>
    </div>
  </div>
</body>
</html>
  `,

  [EmailTemplate.RECEIPT_GENERATED]: (data: TemplateData) => `
   <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  ${baseStyles}
</head>
<body>
  <div class="container">
    <div class="logo">
      <span class="logo-icon">📖</span>
      <span class="logo-title">LibraryView</span>
    </div>
    
    <h1 class="title">Your Receipt for ${data.bookTitle} is Ready!</h1>
    
    <p class="text">Hi ${data.studentName},</p>
    
    <p class="text">Your receipt for borrowing ${data.bookTitle} has been generated. Here are the details:</p>
    
    <div class="details">
      <p class="details-item">Borrowed On: <span class="detail-value">${data.borrowDate}</span></p>
      <p class="details-item">Due Date: <span class="detail-value">${data.dueDate}</span></p>
    </div>
    
    <p class="text">You can download the receipt here:</p>
    
    <a target="_blank" href="${data.downloadUrl}" class="button">Download Receipt</a>
    
    <div class="footer">
      <p>Keep the pages turning,</p>
      <p>The LibraryView Team</p>
    </div>
  </div>
</body>
</html>
  `,
  [EmailTemplate.RECEIPT]: (data: TemplateData) => `
  <!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
${receiptStyles}
</head>
<body>
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
                <div class="detail-card">
                    <p class="detail-label">Title</p>
                    <p class="detail-value">${data.bookTitle}</p>
                </div>
                
                <div class="detail-card">
                    <p class="detail-label">Author</p>
                    <p class="detail-value">${data.bookAuthor}</p>
                </div>
                
                <div class="detail-card">
                    <p class="detail-label">Genre</p>
                    <p class="detail-value">${data.bookGenre}</p>
                </div>
                
                <div class="detail-card">
                    <p class="detail-label">Borrowed on</p>
                    <p class="detail-value">${data.borrowDate}</p>
                </div>
                
                <div class="detail-card">
                    <p class="detail-label">Due Date</p>
                    <p class="detail-value">${data.dueDate}</p>
                </div>
                
                <div class="detail-card">
                    <p class="detail-label">Duration</p>
                    <p class="detail-value">${data.duration} Days</p>
                </div>
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
            <p>Website: <a href=" ${data.websiteUrl}"> ${data.websiteUrl}</a></p>
            <p>Email: <a href="mailto:${data.supportEmail}">${data.supportEmail}</a></p>
        </footer>
       
        </div>
    </div>
</body>
</html>

  `,
};
