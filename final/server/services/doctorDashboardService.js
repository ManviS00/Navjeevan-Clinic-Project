import {
  getTodayAppointments,
  getPendingAppointments,
  getCompletedConsultations,
  getVideoConsultations,
  getPatientsSeenThisMonth,
  getPrescriptionCount,
  getPendingMedicalRecords,
  getDailyAppointments,
  getMonthlyConsultations,
  getTodaySchedule,
  getUpcomingAppointments,
  getRecentPatients,
} from "../repository/doctorDashboardRepository.js";

export const getDoctorDashboardService = async (doctorId, year) => {

  const [
    todayAppointments,
    pendingAppointments,
    completedConsultations,
    videoConsultations,
    patientsSeenThisMonth,
    prescriptionsWritten,
    pendingMedicalRecords,

    dailyAppointments,
    monthlyConsultations,

    todaySchedule,
    upcomingAppointments,
    recentPatients,
  ] = await Promise.all([

    // KPI Cards
    getTodayAppointments(doctorId),
    getPendingAppointments(doctorId),
    getCompletedConsultations(doctorId),
    getVideoConsultations(doctorId),
    getPatientsSeenThisMonth(doctorId),
    getPrescriptionCount(doctorId),
    getPendingMedicalRecords(),

    // Charts
    getDailyAppointments(doctorId),
    getMonthlyConsultations(doctorId, year),

    // Tables
    getTodaySchedule(doctorId),
    getUpcomingAppointments(doctorId),
    getRecentPatients(doctorId),
  ]);

  return {
    cards: {
      todayAppointments,
      pendingAppointments,
      completedConsultations,
      videoConsultations,
      patientsSeenThisMonth,
      prescriptionsWritten,
      pendingMedicalRecords,
    },

    charts: {
      dailyAppointments,
      monthlyConsultations,
    },

    tables: {
      todaySchedule,
      upcomingAppointments,
      recentPatients,
    },
  };
};