import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboard.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = Router();

router.get("/stats", verifyToken, getDashboardStats);

export default router;
