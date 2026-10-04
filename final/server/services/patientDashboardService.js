import {
  getTotalAppointments,
  getUpcomingAppointmentsCount,
  getCompletedAppointments,
  getVideoConsultations,
  getMedicalRecordsCount,
  getPrescriptionCount,
  getAppointmentsPerMonth,
  getAppointmentStatusDistribution,
  getUpcomingAppointments,
  getRecentMedicalRecords,
} from "../repository/patientDashboardRepository.js";

export const getPatientDashboardService = async (
  patientId,
  year
) => {

  const [
    totalAppointments,
    upcomingAppointmentsCount,
    completedAppointments,
    videoConsultations,
    medicalRecords,
    prescriptions,

    appointmentsPerMonth,
    appointmentStatusDistribution,

    upcomingAppointments,
    recentMedicalRecords,
  ] = await Promise.all([

    // KPI Cards
    getTotalAppointments(patientId),
    getUpcomingAppointmentsCount(patientId),
    getCompletedAppointments(patientId),
    getVideoConsultations(patientId),
    getMedicalRecordsCount(patientId),
    getPrescriptionCount(patientId),

    // Charts
    getAppointmentsPerMonth(patientId, year),
    getAppointmentStatusDistribution(patientId),

    // Tables
    getUpcomingAppointments(patientId),
    getRecentMedicalRecords(patientId),
  ]);

  return {
    cards: {
      totalAppointments,
      upcomingAppointments: upcomingAppointmentsCount,
      completedAppointments,
      videoConsultations,
      medicalRecords,
      prescriptions,
    },

    charts: {
      appointmentsPerMonth,
      appointmentStatusDistribution,
    },

    tables: {
      upcomingAppointments,
      recentMedicalRecords,
    },
  };
};