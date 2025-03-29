import path from "path";
import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import hpp from "hpp";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

import userRoutes from "./routes/userRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";

import rL from "./utils/rateLimiter.js";
import { createExpressMiddleware } from "redis-sliding-rate-limiter";

dotenv.config({ path: "./backend/config/config.env" });
const port = process.env.PORT || 5000;

connectDB();

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Set security headers
app.use(
  helmet({
    xDownloadOptions: false,
  })
);

// Prevent http param pollution
app.use(hpp());

app.use(cookieParser());

// Helper to wrap async middleware
const rateLimitMiddleware = createExpressMiddleware(rL);

// Plug-in rate limit
app.use((req, res, next) => {
  Promise.resolve(rateLimitMiddleware(req, res, next)).catch(next);
});

app.use("/api/user", userRoutes);
app.use("/api/quiz", quizRoutes);

if (process.env.NODE_ENV === "production") {
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running....");
  });
}

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => console.log(`Server started on port ${port}`));
