import { Router, Response, NextFunction } from "express";
import {
  getServices,
  getFeaturedServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus,
} from "../controllers/service.controller";
import {
  verifyToken,
  verifyAdmin,
  AuthRequest,
} from "../middlewares/auth.middleware";
import jwt from "jsonwebtoken";

const router = Router();

const optionalToken = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "salonbook_super_secret_jwt_key_2026";
    try {
      const decoded = jwt.verify(token, secret) as any;
      req.user = decoded;
    } catch {
    }
  }
  next();
};

router.get("/", optionalToken, getServices);
router.get("/featured", getFeaturedServices);
router.get("/:id", getServiceById);

router.post("/", verifyToken, verifyAdmin, createService);
router.patch("/:id", verifyToken, verifyAdmin, updateService);
router.delete("/:id", verifyToken, verifyAdmin, deleteService);
router.patch("/:id/status", verifyToken, verifyAdmin, toggleServiceStatus);

export default router;
