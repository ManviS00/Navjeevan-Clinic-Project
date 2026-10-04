import mongoose from "mongoose";

import {
  getDoctorAvailabilityService,
  bookAppointmentService,
  getMyAppointmentsService,
  getAllAppointmentsService,
  getAppointmentByIdService,
  cancelAppointmentService,
  updateAppointmentStatusService,
  getVideoAccessService,
  rescheduleAppointmentService,
} from "../services/appointmentService.js";

// GET /api/appointments/availability/:doctorId?date=YYYY-MM-DD
export const getDoctorAvailability = async (req, res) => {
  try {

    if (!mongoose.Types.ObjectId.isValid(req.params.doctorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID.",
      });
    }
    const availability = await getDoctorAvailabilityService(
      req.params.doctorId,
      req.query.date
    );

    res.status(200).json({
      success: true,
      data: availability,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// POST /api/appointments (patient books an appointment)
export const bookAppointment = async (req, res) => {
  try {
    const appointment = await bookAppointmentService(req.user.id, req.body);

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      data: appointment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/appointments/:id/video-access
export const getVideoAccess = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid appointment ID." });
    }
    const access = await getVideoAccessService(req.params.id, req.user);
    res.status(200).json({ success: true, data: access });
  } catch (error) {
    res.status(403).json({ success: false, message: error.message });
  }
};

// GET /api/appointments/my (logged-in patient's own appointments)
export const getMyAppointments = async (req, res) => {
  try {
    const appointments = await getMyAppointmentsService(req.user.id);

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/appointments (admin/doctor - all appointments, optional filters)
export const getAllAppointments = async (req, res) => {
  try {
    const { doctorId, status, date } = req.query;
    const effectiveDoctorId = req.user.role === "doctor" ? req.user.id : doctorId;

    const appointments = await getAllAppointmentsService({
      doctorId: effectiveDoctorId,
      status,
      date,
      requester: req.user,
    });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/appointments/:id
export const getAppointmentById = async (req, res) => {
  try {

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID.",
      });
    }
    const appointment = await getAppointmentByIdService(req.params.id);

    // Patients may only view their own appointment
    if (
      req.user.role === "patient" &&
      appointment.patient._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};


// PATCH /api/appointments/:id/reschedule
export const rescheduleAppointment = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid appointment ID." });
    const appointment = await rescheduleAppointmentService(req.params.id, req.user, req.body);
    res.status(200).json({ success: true, message: "Appointment rescheduled successfully", data: appointment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PATCH /api/appointments/:id/cancel
export const cancelAppointment = async (req, res) => {
  try {

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID.",
      });
    }
    const appointment = await cancelAppointmentService(
      req.params.id,
      req.user,
      req.body.reason
    );

    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      data: appointment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// PATCH /api/appointments/:id/status  (admin/doctor only)
export const updateAppointmentStatus = async (req, res) => {
  try {

    const allowedStatuses = [
        "pending",
        "confirmed",
        "completed",
        "cancelled",
    ];

    if (!allowedStatuses.includes(req.body.status)) {
        return res.status(400).json({
        success: false,
        message: "Invalid appointment status.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID.",
      });
    }
    const appointment = await updateAppointmentStatusService(
      req.params.id,
      req.body.status,
      req.user
    );

    res.status(200).json({
      success: true,
      message: "Appointment status updated",
      data: appointment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
