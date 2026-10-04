import mongoose from "mongoose";
import serviceService from "../services/serviceService.js";

// Create Service (Admin)
export const createService = async (req, res) => {
  try {
    const service = await serviceService.createService(req.body);

    res.status(201).json({
      success: true,
      message: "Service created successfully.",
      data: service,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    }); 
  }
};

// Get Active Services (Public)
export const getActiveServices = async (req, res) => {
  try {
    const services = await serviceService.getActiveServices();

    res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Services (Admin)
export const getAllServices = async (req, res) => {
  try {
    const services = await serviceService.getAllServices();

    res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Service By ID (Public)
export const getServiceById = async (req, res) => {
  try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
        success: false,
        message: "Invalid service ID.",
      });
     }

      const service = await serviceService.getServiceById(req.params.id);

        res.status(200).json({
          success: true,
          data: service,
        });

    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
};

// Update Service (Admin)
export const updateService = async (req, res) => {
  try {

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID.",
      });
    }
    const service = await serviceService.updateService(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Service updated successfully.",
      data: service,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Service (Admin, Soft Delete)
export const deleteService = async (req, res) => {
  try {

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID.",
      });
    }
    
    const service = await serviceService.deleteService(req.params.id);

    res.status(200).json({
        success: true,
        message: "Service deleted successfully.",
        data: service,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};
