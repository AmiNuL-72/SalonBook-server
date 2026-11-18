import mongoose, { Document, Schema, Types } from "mongoose";

export interface ITransaction extends Document {
  appointmentId: Types.ObjectId;
  customerId: Types.ObjectId;
  customerName: string;
  serviceName: string;
  appointmentDate: string;
  amount: number;
  currency: string;
  stripeSessionId: string;
  status: "paid" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: [true, "Appointment ID is required"],
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Customer ID is required"],
    },
    customerName: {
      type: String,
      required: true,
    },
    serviceName: {
      type: String,
      required: true,
    },
    appointmentDate: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
    },
    currency: {
      type: String,
      default: "usd",
      lowercase: true,
    },
    stripeSessionId: {
      type: String,
      required: [true, "Stripe session ID is required"],
    },
    status: {
      type: String,
      enum: ["paid", "failed"],
      default: "paid",
    },
  },
  {
    timestamps: true,
  }
);

export const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  TransactionSchema
);
