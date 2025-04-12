import express, { Express } from "express";
import { config } from "dotenv";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import testRoutes from "./routes/test.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user/index.js";
import sellerRoutes from "./routes/seller/index.js";
import adminRoutes from "./routes/admin/index.js";
import categoryRoutes from "./routes/cms/category.js";
import bannerCarouselRoutes from "./routes/cms/bannerCarousel.js";
import productCarouselRoutes from "./routes/cms/productCarousel.js";
import passport from "passport";
import contactRoutes from "./routes/contact.js";
import removebg from "./routes/seller/bg-remove.js";
import sendMail from "./routes/user/sendMail.js";
import rateLimit from "express-rate-limit";
config();

const port = 8000;
const app: Express = express();
const limiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 200, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

// Middlewares
app.use(morgan("dev"));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(passport.initialize());
app.use(limiter);

// Api Endpoints
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/user", userRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/banner-carousels", bannerCarouselRoutes);
app.use("/api/product-carousels", productCarouselRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/remove-bg", removebg);
app.use("/api/sendmail", sendMail);

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
