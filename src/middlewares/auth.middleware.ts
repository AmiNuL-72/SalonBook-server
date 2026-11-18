import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/User";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: "customer" | "admin";
    isBlocked?: boolean;
    name?: string;
  };
}

export const verifyToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Access token missing or invalid. Please sign in.",
      });
      return;
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "salonbook_super_secret_jwt_key_2026";

    const decoded = jwt.verify(token, secret) as {
      id: string;
      email: string;
      role: "customer" | "admin";
    };

    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401).json({
        success: false,
        message: "User account no longer exists.",
      });
      return;
    }

    if (user.isBlocked) {
      res.status(403).json({
        success: false,
        message: "Your account has been suspended. Please contact salon support.",
      });
      return;
    }

    req.user = {
      id: (user._id as any).toString(),
      email: user.email,
      role: user.role,
      isBlocked: user.isBlocked,
      name: user.name,
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired session token. Please sign in again.",
    });
  }
};

export const verifyAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({
      success: false,
      message: "Forbidden: Administrator privileges required.",
    });
    return;
  }
  next();
};

export const verifyCustomer = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== "customer") {
    res.status(403).json({
      success: false,
      message: "Admins cannot submit customer appointment requests.",
    });
    return;
  }
  next();
};
