import express, { Application, Request, Response } from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import serviceRoutes from "./routes/service.routes";
import appointmentRoutes from "./routes/appointment.routes";
import paymentRoutes from "./routes/payment.routes";
import userRoutes from "./routes/user.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import { notFoundHandler, globalErrorHandler } from "./middlewares/error.middleware";

import { connectDB } from "./config/db";

const app: Application = express();

app.use(async (_req, _res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error("[Serverless DB Middleware] Error:", err);
  }
  next();
});

const allowedOrigins = [
  "http://localhost:3000",
  process.env.CLIENT_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        origin.startsWith("http://localhost:")
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(
  "/api/payments/webhook",
  express.raw({ type: "application/json" })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "SalonBook API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "healthy", uptime: process.uptime() });
});

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
