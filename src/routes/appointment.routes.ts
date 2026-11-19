import { Router } from "express";
import {
  createAppointment,
  getMyAppointments,
  getAllAppointments,
  cancelAppointment,
  confirmAppointment,
} from "../controllers/appointment.controller";
import {
  verifyToken,
  verifyAdmin,
  verifyCustomer,
} from "../middlewares/auth.middleware";

const router = Router();

router.post("/", verifyToken, verifyCustomer, createAppointment);
router.get("/my", verifyToken, getMyAppointments);

router.get("/", verifyToken, verifyAdmin, getAllAppointments);

router.patch("/:id/cancel", verifyToken, cancelAppointment);

router.patch("/:id/confirm", verifyToken, verifyAdmin, confirmAppointment);

export default router;
