import { Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { AuthRequest } from "../middlewares/auth.middleware";

const generateToken = (id: string, email: string, role: string) => {
  const secret = process.env.JWT_SECRET || "salonbook_super_secret_jwt_key_2026";
  return jwt.sign({ id, email, role }, secret, { expiresIn: "7d" });
};

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, image, phone } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: "Full name, email, and password are required.",
      });
      return;
    }

    const hasMinLength = password.length >= 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);

    if (!hasMinLength || !hasUpperCase || !hasLowerCase) {
      res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters long and contain at least one uppercase and one lowercase letter.",
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      res.status(400).json({
        success: false,
        message: "An account with this email address already exists.",
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      image:
        image ||
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80",
      phone: phone || "",
      role: "customer",
      isBlocked: false,
    });

    const token = generateToken((user._id as any).toString(), user.email, user.role);

    res.status(201).json({
      success: true,
      message: "Account created successfully! Welcome to SalonBook.",
      data: {
        token,
        user: {
          id: (user._id as any).toString(),
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          phone: user.phone,
          isBlocked: user.isBlocked,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to register user.",
    });
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password.",
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

    if (user.password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(401).json({
          success: false,
          message: "Invalid email or password.",
        });
        return;
      }
    }

    const token = generateToken((user._id as any).toString(), user.email, user.role);

    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      data: {
        token,
        user: {
          id: (user._id as any).toString(),
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          phone: user.phone,
          address: user.address,
          isBlocked: user.isBlocked,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Login failed.",
    });
  }
};

export const googleAuth = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, name, image } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: "Email is required for Google authentication.",
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
      if (user.isBlocked) {
        res.status(403).json({
          success: false,
          message: "Your account has been suspended. Please contact salon support.",
        });
        return;
      }
      if (image && !user.image) user.image = image;
      await user.save();
    } else {
      user = await User.create({
        name: name || normalizedEmail.split("@")[0],
        email: normalizedEmail,
        image:
          image ||
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80",
        role: "customer",
        isBlocked: false,
      });
    }

    const token = generateToken((user._id as any).toString(), user.email, user.role);

    res.status(200).json({
      success: true,
      message: `Signed in with Google as ${user.name}`,
      data: {
        token,
        user: {
          id: (user._id as any).toString(),
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          phone: user.phone,
          address: user.address,
          isBlocked: user.isBlocked,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Google authentication failed.",
    });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: (user._id as any).toString(),
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        phone: user.phone,
        address: user.address,
        isBlocked: user.isBlocked,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve user profile.",
    });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { name, phone, address, image } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    if (name !== undefined) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (address !== undefined) user.address = address.trim();
    if (image !== undefined) user.image = image.trim();

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      data: {
        id: (user._id as any).toString(),
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        phone: user.phone,
        address: user.address,
        isBlocked: user.isBlocked,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile.",
    });
  }
};
