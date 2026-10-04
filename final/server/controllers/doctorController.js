import Doctor from "../models/Doctor.js";
import User from "../models/User.js";
import { addDoctorService, 
    getAllDoctorsService, 
    getDoctorByIdService, 
    updateDoctorService,
    deleteDoctorService,
    updateDoctorStatusService,
} from "../services/doctorService.js";

export const addDoctor = async (req, res) => {
  try {
    const result = await addDoctorService(req.body);

      res.status(201).json({
        success: true,
        message: "Doctor account created successfully",
        data: result,
      });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await getAllDoctorsService();

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getDoctorById = async (req, res) => {
  try {
    const doctor = await getDoctorByIdService(req.params.id);

    res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateDoctor = async (req, res) => {
  try {
    const existing = await Doctor.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    if (req.user.role === "doctor" && existing.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "You can only update your own profile" });
    }

    const doctor = await updateDoctorService(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Doctor updated successfully",
      doctor,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteDoctor = async (req, res) => {
  try {
    await deleteDoctorService(req.params.id);

    res.status(200).json({
      success: true,
      message: "Doctor deleted successfully",
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateDoctorStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (typeof status !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Status must be true or false",
      });
    }

    const doctor = await updateDoctorStatusService(
      req.params.id,
      status
    );

    res.status(200).json({
      success: true,
      message: "Doctor status updated successfully",
      doctor,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyDoctorProfile = async (req, res) => {
  try {
    let doctor;

    if (req.user.role === "doctor") {
      doctor = await Doctor.findOne({ user: req.user.id, isDeleted: false });

      // Self-heal a doctor account that exists in User but has no Doctor document.
      if (!doctor) {
        const user = await User.findById(req.user.id);
        if (user) {
          doctor = await Doctor.create({
            user: user._id,
            fullName: user.fullName || "Dr. Aayushi Pal",
            email: user.email,
            phone: user.phone,
            qualification: "MBBS, MS (OBG & GYNAE), DNB",
            specialization: "Consultant Obstetrician & Gynaecologist",
            experience: 10,
            consultationFee: 800,
            registrationNumber: `NVC-DOC-${String(user._id).slice(-6).toUpperCase()}`,
            bio: "Lead Obstetrician & Gynaecologist at Navjeevan Clinic.",
            availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            availableSlots: ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM"],
          });
        }
      }
    } else {
      doctor = await Doctor.findOne({ fullName: /aayushi\s+pal/i, isDeleted: false, status: true })
        || await Doctor.findOne({ isDeleted: false, status: true }).sort({ createdAt: -1 });

      // If the database contains a doctor User but the profile document was lost,
      // restore the profile from that existing account instead of showing an empty page.
      if (!doctor) {
        const doctorUser = await User.findOne({ role: "doctor" }).sort({ createdAt: 1 });
        if (doctorUser) {
          doctor = await Doctor.create({
            user: doctorUser._id,
            fullName: doctorUser.fullName || "Dr. Aayushi Pal",
            email: doctorUser.email,
            phone: doctorUser.phone,
            qualification: "MBBS, MS (OBG & GYNAE), DNB",
            specialization: "Consultant Obstetrician & Gynaecologist",
            experience: 10,
            consultationFee: 800,
            registrationNumber: `NVC-DOC-${String(doctorUser._id).slice(-6).toUpperCase()}`,
            bio: "Lead Obstetrician & Gynaecologist at Navjeevan Clinic.",
            availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            availableSlots: ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM"],
          });
        }
      }

    }

    if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });
    res.json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
