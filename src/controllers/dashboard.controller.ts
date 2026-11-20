import { Response } from "express";
import { User } from "../models/User";
import { Service } from "../models/Service";
import { Appointment } from "../models/Appointment";
import { Transaction } from "../models/Transaction";
import { AuthRequest } from "../middlewares/auth.middleware";

export const getDashboardStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const role = req.user?.role;
    const userId = req.user?.id;

    if (role === "admin") {
      const [
        totalCustomers,
        totalActiveServices,
        totalAppointments,
        pendingAppointments,
        confirmedAppointments,
        cancelledAppointments,
        transactions,
      ] = await Promise.all([
        User.countDocuments({ role: "customer" }),
        Service.countDocuments({ status: "active" }),
        Appointment.countDocuments(),
        Appointment.countDocuments({ status: "pending" }),
        Appointment.countDocuments({ status: "confirmed" }),
        Appointment.countDocuments({ status: "cancelled" }),
        Transaction.find({ status: "paid" }),
      ]);

      const totalRevenue = transactions.reduce((acc, curr) => acc + curr.amount, 0);

      res.status(200).json({
        success: true,
        data: {
          role: "admin",
          totalCustomers,
          totalActiveServices,
          totalAppointments,
          pendingAppointments,
          confirmedAppointments,
          cancelledAppointments,
          totalSuccessfulPayments: transactions.length,
          totalRevenue,
        },
      });
      return;
    }

    const [
      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
      cancelledAppointments,
      paidAppointments,
    ] = await Promise.all([
      Appointment.countDocuments({ customerId: userId }),
      Appointment.countDocuments({ customerId: userId, status: "pending" }),
      Appointment.countDocuments({ customerId: userId, status: "confirmed" }),
      Appointment.countDocuments({ customerId: userId, status: "cancelled" }),
      Appointment.countDocuments({ customerId: userId, paymentStatus: "paid" }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        role: "customer",
        totalAppointments,
        pendingAppointments,
        confirmedAppointments,
        cancelledAppointments,
        paidAppointments,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch dashboard statistics.",
    });
  }
};
