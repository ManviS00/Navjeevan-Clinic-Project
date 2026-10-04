import User from "../models/User.js";
import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";
import MedicalRecord from "../models/MedicalRecord.js";
import Prescription from "../models/Prescription.js";
import Review from "../models/Review.js";
import Service from "../models/Service.js";
import PatientProfile from "../models/PatientProfile.js";
import { NAVJEEVAN_SERVICE_NAMES } from "../utils/dashboard/dashboardConstants.js";

//TOTAL PATIENTS
export const getTotalPatients = async () => {
  const totalPatients = await User.countDocuments({
    role: "patient",
  });

  return totalPatients;
};

//TOTAL DOCTORS
export const getTotalDoctors = async () => {
  const totalDoctors = await Doctor.countDocuments();

  return totalDoctors;
};

// ACTIVE DOCTORS
export const getActiveDoctors = async () => {
  const activeDoctors = await Doctor.countDocuments({
    status: true,
  });

  return activeDoctors;
};

// TOTAL APPOINTMENTS
export const getTotalAppointments = async () => {
  const totalAppointments = await Appointment.countDocuments();

  return totalAppointments;
};

export const getPendingAppointments = async () => Appointment.countDocuments({ status: "pending" });

// TODAY'S APPOINTMENTS
export const getTodayAppointments = async () => {
  const today = new Date().toISOString().split("T")[0];

  const todayAppointments = await Appointment.countDocuments({
    appointmentDate: today,
  });

  return todayAppointments;
};

// COMPLETED APPOINTMENTS
export const getCompletedAppointments = async () => {
  const completedAppointments = await Appointment.countDocuments({
    status: "completed",
  });

  return completedAppointments;
};

// CANCELLED APPOINTMENTS
export const getCancelledAppointments = async () => {
  const cancelledAppointments = await Appointment.countDocuments({
    status: "cancelled",
  });

  return cancelledAppointments;
};

// VIDEO CONSULTATIONS
export const getVideoConsultations = async () => {
  const videoConsultations = await Appointment.countDocuments({
    appointmentType: "video",
  });

  return videoConsultations;
};

// CLINIC CONSULTATIONS
export const getClinicConsultations = async () => {
  const clinicConsultations = await Appointment.countDocuments({
    appointmentType: "clinic",
  });

  return clinicConsultations;
};

// MEDICAL RECORDS COUNT
export const getMedicalRecordsCount = async () => {
  const medicalRecordsCount = await MedicalRecord.countDocuments({
    isDeleted: false,
  });

  return medicalRecordsCount;
};

// PRESCRIPTIONS COUNT
export const getPrescriptionCount = async () => {
  const prescriptionCount = await Prescription.countDocuments();

  return prescriptionCount;
};

// REVIEWS COUNT
export const getTotalReviews = async () => Review.countDocuments();
export const getPendingReviews = async () => Review.countDocuments({ status: "pending" });

// SERVICES COUNT
export const getTotalServices = async () =>
  Service.countDocuments({ name: { $in: NAVJEEVAN_SERVICE_NAMES } });

export const getActiveServices = async () =>
  Service.countDocuments({
    name: { $in: NAVJEEVAN_SERVICE_NAMES },
    isActive: true,
  });


// APPOINTMENTS PER MONTH (ONLY TILL CURRENT MONTH)
export const getAppointmentsPerMonth = async (
  year
) => {
  const appointments = await Appointment.aggregate([
    {
      $match: {
        appointmentDate: {
          $regex: `^${year}-`,
        },
      },
    },
    {
      $group: {
        _id: {
          $substr: ["$appointmentDate", 5, 2],
        },
        appointments: {
          $sum: 1,
        },
      },
    },
  ]);

  // All months
  const allMonths = [
    { monthNumber: "01", month: "Jan" },
    { monthNumber: "02", month: "Feb" },
    { monthNumber: "03", month: "Mar" },
    { monthNumber: "04", month: "Apr" },
    { monthNumber: "05", month: "May" },
    { monthNumber: "06", month: "Jun" },
    { monthNumber: "07", month: "Jul" },
    { monthNumber: "08", month: "Aug" },
    { monthNumber: "09", month: "Sep" },
    { monthNumber: "10", month: "Oct" },
    { monthNumber: "11", month: "Nov" },
    { monthNumber: "12", month: "Dec" },
  ];

  // Current month (1-12)
  const currentMonth = new Date().getMonth() + 1;

  // If selected year is not current year, show all 12 months
  const selectedYear = Number(year);
  const currentYear = new Date().getFullYear();

  const monthsToShow =
    selectedYear === currentYear
      ? allMonths.slice(0, currentMonth)
      : allMonths;

  const appointmentsPerMonth = monthsToShow.map((month) => {
    const found = appointments.find(
      (item) => item._id === month.monthNumber
    );

    return {
      month: month.month,
      appointments: found ? found.appointments : 0,
    };
  });

  return appointmentsPerMonth;
};

// APPOINTMENT STATUS DISTRIBUTION
export const getAppointmentStatusDistribution = async (year) =>{
  const appointmentStatus = await Appointment.aggregate([
    {
      $match: {
        appointmentDate: {
          $regex: `^${year}-`,
        },
      },
    },
    {
      $group: {
        _id: "$status",
        count: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        _id: 0,
        status: {
          $concat: [
            {
              $toUpper: {
                $substrCP: ["$_id", 0, 1],
              },
            },
            {
              $substrCP: [
                "$_id",
                1,
                {
                  $subtract: [
                    { $strLenCP: "$_id" },
                    1,
                  ],
                },
              ],
            },
          ],
        },
        count: 1,
      },
    },
  ]);

  // Ensure all statuses are always returned
  const statuses = [
    "Pending",
    "Confirmed",
    "Completed",
    "Cancelled",
  ];

  const result = statuses.map((status) => {
    const found = appointmentStatus.find(
      (item) => item.status === status
    );

    return {
      status,
      count: found ? found.count : 0,
    };
  });

  return result;
};

// PATIENTS BY AGE GROUP
export const getPatientsByAgeGroup = async () => {
  const ageGroups = await User.aggregate([
    {
      $match: {
        role: "patient",
        dateOfBirth: {
          $ne: null,
        },
      },
    },
    {
      $project: {
        age: {
          $dateDiff: {
            startDate: "$dateOfBirth",
            endDate: "$$NOW",
            unit: "year",
          },
        },
      },
    },
    {
      $project: {
        ageGroup: {
          $switch: {
            branches: [
              {
                case: { $lte: ["$age", 18] },
                then: "0-18",
              },
              {
                case: {
                  $and: [
                    { $gte: ["$age", 19] },
                    { $lte: ["$age", 30] },
                  ],
                },
                then: "19-30",
              },
              {
                case: {
                  $and: [
                    { $gte: ["$age", 31] },
                    { $lte: ["$age", 45] },
                  ],
                },
                then: "31-45",
              },
              {
                case: {
                  $and: [
                    { $gte: ["$age", 46] },
                    { $lte: ["$age", 60] },
                  ],
                },
                then: "46-60",
              },
            ],
            default: "60+",
          },
        },
      },
    },
    {
      $group: {
        _id: "$ageGroup",
        patients: {
          $sum: 1,
        },
      },
    },
  ]);

  const groups = [
    "0-18",
    "19-30",
    "31-45",
    "46-60",
    "60+",
  ];

  const patientsByAgeGroup = groups.map((group) => {
    const found = ageGroups.find(
      (item) => item._id === group
    );

    return {
      ageGroup: group,
      patients: found ? found.patients : 0,
    };
  });

  return patientsByAgeGroup;
};


// PATIENTS BY CITY
// Signup stores city/state/pincode in PatientProfile. Use that persisted address
// for location analytics instead of relying on appointment text fields.
export const getPatientsByCity = async () => {
  const locations = await PatientProfile.aggregate([
    {
      $match: {
        "address.city": { $nin: ["", null] },
      },
    },
    {
      $group: {
        _id: {
          city: "$address.city",
          state: "$address.state",
        },
        patients: { $sum: 1 },
      },
    },
    { $sort: { patients: -1, "_id.city": 1 } },
    { $limit: 10 },
    {
      $project: {
        _id: 0,
        city: "$_id.city",
        state: "$_id.state",
        patients: 1,
      },
    },
  ]);

  return locations;
};

// MOST BOOKED SERVICES
export const getMostBookedServices = async (
  year
) => {
  const mostBookedServices = await Appointment.aggregate([
    {
      $match: {
        appointmentDate: {
          $regex: `^${year}-`,
        },
      },
    },

    {
      $group: {
        _id: "$service",
        appointments: {
          $sum: 1,
        },
      },
    },

    {
      $lookup: {
        from: "services",
        localField: "_id",
        foreignField: "_id",
        as: "serviceDetails",
      },
    },

    {
      $unwind: "$serviceDetails",
    },

    {
      $project: {
        _id: 0,
        service: "$serviceDetails.name",
        appointments: 1,
      },
    },

    {
      $sort: {
        appointments: -1,
      },
    },

    {
      $limit: 5,
    },
  ]);

  return mostBookedServices;
};


// DOCTOR-WISE APPOINTMENTS
export const getDoctorWiseAppointments = async (year) => {
  const doctorWiseAppointments = await Appointment.aggregate([
    // Filter appointments by year
    {
      $match: {
        appointmentDate: {
          $regex: `^${year}-`,
        },
      },
    },

    // Count appointments per doctor
    {
      $group: {
        _id: "$doctor",
        appointments: {
          $sum: 1,
        },
      },
    },

    // Join Doctor collection
    {
      $lookup: {
        from: "doctors",
        localField: "_id",
        foreignField: "_id",
        as: "doctorDetails",
      },
    },

    // Convert array to object
    {
      $unwind: "$doctorDetails",
    },

    // Ignore deleted or inactive doctors
    {
      $match: {
        "doctorDetails.isDeleted": false,
        "doctorDetails.status": true,
      },
    },

    // Return only required fields
    {
      $project: {
        _id: 0,
        doctor: "$doctorDetails.fullName",
        specialization: "$doctorDetails.specialization",
        appointments: 1,
      },
    },

    // Highest appointments first
    {
      $sort: {
        appointments: -1,
      },
    },

    // Top 5 doctors
    {
      $limit: 5,
    },
  ]);

  return doctorWiseAppointments;
};


// MONTHLY PATIENT REGISTRATIONS
export const getPatientsPerMonth = async (year) => {
  const selectedYear = Number(year);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const registrations = await User.aggregate([
    {
      $match: {
        role: "patient",
        createdAt: {
          $gte: new Date(`${selectedYear}-01-01T00:00:00.000Z`),
          $lt: new Date(`${selectedYear + 1}-01-01T00:00:00.000Z`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        patients: { $sum: 1 },
      },
    },
  ]);

  const months = [
    [1, "Jan"], [2, "Feb"], [3, "Mar"], [4, "Apr"], [5, "May"], [6, "Jun"],
    [7, "Jul"], [8, "Aug"], [9, "Sep"], [10, "Oct"], [11, "Nov"], [12, "Dec"],
  ];

  const monthsToShow = selectedYear === currentYear
    ? months.slice(0, currentMonth)
    : months;

  return monthsToShow.map(([monthNumber, month]) => ({
    month,
    patients: registrations.find((item) => item._id === monthNumber)?.patients ?? 0,
  }));
};

// APPOINTMENT TYPE DISTRIBUTION
export const getAppointmentTypeDistribution = async (year) => {
  const result = await Appointment.aggregate([
    { $match: { appointmentDate: { $regex: `^${year}-` } } },
    { $group: { _id: "$appointmentType", count: { $sum: 1 } } },
  ]);

  return ["clinic", "video"].map((type) => ({
    type,
    count: result.find((item) => item._id === type)?.count ?? 0,
  }));
};

// PAYMENT STATUS DISTRIBUTION
export const getPaymentStatusDistribution = async (year) => {
  const result = await Appointment.aggregate([
    { $match: { appointmentDate: { $regex: `^${year}-` } } },
    { $group: { _id: "$paymentStatus", count: { $sum: 1 } } },
  ]);

  return ["paid", "unpaid", "failed"].map((status) => ({
    status,
    count: result.find((item) => item._id === status)?.count ?? 0,
  }));
};

// MONTHLY COLLECTED REVENUE — only appointments marked paid.
export const getRevenuePerMonth = async (year) => {
  const selectedYear = Number(year);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const revenue = await Appointment.aggregate([
    {
      $match: {
        appointmentDate: { $regex: `^${year}-` },
        paymentStatus: "paid",
      },
    },
    {
      $group: {
        _id: { $substr: ["$appointmentDate", 5, 2] },
        revenue: { $sum: { $ifNull: ["$paymentAmount", 0] } },
      },
    },
  ]);

  const months = [
    ["01", "Jan"], ["02", "Feb"], ["03", "Mar"], ["04", "Apr"], ["05", "May"], ["06", "Jun"],
    ["07", "Jul"], ["08", "Aug"], ["09", "Sep"], ["10", "Oct"], ["11", "Nov"], ["12", "Dec"],
  ];

  const monthsToShow = selectedYear === currentYear
    ? months.slice(0, currentMonth)
    : months;

  return monthsToShow.map(([monthNumber, month]) => ({
    month,
    revenue: Number(revenue.find((item) => item._id === monthNumber)?.revenue ?? 0),
  }));
};

// AVERAGE RATING FROM REAL REVIEWS
export const getAverageRating = async () => {
  const result = await Review.aggregate([
    { $match: { rating: { $gte: 1, $lte: 5 } } },
    { $group: { _id: null, average: { $avg: "$rating" } } },
  ]);

  return Number((result[0]?.average ?? 0).toFixed(1));
};

// RECENT APPOINTMENTS
export const getRecentAppointments = async () => {

    const appointments = await Appointment.find()
        .select(
            "appointmentNumber appointmentDate timeSlot appointmentType status"
        )
        .populate("patient", "fullName")
        .populate("doctor", "fullName")
        .populate("service", "name")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

    return appointments.map((appointment) => ({

        appointmentNumber: appointment.appointmentNumber,

        patientName: appointment.patient?.fullName || "N/A",

        doctorName: appointment.doctor?.fullName || "N/A",

        serviceName: appointment.service?.name || "N/A",

        appointmentDate: appointment.appointmentDate,

        timeSlot: appointment.timeSlot,

        appointmentType: appointment.appointmentType,

        status: appointment.status,

    }));
};

// RECENT PATIENTS
export const getRecentPatients = async () => {
  return await User.find({
    role: "patient",
  })
    .select(
      "fullName phone gender profileImage createdAt"
    )
    .sort({
      createdAt: -1,
    })
    .limit(5)
    .lean();
};