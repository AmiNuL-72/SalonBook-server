import { Response } from "express";
import { Appointment } from "../models/Appointment";
import { Service } from "../models/Service";
import { User } from "../models/User";
import { AuthRequest } from "../middlewares/auth.middleware";

export const createAppointment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const customerId = req.user?.id;
    if (!customerId) {
      res.status(401).json({ success: false, message: "Unauthorized." });
      return;
    }

    if (req.user?.role !== "customer") {
      res.status(403).json({
        success: false,
        message: "Admins cannot submit customer appointment requests.",
      });
      return;
    }

    const { serviceId, appointmentDate, timeSlot, message } = req.body;

    if (!serviceId || !appointmentDate || !timeSlot) {
      res.status(400).json({
        success: false,
        message: "Service ID, appointment date, and time slot are required.",
      });
      return;
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      res.status(404).json({
        success: false,
        message: "Selected service does not exist.",
      });
      return;
    }

    if (service.status !== "active") {
      res.status(400).json({
        success: false,
        message: "This salon service is currently inactive and cannot be booked.",
      });
      return;
    }

    const existingConflict = await Appointment.findOne({
      appointmentDate,
      timeSlot,
      status: { $in: ["pending", "confirmed"] },
    });

    if (existingConflict) {
      res.status(409).json({
        success: false,
        message:
          "This time slot is already booked for the selected date. Please choose another slot.",
      });
      return;
    }

    const customer = await User.findById(customerId);
    if (!customer) {
      res.status(404).json({ success: false, message: "Customer profile not found." });
      return;
    }

    const appointment = await Appointment.create({
      serviceId: service._id,
      serviceName: service.serviceName,
      serviceImage: service.image,
      category: service.category,
      customerId: customer._id,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone || "",
      appointmentDate,
      timeSlot,
      message: message ? message.trim() : "",
      servicePrice: service.price,
      paymentStatus: "unpaid",
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Appointment request submitted! Awaiting salon confirmation.",
      data: {
        id: (appointment._id as any).toString(),
        serviceId: (appointment.serviceId as any).toString(),
        serviceName: appointment.serviceName,
        serviceImage: appointment.serviceImage,
        category: appointment.category,
        customerId: (appointment.customerId as any).toString(),
        customerName: appointment.customerName,
        customerEmail: appointment.customerEmail,
        customerPhone: appointment.customerPhone,
        appointmentDate: appointment.appointmentDate,
        timeSlot: appointment.timeSlot,
        message: appointment.message,
        servicePrice: appointment.servicePrice,
        paymentStatus: appointment.paymentStatus,
        status: appointment.status,
        createdAt: appointment.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to submit appointment request.",
    });
  }
};

export const getMyAppointments = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const customerId = req.user?.id;
    if (!customerId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const appointments = await Appointment.find({ customerId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments.map((a) => ({
        id: (a._id as any).toString(),
        serviceId: (a.serviceId as any).toString(),
        serviceName: a.serviceName,
        serviceImage: a.serviceImage,
        category: a.category,
        customerId: (a.customerId as any).toString(),
        customerName: a.customerName,
        customerEmail: a.customerEmail,
        customerPhone: a.customerPhone,
        appointmentDate: a.appointmentDate,
        timeSlot: a.timeSlot,
        message: a.message,
        servicePrice: a.servicePrice,
        paymentStatus: a.paymentStatus,
        status: a.status,
        createdAt: a.createdAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch appointments.",
    });
  }
};

export const getAllAppointments = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments.map((a) => ({
        id: (a._id as any).toString(),
        serviceId: (a.serviceId as any).toString(),
        serviceName: a.serviceName,
        serviceImage: a.serviceImage,
        category: a.category,
        customerId: (a.customerId as any).toString(),
        customerName: a.customerName,
        customerEmail: a.customerEmail,
        customerPhone: a.customerPhone,
        appointmentDate: a.appointmentDate,
        timeSlot: a.timeSlot,
        message: a.message,
        servicePrice: a.servicePrice,
        paymentStatus: a.paymentStatus,
        status: a.status,
        createdAt: a.createdAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch all appointments.",
    });
  }
};

export const cancelAppointment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      res.status(404).json({ success: false, message: "Appointment not found." });
      return;
    }

    const isAdmin = req.user?.role === "admin";
    const isOwner = (appointment.customerId as any).toString() === req.user?.id;

    if (!isAdmin && !isOwner) {
      res.status(403).json({
        success: false,
        message: "Unauthorized: You can only cancel your own appointments.",
      });
      return;
    }

    if (!isAdmin) {
      if (appointment.status !== "pending") {
        res.status(400).json({
          success: false,
          message:
            "Customers cannot cancel an already confirmed or cancelled appointment. Please contact the salon directly.",
        });
        return;
      }
    }

    appointment.status = "cancelled";
    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Appointment has been cancelled successfully.",
      data: {
        id: (appointment._id as any).toString(),
        status: appointment.status,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to cancel appointment.",
    });
  }
};

export const confirmAppointment = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = _req.params;
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      res.status(404).json({ success: false, message: "Appointment not found." });
      return;
    }

    if (appointment.status !== "pending") {
      res.status(400).json({
        success: false,
        message: "Only pending appointments can be confirmed.",
      });
      return;
    }

    appointment.status = "confirmed";
    await appointment.save();

    res.status(200).json({
      success: true,
      message:
        "Appointment confirmed successfully! Customer can now proceed to payment.",
      data: {
        id: (appointment._id as any).toString(),
        status: appointment.status,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to confirm appointment.",
    });
  }
};
