import { Request, Response } from "express";
import { stripe } from "../config/stripe";
import { Appointment } from "../models/Appointment";
import { Transaction } from "../models/Transaction";
import { AuthRequest } from "../middlewares/auth.middleware";

export const createCheckoutSession = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { appointmentId } = req.body;
    const customerId = req.user?.id;

    if (!appointmentId) {
      res.status(400).json({ success: false, message: "Appointment ID is required." });
      return;
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      res.status(404).json({ success: false, message: "Appointment not found." });
      return;
    }

    if ((appointment.customerId as any).toString() !== customerId) {
      res.status(403).json({
        success: false,
        message: "You can only make payments for your own appointments.",
      });
      return;
    }

    if (appointment.status !== "confirmed") {
      res.status(400).json({
        success: false,
        message: "Payment can only be processed for confirmed appointments.",
      });
      return;
    }

    if (appointment.paymentStatus === "paid") {
      res.status(400).json({
        success: false,
        message: "This appointment has already been paid for.",
      });
      return;
    }

    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const isMockStripe = !stripeKey || stripeKey.includes("placeholder");

    if (isMockStripe) {
      const mockSessionId = `cs_test_mock_${Date.now()}`;
      res.status(200).json({
        success: true,
        url: `${clientUrl}/payment/success?session_id=${mockSessionId}&appointment_id=${appointment._id}`,
        sessionId: mockSessionId,
      });
      return;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Salon Appointment: ${appointment.serviceName}`,
              description: `Date: ${appointment.appointmentDate} | Slot: ${appointment.timeSlot}`,
              images: appointment.serviceImage ? [appointment.serviceImage] : [],
            },
            unit_amount: Math.round(appointment.servicePrice * 100),
          },
          quantity: 1,
        },
      ],
      customer_email: appointment.customerEmail,
      metadata: {
        appointmentId: (appointment._id as any).toString(),
        customerId: (appointment.customerId as any).toString(),
        customerName: appointment.customerName,
        serviceName: appointment.serviceName,
        appointmentDate: appointment.appointmentDate,
      },
      success_url: `${clientUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&appointment_id=${appointment._id}`,
      cancel_url: `${clientUrl}/payment/cancel?appointment_id=${appointment._id}`,
    });

    res.status(200).json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to initialize Stripe checkout session.",
    });
  }
};

export const handleStripeWebhook = async (
  req: Request,
  res: Response
): Promise<void> => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: any;

  try {
    if (webhookSecret && sig && !webhookSecret.includes("placeholder")) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      event = req.body;
    }
  } catch (err: any) {
    console.error("[Stripe Webhook] Verification error:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const appointmentId = session.metadata?.appointmentId;

    if (appointmentId) {
      try {
        const appointment = await Appointment.findById(appointmentId);
        if (appointment && appointment.paymentStatus !== "paid") {
          appointment.paymentStatus = "paid";
          await appointment.save();

          await Transaction.create({
            appointmentId: appointment._id,
            customerId: appointment.customerId,
            customerName: appointment.customerName,
            serviceName: appointment.serviceName,
            appointmentDate: appointment.appointmentDate,
            amount: appointment.servicePrice,
            currency: session.currency || "usd",
            stripeSessionId: session.id,
            status: "paid",
          });

          console.log(
            `[Stripe Webhook] Verified payment recorded for appointment: ${appointmentId}`
          );
        }
      } catch (dbErr) {
        console.error("[Stripe Webhook] DB error on payment completion:", dbErr);
      }
    }
  }

  res.status(200).json({ received: true });
};

export const verifyPaymentSession = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { sessionId, appointmentId } = req.body;

    if (!appointmentId) {
      res.status(400).json({ success: false, message: "Appointment ID is required." });
      return;
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      res.status(404).json({ success: false, message: "Appointment not found." });
      return;
    }

    if (appointment.paymentStatus === "paid") {
      const existingTxn = await Transaction.findOne({ appointmentId: appointment._id });
      res.status(200).json({
        success: true,
        message: "Payment verified successfully.",
        data: existingTxn,
      });
      return;
    }

    appointment.paymentStatus = "paid";
    await appointment.save();

    const txn = await Transaction.create({
      appointmentId: appointment._id,
      customerId: appointment.customerId,
      customerName: appointment.customerName,
      serviceName: appointment.serviceName,
      appointmentDate: appointment.appointmentDate,
      amount: appointment.servicePrice,
      currency: "usd",
      stripeSessionId: sessionId || `cs_test_${Date.now()}`,
      status: "paid",
    });

    res.status(200).json({
      success: true,
      message: "Payment successfully verified and updated!",
      data: {
        id: (txn._id as any).toString(),
        appointmentId: (txn.appointmentId as any).toString(),
        amount: txn.amount,
        currency: txn.currency,
        stripeSessionId: txn.stripeSessionId,
        status: txn.status,
        createdAt: txn.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to verify payment session.",
    });
  }
};

export const getTransactions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const isAdmin = req.user?.role === "admin";
    const filter = isAdmin ? {} : { customerId: req.user?.id };

    const transactions = await Transaction.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions.map((t) => ({
        id: (t._id as any).toString(),
        appointmentId: (t.appointmentId as any).toString(),
        customerId: (t.customerId as any).toString(),
        customerName: t.customerName,
        serviceName: t.serviceName,
        appointmentDate: t.appointmentDate,
        amount: t.amount,
        currency: t.currency.toUpperCase(),
        stripeSessionId: t.stripeSessionId,
        status: t.status,
        createdAt: t.createdAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch transactions.",
    });
  }
};
