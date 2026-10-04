import Appointment from "../models/Appointment.js";
import Prescription from "../models/Prescription.js";
import MedicalRecord from "../models/MedicalRecord.js";

//Today Appointments
export const getTodayAppointments = async (doctorId) => {

    const today = new Date().toISOString().split("T")[0];

    return await Appointment.countDocuments({
        doctor: doctorId,
        appointmentDate: today,
    });

};

//Pending Appointments
export const getPendingAppointments = async (doctorId) => {

    return await Appointment.countDocuments({
        doctor: doctorId,
        status: "pending",
    });

};

//Completed Consultations
export const getCompletedConsultations = async (doctorId) => {

    return await Appointment.countDocuments({
        doctor: doctorId,
        status: "completed",
    });

};

//Video Consultations
export const getVideoConsultations = async (doctorId) => {

    return await Appointment.countDocuments({
        doctor: doctorId,
        appointmentType: "video",
    });

};

//Patients Seen This Month
export const getPatientsSeenThisMonth = async (doctorId) => {

    const now = new Date();

    const month = String(now.getMonth() + 1).padStart(2, "0");

    const year = now.getFullYear();

    const appointments = await Appointment.distinct("patient", {
        doctor: doctorId,
        status: "completed",
        appointmentDate: {
            $regex: `^${year}-${month}`,
        },
    });

    return appointments.length;

};

//Prescription Count
export const getPrescriptionCount = async (doctorId) => {

    return await Prescription.countDocuments({
        doctor: doctorId,
    });

};

//Pending Medical Records
export const getPendingMedicalRecords = async () => {

    return await MedicalRecord.countDocuments({
        isVerified: false,
        isDeleted: false,
    });

};

// DAILY APPOINTMENTS (LAST 7 DAYS)
export const getDailyAppointments = async (doctorId) => {
  const result = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const formattedDate = date.toISOString().split("T")[0];

    const count = await Appointment.countDocuments({
      doctor: doctorId,
      appointmentDate: formattedDate,
    });

    result.push({
      date: formattedDate,
      appointments: count,
    });
  }

  return result;
};

// MONTHLY CONSULTATIONS
export const getMonthlyConsultations = async (
  doctorId,
  year
) => {
  const monthlyData = await Appointment.aggregate([
    {
      $match: {
        doctor: doctorId,
        appointmentDate: {
          $regex: `^${year}-`,
        },
        status: "completed",
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
        consultations: {
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
      consultations: found ? found.consultations : 0,
    };
  });
};


// TODAY'S SCHEDULE
export const getTodaySchedule = async (
  doctorId
) => {
  const today = new Date().toISOString().split("T")[0];

  const appointments = await Appointment.find({
    doctor: doctorId,
    appointmentDate: today,
  })
    .select(
      "appointmentNumber appointmentDate timeSlot appointmentType status"
    )
    .populate("patient", "fullName")
    .populate("service", "name")
    .sort({
      timeSlot: 1,
    })
    .lean();

  return appointments.map((appointment) => ({
    appointmentNumber:
      appointment.appointmentNumber,

    patientName:
      appointment.patient?.fullName || "N/A",

    serviceName:
      appointment.service?.name || "N/A",

    appointmentDate:
      appointment.appointmentDate,

    timeSlot: appointment.timeSlot,

    appointmentType:
      appointment.appointmentType,

    status: appointment.status,
  }));
};


// UPCOMING APPOINTMENTS
export const getUpcomingAppointments =
  async (doctorId) => {
    const today =
      new Date().toISOString().split("T")[0];

    const appointments =
      await Appointment.find({
        doctor: doctorId,
        appointmentDate: {
          $gt: today,
        },
      })
        .select(
          "appointmentNumber appointmentDate timeSlot appointmentType status"
        )
        .populate(
          "patient",
          "fullName"
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

    return appointments.map(
      (appointment) => ({
        appointmentNumber:
          appointment.appointmentNumber,

        patientName:
          appointment.patient
            ?.fullName || "N/A",

        serviceName:
          appointment.service
            ?.name || "N/A",

        appointmentDate:
          appointment.appointmentDate,

        timeSlot:
          appointment.timeSlot,

        appointmentType:
          appointment.appointmentType,

        status: appointment.status,
      })
    );
  };


  // RECENT PATIENTS
export const getRecentPatients = async (
  doctorId
) => {
  const appointments =
    await Appointment.find({
      doctor: doctorId,
      status: "completed",
    })
      .sort({
        completedAt: -1,
      })
      .populate(
        "patient",
        "fullName phone gender profileImage"
      )
      .limit(5)
      .lean();

  return appointments.map(
    (appointment) => ({
      patientId:
        appointment.patient?._id,

      fullName:
        appointment.patient
          ?.fullName || "N/A",

      phone:
        appointment.patient
          ?.phone || "",

      gender:
        appointment.patient
          ?.gender || "",

      profileImage:
        appointment.patient
          ?.profileImage || "",
    })
  );
};
