import Appointment from "../models/Appointment.js";
import MedicalRecord from "../models/MedicalRecord.js";
import Prescription from "../models/Prescription.js";

//Total Appointments
export const getTotalAppointments = async (patientId) => {
  return await Appointment.countDocuments({
    patient: patientId,
  });
};

//Upcoming Appointments Count
export const getUpcomingAppointmentsCount = async (patientId) => {

  const today = new Date().toISOString().split("T")[0];

  return await Appointment.countDocuments({
    patient: patientId,
    appointmentDate: {
      $gte: today,
    },
    status: {
      $in: ["pending", "confirmed"],
    },
  });

};

//Completed Appointments
export const getCompletedAppointments = async (patientId) => {

  return await Appointment.countDocuments({
    patient: patientId,
    status: "completed",
  });

};

//Video Consultations
export const getVideoConsultations = async (patientId) => {

  return await Appointment.countDocuments({
    patient: patientId,
    appointmentType: "video",
  });

};

//Medical Records Count
export const getMedicalRecordsCount = async (patientId) => {

  return await MedicalRecord.countDocuments({
    patient: patientId,
    isDeleted: false,
  });

};

//Prescription Count
export const getPrescriptionCount = async (patientId) => {

  return await Prescription.countDocuments({
    patient: patientId,
  });

};


// APPOINTMENTS PER MONTH
export const getAppointmentsPerMonth = async (
  patientId,
  year
) => {

  const monthlyData = await Appointment.aggregate([
    {
      $match: {
        patient: patientId,
        appointmentDate: {
          $regex: `^${year}-`,
        },
      },
    },

    {
      $project: {
        month: {
          $month: {
            $dateFromString: {
              dateString: "$appointmentDate",
            },
          },
        },
      },
    },

    {
      $group: {
        _id: "$month",
        appointments: {
          $sum: 1,
        },
      },
    },
  ]);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const monthsToShow =
    Number(year) === currentYear
      ? months.slice(0, currentMonth)
      : months;

  return monthsToShow.map((month, index) => {
    const found = monthlyData.find(
      (m) => m._id === index + 1
    );

    return {
      month,
      appointments: found
        ? found.appointments
        : 0,
    };
  });

};


// APPOINTMENT STATUS DISTRIBUTION
export const getAppointmentStatusDistribution = async (
  patientId
) => {

  return await Appointment.aggregate([
    {
      $match: {
        patient: patientId,
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
        status: "$_id",
        count: 1,
      },
    },
  ]);

};


// UPCOMING APPOINTMENTS
export const getUpcomingAppointments = async (
  patientId
) => {

  const today =
    new Date().toISOString().split("T")[0];

  const appointments =
    await Appointment.find({
      patient: patientId,
      appointmentDate: {
        $gte: today,
      },
      status: {
        $in: ["pending", "confirmed"],
      },
    })
      .select(
        "appointmentNumber appointmentDate timeSlot appointmentType status"
      )
      .populate(
        "doctor",
        "fullName specialization"
      )
      .populate(
        "service",
        "name"
      )
      .sort({
        appointmentDate: 1,
      })
      .limit(5)
      .lean();

  return appointments.map((appointment) => ({
    appointmentNumber:
      appointment.appointmentNumber,

    doctorName:
      appointment.doctor?.fullName ||
      "N/A",

    specialization:
      appointment.doctor
        ?.specialization || "",

    serviceName:
      appointment.service?.name ||
      "N/A",

    appointmentDate:
      appointment.appointmentDate,

    timeSlot:
      appointment.timeSlot,

    appointmentType:
      appointment.appointmentType,

    status:
      appointment.status,
  }));

};


// RECENT MEDICAL RECORDS
export const getRecentMedicalRecords =
  async (patientId) => {

    const records =
      await MedicalRecord.find({
        patient: patientId,
        isDeleted: false,
      })
        .select(
          "title recordType fileName createdAt isVerified"
        )
        .sort({
          createdAt: -1,
        })
        .limit(5)
        .lean();

    return records;
  };