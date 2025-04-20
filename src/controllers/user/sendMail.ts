import nodemailer from "nodemailer";
import { Order, OrderItem, User } from "../../types/entityTypes.js";
import dotenv from "dotenv";
dotenv.config();

import {
  getOrderCancelledTemplate,
  getOrderDeliveredTemplate,
  getOrderReturnedTemplate,
  getOrderShippedTemplate,
  getOrdderConfirmTemplate,
} from "./Mail-Template.js";

// Refined union types
type OrderEmailData = Order & {
  type: "OrderConfirmed";
  user: User;
};

type ItemUserEmailData = {
  type: "Cancelled" | "Returned" | "Shipped" | "Delivered";
  order: OrderItem;
  user: User;
};

type EmailData = OrderEmailData | ItemUserEmailData;

export async function sendEmail(data: EmailData) {
  try {
    let to;
    let htmlContent;
    let subject;

    if (data.type === "OrderConfirmed") {
      const user = data.user;
      to = user.email;
      htmlContent = getOrdderConfirmTemplate(data);
      subject = "Order Confirmed Successfully";
    } else {
      to = data.user.email;

      switch (data.type) {
        case "Cancelled":
          htmlContent = getOrderCancelledTemplate({
            order: data.order,
            user: data.user,
          });
          subject = "Order Cancelled";
          break;
        case "Returned":
          htmlContent = getOrderReturnedTemplate({
            order: data.order,
            user: data.user,
          });
          subject = "Order Returned";
          break;
        case "Shipped":
          htmlContent = getOrderShippedTemplate({
            order: data.order,
            user: data.user,
          });
          subject = "Order Shipped";
          break;
        case "Delivered":
          htmlContent = getOrderDeliveredTemplate({
            order: data.order,
            user: data.user,
          });
          subject = "Order Delivered";
          break;
      }
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject,
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
