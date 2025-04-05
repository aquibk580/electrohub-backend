

import nodemailer from "nodemailer"

type EmailData = {
  to: string
  subject: string
  message: string
  type?: string
  image?: string
  templateData?: Record<string, any>
}

// Email templates
const getSuccessTemplate = (data: {
  message: string
  image?: string
  title?: string
}) => {
  const { message, image, title = "Success!" } = data

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
  `
}

const getErrorTemplate = (data: {
  message: string
  image?: string
  title?: string
}) => {
  const { message, image, title = "Error Notification" } = data

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
  `
}

const getInfoTemplate = (data: {
  message: string
  image?: string
  title?: string
}) => {
  const { message, image, title = "Information" } = data
  return `
  <!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Order Confirmed</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #f2f3f8;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }
      .email-container {
        max-width: 600px;
        margin: auto;
        background-color: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        overflow: hidden;
      }
      .header {
        background-color: #4f46e5;
        color: #ffffff;
        padding: 30px 20px;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 24px;
      }
      .section {
        padding: 20px 30px;
        color: #333333;
      }
      .section h2 {
        font-size: 18px;
        margin-bottom: 10px;
      }
      .user-info p,
      .order-info p {
        margin: 4px 0;
        font-size: 14px;
      }
      .product {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
        border-bottom: 1px solid #eee;
        padding-bottom: 10px;
      }
      .product img {
        width: 70px;
        height: 70px;
        border-radius: 8px;
        object-fit: cover;
        margin-right: 15px;
      }
      .product-details {
        flex-grow: 1;
      }
      .product-details h4 {
        margin: 0;
        font-size: 16px;
        color: #111827;
      }
      .product-details p {
        margin: 4px 0;
        font-size: 13px;
        color: #6b7280;
      }
      .total {
        font-size: 18px;
        color: #4f46e5;
        font-weight: bold;
        text-align: right;
        margin-top: 10px;
      }
      .footer {
        text-align: center;
        font-size: 12px;
        color: #888888;
        padding: 20px;
        background-color: #f9fafb;
      }

      @media only screen and (max-width: 600px) {
        .section {
          padding: 15px;
        }
        .product {
          flex-direction: column;
          align-items: flex-start;
        }
        .product img {
          margin-bottom: 10px;
        }
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <h1>Your Order is Confirmed 🎉</h1>
        <p>Thank you for shopping with us</p>
      </div>

      <div class="section user-info">
        <h2>Customer Details</h2>
        <p><strong>Name:</strong> John Doe</p>
        <p><strong>Email:</strong> john@example.com</p>
        <p><strong>Order ID:</strong> #987654</p>
        <p><strong>Date:</strong> April 5, 2025</p>
      </div>

      <div class="section order-info">
        <h2>Order Summary</h2>

        <div class="product">
          <img src="https://via.placeholder.com/70" alt="Product" />
          <div class="product-details">
            <h4>Noise-Canceling Headphones</h4>
            <p>Qty: 1</p>
            <p>Price: $89.99</p>
          </div>
        </div>

        <div class="product">
          <img src="https://via.placeholder.com/70" alt="Product" />
          <div class="product-details">
            <h4>Smartwatch Pro</h4>
            <p>Qty: 2</p>
            <p>Price: $149.99 each</p>
          </div>
        </div>

        <p class="total">Total: $389.97</p>
      </div>

      <div class="footer">
        <p>Example Store • www.examplestore.com • support@example.com</p>
        <p>© 2025 Example Store. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>`

//   return `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <style>
//         body {
//           font-family: Arial, sans-serif;
//           line-height: 1.6;
//           color: #333;
//           max-width: 600px;
//           margin: 0 auto;
//         }
//         .container {
//           border: 1px solid #e0e0e0;
//           border-radius: 5px;
//           padding: 20px;
//           margin-top: 20px;
//         }
//         .header {
//           background-color: #2196F3;
//           color: white;
//           padding: 10px 20px;
//           border-radius: 5px 5px 0 0;
//           margin: -20px -20px 20px;
//         }
//         .content {
//           padding: 0 20px;
//         }
//         .footer {
//           margin-top: 30px;
//           font-size: 12px;
//           color: #777;
//           text-align: center;
//           border-top: 1px solid #e0e0e0;
//           padding-top: 20px;
//         }
//         img {
//           max-width: 100%;
//           height: auto;
//           margin: 15px 0;
//         }
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <div class="header">
//           <h2>${title}</h2>
//         </div>
//         <div class="content">
//           ${message.replace(/\n/g, "<br>")}
//           ${image ? `<img src="${image}" alt="Info Image">` : ""}
//         </div>
//         <div class="footer">
//           <p>Thank you for your attention.</p>
//         </div>
//       </div>
//     </body>
//     </html>
//   `
}

export async function sendEmail(data: EmailData) {
  try {
    const { to, subject, message, type = "custom", image, templateData } = data

    // Validate inputs
    if (!to || !subject) {
      return { success: false, error: "Recipient and subject are required" }
    }

    // Create a transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })

    // Determine HTML content based on type
    let htmlContent = message

    if (type === "success") {
      htmlContent = getSuccessTemplate({
        message,
        image,
        title: templateData?.title,
      })
    } else if (type === "error") {
      htmlContent = getErrorTemplate({
        message,
        image,
        title: templateData?.title,
      })
    } else if (type === "info") {
      htmlContent = getInfoTemplate({
        message,
        image,
        title: templateData?.title,
      })
    }

    // Send email
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject,
      text: message,
      html: htmlContent,
    })

    return { success: true }
  } catch (error) {
    console.error("Error sending email:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    }
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
