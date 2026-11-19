import { Response } from "express";
import { Service } from "../models/Service";
import { AuthRequest } from "../middlewares/auth.middleware";

export const getServices = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, category, sort, status, all } = req.query;

    const query: any = {};

    if (all === "true" && req.user?.role === "admin") {
      if (status && (status === "active" || status === "inactive")) {
        query.status = status;
      }
    } else {
      query.status = "active";
    }

    if (search && typeof search === "string" && search.trim() !== "") {
      query.serviceName = { $regex: search.trim(), $options: "i" };
    }

    if (category && typeof category === "string" && category.trim() !== "" && category !== "All") {
      query.category = category.trim();
    }

    let sortOption: any = { createdAt: -1 };
    if (sort === "price-asc") {
      sortOption = { price: 1 };
    } else if (sort === "price-desc") {
      sortOption = { price: -1 };
    } else if (sort === "duration") {
      sortOption = { duration: 1 };
    }

    const services = await Service.find(query).sort(sortOption);

    res.status(200).json({
      success: true,
      count: services.length,
      data: services.map((s) => ({
        id: (s._id as any).toString(),
        serviceName: s.serviceName,
        category: s.category,
        description: s.description,
        price: s.price,
        duration: s.duration,
        image: s.image,
        status: s.status,
        featured: s.featured,
        createdAt: s.createdAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch salon services.",
    });
  }
};

export const getFeaturedServices = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    let featured = await Service.find({ status: "active", featured: true }).limit(6);
    if (featured.length < 6) {
      const remainingNeeded = 6 - featured.length;
      const ids = featured.map((s) => s._id);
      const more = await Service.find({
        status: "active",
        _id: { $nin: ids },
      }).limit(remainingNeeded);
      featured = [...featured, ...more];
    }

    res.status(200).json({
      success: true,
      data: featured.map((s) => ({
        id: (s._id as any).toString(),
        serviceName: s.serviceName,
        category: s.category,
        description: s.description,
        price: s.price,
        duration: s.duration,
        image: s.image,
        status: s.status,
        featured: s.featured,
        createdAt: s.createdAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch featured services.",
    });
  }
};

export const getServiceById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);

    if (!service) {
      res.status(404).json({
        success: false,
        message: "Requested salon service was not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: (service._id as any).toString(),
        serviceName: service.serviceName,
        category: service.category,
        description: service.description,
        price: service.price,
        duration: service.duration,
        image: service.image,
        status: service.status,
        featured: service.featured,
        createdAt: service.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Invalid service identifier or retrieval failed.",
    });
  }
};

export const createService = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { serviceName, category, description, price, duration, image, status, featured } =
      req.body;

    if (!serviceName || !category || !description || price === undefined || duration === undefined || !image) {
      res.status(400).json({
        success: false,
        message: "All service details (name, category, description, price, duration, image) are required.",
      });
      return;
    }

    const numPrice = Number(price);
    const numDuration = Number(duration);

    if (numPrice <= 0 || numDuration <= 0) {
      res.status(400).json({
        success: false,
        message: "Price and duration must be positive numbers.",
      });
      return;
    }

    const service = await Service.create({
      serviceName: serviceName.trim(),
      category: category.trim(),
      description: description.trim(),
      price: numPrice,
      duration: numDuration,
      image: image.trim(),
      status: status || "active",
      featured: Boolean(featured),
    });

    res.status(201).json({
      success: true,
      message: `Service "${service.serviceName}" created successfully!`,
      data: {
        id: (service._id as any).toString(),
        serviceName: service.serviceName,
        category: service.category,
        description: service.description,
        price: service.price,
        duration: service.duration,
        image: service.image,
        status: service.status,
        featured: service.featured,
        createdAt: service.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create service.",
    });
  }
};

export const updateService = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { serviceName, category, description, price, duration, image, status, featured } =
      req.body;

    const service = await Service.findById(id);
    if (!service) {
      res.status(404).json({
        success: false,
        message: "Service not found.",
      });
      return;
    }

    if (price !== undefined && Number(price) <= 0) {
      res.status(400).json({
        success: false,
        message: "Price must be a positive number.",
      });
      return;
    }

    if (duration !== undefined && Number(duration) <= 0) {
      res.status(400).json({
        success: false,
        message: "Duration must be a positive number.",
      });
      return;
    }

    if (serviceName !== undefined) service.serviceName = serviceName.trim();
    if (category !== undefined) service.category = category.trim();
    if (description !== undefined) service.description = description.trim();
    if (price !== undefined) service.price = Number(price);
    if (duration !== undefined) service.duration = Number(duration);
    if (image !== undefined) service.image = image.trim();
    if (status !== undefined) service.status = status;
    if (featured !== undefined) service.featured = Boolean(featured);

    await service.save();

    res.status(200).json({
      success: true,
      message: `Service "${service.serviceName}" updated successfully!`,
      data: {
        id: (service._id as any).toString(),
        serviceName: service.serviceName,
        category: service.category,
        description: service.description,
        price: service.price,
        duration: service.duration,
        image: service.image,
        status: service.status,
        featured: service.featured,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update service.",
    });
  }
};

export const deleteService = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const service = await Service.findByIdAndDelete(id);

    if (!service) {
      res.status(404).json({
        success: false,
        message: "Service not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Service "${service.serviceName}" removed successfully.`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete service.",
    });
  }
};

export const toggleServiceStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);

    if (!service) {
      res.status(404).json({ success: false, message: "Service not found." });
      return;
    }

    service.status = service.status === "active" ? "inactive" : "active";
    await service.save();

    res.status(200).json({
      success: true,
      message: `Service status changed to ${service.status}.`,
      data: {
        id: (service._id as any).toString(),
        status: service.status,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to change service status.",
    });
  }
};
