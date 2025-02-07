export const baseStyles = `
 <style>
  body {
    margin: 0;
    padding: 20px;
    font-family: system-ui, -apple-system, sans-serif;
    background-color: #1a1a2e;
    color: #ffffff;
  }

  .container {
    max-width: 600px;
    margin: 0 auto;
    padding: 30px;
    background-color: #1a1f2c;
    border-radius: 8px;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 30px;
    font-size: 24px;
    font-weight: bold;
  }

  .logo-title {
      color: #ffffff;
          font-size: 24px;
    font-weight: bold;
  }


  .logo-icon {
    font-size: 24px;
  }

  .title {
    font-size: 24px;
    font-weight: bold;
    margin: 20px 0;
    color: #ffffff;
  }

  .text {
    font-size: 16px;
    line-height: 1.5;
    color: #a0aec0;
    margin: 16px 0;
  }

  .details {
    margin: 20px 0;
  }

  .details-item {
    color: #a0aec0;
    margin: 8px 0;
    padding-left: 16px;
    position: relative;
  }

          .detail-value {
        color: white;
        }

  .details-item::before {
    content: "•";
    position: absolute;
    left: 0;
  }

  .button {
    display: inline-block;
    background-color: #e6d5c3;
    color: #1a1f2c !important;
    padding: 12px 24px;
    border-radius: 4px;
    text-decoration: none;
    font-weight: 500;
    margin: 16px 0;
    font-size: 14px;
  }

  .button:hover {
    background-color: #d4c3b1;
  }

  .footer {
    margin-top: 30px;
    color: #a0aec0;
    font-size: 14px;
  }

  .footer p {
    margin: 4px 0;
    color: #a0aec0
  }

</style>
`;

export const receiptStyles = `
<style>        
body {
            margin: 0;
            padding: 20px;
            font-family: system-ui, -apple-system, sans-serif;
            color: white;
        }

        .receipt-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #22223b;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .header {
            margin-bottom: 30px;
        }

        .brand {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 20px;
        }

        .brand-icon {
            font-size: 24px;
        }

        .brand-name {
            margin: 0;
            font-size: 24px;
            color: white;
        }

        .receipt-title {
            margin: 0 0 20px 0;
            font-size: 20px;
            color: white;
        }

        .receipt-info {
            font-size: 14px;
            color: #a8a8b3;
        }

        .receipt-info p {
            margin: 5px 0;
        }

        .section {
            margin-bottom: 30px;
        }

        .section-title {
            margin: 0 0 15px 0;
            font-size: 16px;
            color: white;
        }

        .book-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }

        .detail-card {
            background-color: #2a2a45;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 10px;
        }

        .detail-label {
            color: #a8a8b3;
            font-size: 12px;
            margin-bottom: 5px;
        }

        .detail-value {
        color: white;
            font-size: 14px;
        }

        .terms {
            padding: 20px;
            background-color: #2a2a45;
            border-radius: 8px;
        }

        .terms-list {
            margin: 0;
            padding-left: 20px;
            color: #a8a8b3;
            font-size: 14px;
        }

        .terms-list li {
            margin-bottom: 8px;
        }

        .footer {
            font-size: 14px;
            color: #a8a8b3;
            border-top: 1px solid #2a2a45;
            padding-top: 20px;
        }

        .footer p {
            margin: 0 0 5px 0;
        }

        .footer a {
            color: #a8a8b3;
        }
            </style>
`;
