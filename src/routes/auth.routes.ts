import { Router } from "express";
import {
  register,
  login,
  googleAuth,
  getMe,
  updateProfile,
} from "../controllers/auth.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleAuth);
router.get("/me", verifyToken, getMe);
router.patch("/profile", verifyToken, updateProfile);

export default router;
