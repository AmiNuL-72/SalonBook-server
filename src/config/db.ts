import mongoose from "mongoose";

let isConnecting = false;

export const connectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  if (isConnecting) {
    return;
  }

  isConnecting = true;

  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/salonbook";

    mongoose.set("strictQuery", false);

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
      bufferCommands: false,
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
  } catch (error) {
    console.error("[MongoDB] Connection error:", error);
  } finally {
    isConnecting = false;
  }
};
