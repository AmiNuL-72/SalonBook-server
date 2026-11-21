import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDB } from "./config/db";
import { seedInitialData } from "./utils/seed";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`[SalonBook Server] Running on http://localhost:${PORT}`);
    });

    await connectDB();
    await seedInitialData();
  } catch (error) {
    console.error("[SalonBook Server] Startup failure:", error);
  }
};

startServer();
