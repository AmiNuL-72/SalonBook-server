import { Router } from "express";
import {
  createCheckoutSession,
  handleStripeWebhook,
  verifyPaymentSession,
  getTransactions,
} from "../controllers/payment.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create-checkout-session", verifyToken, createCheckoutSession);
router.post("/webhook", handleStripeWebhook);
router.post("/verify-session", verifyToken, verifyPaymentSession);
router.get("/transactions", verifyToken, getTransactions);

export default router;
