import mongoose, { Document, Schema, Types } from "mongoose";

export interface IAppointment extends Document {
  serviceId: Types.ObjectId;
  serviceName: string;
  serviceImage: string;
  category: string;
  customerId: Types.ObjectId;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  appointmentDate: string;
  timeSlot: string;
  message?: string;
  servicePrice: number;
  paymentStatus: "unpaid" | "paid";
  status: "pending" | "confirmed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: [true, "Service ID is required"],
    },
    serviceName: {
      type: String,
      required: true,
    },
    serviceImage: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
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
    customerEmail: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      default: "",
    },
    appointmentDate: {
      type: String,
      required: [true, "Appointment date is required"],
    },
    timeSlot: {
      type: String,
      required: [true, "Time slot is required"],
    },
    message: {
      type: String,
      default: "",
    },
    servicePrice: {
      type: Number,
      required: [true, "Service price is required"],
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

AppointmentSchema.index({ appointmentDate: 1, timeSlot: 1, status: 1 });

export const Appointment = mongoose.model<IAppointment>(
  "Appointment",
  AppointmentSchema
);
