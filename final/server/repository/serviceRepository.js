import Service from "../models/Service.js";

// Create a new service
const createService = async (serviceData) => {
  return await Service.create(serviceData);
};

// Get all active services
const getActiveServices = async () => {
  return await Service.find({ isActive: true }).sort({ name: 1 });
};

// Get all services (Admin)
const getAllServices = async () => {
  return await Service.find().sort({ createdAt: -1 });
};

// Get service by ID
const getServiceById = async (id) => {
  return await Service.findById(id);
};

// Get service by name
const getServiceByName = async (name) => {
  return await Service.findOne({
    name: new RegExp(`^${name.trim()}$`, "i"),
  });
};

// Update service
const updateService = async (id, updatedData) => {
  return await Service.findByIdAndUpdate(id, updatedData, {
    new: true,
    runValidators: true,
  });
};

// Soft delete service
const deleteService = async (id) => {
  return await Service.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );
};

export default {
  createService,
  getActiveServices,
  getAllServices,
  getServiceById,
  getServiceByName,
  updateService,
  deleteService,
};
