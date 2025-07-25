# ElectroHub E-commerce Website

![ElectroHub Screenshot](https://github.com/user-attachments/assets/cd2902a8-9169-4c25-80bf-8c0656cdcba0) <!-- Replace with a real image path -->

# ElectroHub - Backend 🧠⚙️

This is the **backend API** for ElectroHub — a full-stack e-commerce application. Built using **Node.js**, **Express**, **TypeScript**, and **MongoDB**, it provides a secure and scalable REST API for frontend consumption.

## 🚀 Features

- 🔐 User registration and login (JWT)
- 🛍️ Product CRUD operations (Admin)
- 💼 Category and brand management
- 🧾 Order creation and payment status update
- 💳 Razorpay integration
- 📦 Cart and wishlist management
- 🔐 Protected routes with middleware

## 🛠️ Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (access + refresh tokens)
- **Payments**: Razorpay
- **File Upload**: Cloudinary
- **Logging**: Morgan

## 📂 Folder Structure

```bash
src/
├── controllers/       # Business logic
├── models/            # Mongoose models
├── routes/            # API routes
├── middlewares/       # Auth and error handlers
├── utils/             # Helper utilities
├── config/            # DB and cloud config
└── index.ts           # Entry point
