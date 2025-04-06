import nodemailer from "nodemailer";
import { Order } from "../../types/entityTypes.js";
import dotenv from "dotenv";
dotenv.config();

import {
  getInfoTemplate,
  getOrderCancelledTemplate,
  getOrderDeliveredTemplate,
  getOrderProcessingTemplate,
  getOrderShippedTemplate,
  getOrdderConfirmTemplate,
} from "./Mail-Template.js";

// Define types for the order data

// Email templates
const getSuccessTemplate = (data: {
  message: string;
  image?: string;
  title?: string;
}) => {
  const { message, image, title = "Success!" } = data;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
        }
        .container {
          border: 1px solid #e0e0e0;
          border-radius: 5px;
          padding: 20px;
          margin-top: 20px;
        }
        .header {
          background-color: #4CAF50;
          color: white;
          padding: 10px 20px;
          border-radius: 5px 5px 0 0;
          margin: -20px -20px 20px;
        }
        .content {
          padding: 0 20px;
        }
        .footer {
          margin-top: 30px;
          font-size: 12px;
          color: #777;
          text-align: center;
          border-top: 1px solid #e0e0e0;
          padding-top: 20px;
        }
        img {
          max-width: 100%;
          height: auto;
          margin: 15px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>${title}</h2>
        </div>
        <div class="content">
          ${message.replace(/\n/g, "<br>")}
          ${image ? `<img src="${image}" alt="Success Image">` : ""}
        </div>
        <div class="footer">
          <p>Thank you for using our service!</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const getErrorTemplate = (data: {
  message: string;
  image?: string;
  title?: string;
}) => {
  const { message, image, title = "Error Notification" } = data;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
        }
        .container {
          border: 1px solid #e0e0e0;
          border-radius: 5px;
          padding: 20px;
          margin-top: 20px;
        }
        .header {
          background-color: #f44336;
          color: white;
          padding: 10px 20px;
          border-radius: 5px 5px 0 0;
          margin: -20px -20px 20px;
        }
        .content {
          padding: 0 20px;
        }
        .footer {
          margin-top: 30px;
          font-size: 12px;
          color: #777;
          text-align: center;
          border-top: 1px solid #e0e0e0;
          padding-top: 20px;
        }
        img {
          max-width: 100%;
          height: auto;
          margin: 15px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>${title}</h2>
        </div>
        <div class="content">
          ${message.replace(/\n/g, "<br>")}
          ${image ? `<img src="${image}" alt="Error Image">` : ""}
        </div>
        <div class="footer">
          <p>If you need assistance, please contact support.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export async function sendEmail(data: Order & { type: string }) {
  try {
    const to = data.user.email;
    const subject = "Order Placed";

    // Validate inputs
    if (!to || !subject) {
      return { success: false, error: "Recipient and subject are required" };
    }

    // Create a transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Determine HTML content based on type
    let htmlContent;
    let message;
    console.log(data);
    console.log(data.type);
    if (data.type === "OrderConfirmed") {
      htmlContent = getOrdderConfirmTemplate(data);
      message = "Order Confirmed";
    } else {
      message = "Unknown";
    }
    // if (data.type === data.orderItems[0].status) {
    //   htmlContent = getSuccessTemplate({
    //     message,
    //     image,
    //     title: templateData?.title,
    //   });
    // } else if (type === "error") {
    //   htmlContent = getErrorTemplate({
    //     message,
    //     image,
    //     title: templateData?.title,
    //   });
    // } else if (type === "info") {
    //   htmlContent = getInfoTemplate({
    //     message,
    //     image,
    //     title: templateData?.title,
    //   });
    // } else if (type === "cancelled") {
    //   htmlContent = getOrderCancelledTemplate({
    //     message,
    //     image,
    //     title: templateData?.title,
    //   });
    // }

    // Send email
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject,
      text: message,
      html: htmlContent,
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

// import nodemailer from "nodemailer";
// type EmailData = {
//     to: string;
//     subject: string;
//     message: string;
// };
// export async function sendEmail(data: EmailData) {
//     try {
//         const { to, subject, message } = data;

//         // Validate inputs
//         if (!to || !subject || !message) {
//             return { success: false, error: "All fields are required" };
//         }

//         // Create a transporter
//         const transporter = nodemailer.createTransport({
//             service: "gmail",
//             auth: {
//                 user: process.env.GMAIL_USER,
//                 pass: process.env.GMAIL_APP_PASSWORD,
//             },
//         });

//         // Send email
//         await transporter.sendMail({
//             from: process.env.GMAIL_USER,
//             to,
//             subject,
//             text: message,
//             html: message.replace(/\n/g, "<br>"),
//         });

//         return { success: true };
//     } catch (error) {
//         console.error("Error sending email:", error);
//         return {
//             success: false,
//             error: error instanceof Error ? error.message : "Failed to send email",
//         };
//     }
// }
