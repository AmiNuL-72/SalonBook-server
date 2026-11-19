import { Response } from "express";
import { User } from "../models/User";
import { AuthRequest } from "../middlewares/auth.middleware";

export const getUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find({ role: "customer" }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users.map((u) => ({
        id: (u._id as any).toString(),
        name: u.name,
        email: u.email,
        image: u.image,
        phone: u.phone,
        address: u.address,
        role: u.role,
        isBlocked: u.isBlocked,
        createdAt: u.createdAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch registered customers.",
    });
  }
};

export const toggleBlockUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    if (user.role === "admin") {
      res.status(400).json({
        success: false,
        message: "Cannot block an administrator account.",
      });
      return;
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.name} has been ${user.isBlocked ? "blocked" : "unblocked"}.`,
      data: {
        id: (user._id as any).toString(),
        isBlocked: user.isBlocked,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update user block status.",
    });
  }
};
