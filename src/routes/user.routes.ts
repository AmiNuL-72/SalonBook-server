import { Router } from "express";
import { getUsers, toggleBlockUser } from "../controllers/user.controller";
import { verifyToken, verifyAdmin } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", verifyToken, verifyAdmin, getUsers);
router.patch("/:id/block", verifyToken, verifyAdmin, toggleBlockUser);

export default router;
