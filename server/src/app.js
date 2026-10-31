import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    maxAge: 600,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "GenZineer API is running",
  });
});

app.get("/api/health/cron", (req, res) => {
  console.log("/api/health/cron is called!");
  res.status(200).json({
    status: "OK",
    service: "GenZineer API",
    timestamp: new Date().toISOString(),
  });
});

import authRoutes from "./routes/auth.routes.js";

app.use("/api/auth", authRoutes);

app.use(errorHandler);

export default app;
