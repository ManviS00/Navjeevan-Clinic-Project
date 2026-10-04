import type {
  PeriodCycle,
  DailyLog,
  PregnancyProfile,
  FertilityLog,
  UserState,
  Appointment,
  WeightEntry,
  Medication,
  NutritionLog,
  Symptom,
} from "@/lib/types";

const API_URL =
  (import.meta.env.VITE_API_URL as string) ||
  "http://localhost:5000/api";

function getToken(): string | null {
  return localStorage.getItem("navjeevan_backend_token");
}

export function setToken(token: string) {
  localStorage.setItem("navjeevan_backend_token", token);
}

export function clearToken() {
  localStorage.removeItem("navjeevan_backend_token");
  localStorage.removeItem("lumina_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string>) },
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.message || body.error || `Request failed (${res.status})`);
  }
  return body as T;
}

function unwrap<T>(body: any, fallback: T): T {
  return body?.data ?? body?.user ?? body ?? fallback;
}

function isoDate(value: any): string {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value).slice(0, 10) : d.toISOString().slice(0, 10);
}

function mapPeriod(p: any): PeriodCycle {
  return {
    id: String(p._id ?? p.id),
    user_id: String(p.user ?? p.user_id ?? ""),
    start_date: isoDate(p.startDate ?? p.start_date),
    end_date: p.endDate ?? p.end_date ? isoDate(p.endDate ?? p.end_date) : null,
    period_length: Number(p.periodLength ?? p.period_length ?? 0),
    flow_intensity: p.flow ?? p.flow_intensity ?? null,
    notes: p.notes ?? null,
    created_at: p.createdAt ?? p.created_at ?? new Date().toISOString(),
  };
}

function mapFertility(f: any): FertilityLog {
  const mucusMap: Record<string, string> = {
    Dry: "dry", Sticky: "sticky", Creamy: "creamy", Watery: "watery", "Egg White": "egg-white",
  };
  const opkMap: Record<string, string> = { Positive: "positive", Negative: "negative" };
  return {
    id: String(f._id ?? f.id),
    user_id: String(f.user ?? f.user_id ?? ""),
    log_date: isoDate(f.logDate ?? f.log_date),
    bbt_temperature: f.bbtTemperature ?? f.bbt_temperature ?? null,
    cervical_mucus: mucusMap[f.cervicalMucus] ?? f.cervical_mucus ?? null,
    opk_result: opkMap[f.ovulationTest] ?? f.opk_result ?? null,
    had_intercourse: Boolean(f.hadIntercourse ?? f.had_intercourse ?? false),
    notes: f.notes ?? null,
    created_at: f.createdAt ?? f.created_at ?? new Date().toISOString(),
  };
}

function mapPregnancy(p: any): PregnancyProfile {
  if (!p) return p;
  const outcomeMap: Record<string, string> = {
    LiveBirth: "live_birth", Miscarriage: "miscarriage", Stillbirth: "stillbirth",
    Termination: "termination", Premature: "premature",
  };
  return {
    id: String(p._id ?? p.id),
    user_id: String(p.user ?? p.user_id ?? ""),
    due_date: isoDate(p.expectedDeliveryDate ?? p.due_date),
    lmp_date: p.lastMenstrualPeriod ? isoDate(p.lastMenstrualPeriod) : (p.lmp_date ?? null),
    conception_date: p.conceptionDate ? isoDate(p.conceptionDate) : (p.conception_date ?? null),
    baby_nickname: p.babyDetails?.babyName ?? p.baby_nickname ?? null,
    outcome: outcomeMap[p.outcome] ?? p.outcome ?? null,
    outcome_date: p.outcomeDate ? isoDate(p.outcomeDate) : (p.outcome_date ?? null),
    created_at: p.createdAt ?? p.created_at ?? new Date().toISOString(),
  };
}

function mapWellness(w: any): DailyLog {
  return {
    id: String(w._id ?? w.id),
    user_id: String(w.user ?? w.user_id ?? ""),
    log_date: isoDate(w.date ?? w.log_date),
    mood: typeof w.mood === "string" ? w.mood.toLowerCase() : null,
    symptoms: w.symptoms ?? null,
    energy_level: w.energyLevel ?? w.energy_level ?? null,
    sleep_hours: w.sleepHours ?? w.sleep_hours ?? null,
    notes: w.notes ?? null,
    created_at: w.createdAt ?? w.created_at ?? new Date().toISOString(),
  };
}

function mapAppointment(a: any): Appointment {
  return {
    id: String(a._id ?? a.id),
    user_id: String(a.patient?._id ?? a.patient ?? a.user_id ?? ""),
    title: a.service?.name ?? a.title ?? "Appointment",
    date: a.appointmentDate ?? a.date ?? "",
    time: a.timeSlot ?? a.time ?? null,
    location: a.appointmentType === "video" ? "Video consultation" : "Navjeevan Clinic",
    notes: a.notes ?? a.consultationReason ?? null,
    completed: a.status === "completed",
    created_at: a.createdAt ?? a.created_at ?? new Date().toISOString(),
  };
}

function toPeriodPayload(data: any) {
  const startDate = data.start_date ?? data.startDate;
  const periodLength = Number(data.period_length ?? data.periodLength ?? 5);
  const cycleLength = Number(data.cycle_length ?? data.cycleLength ?? 28);
  const d = new Date(`${startDate}T00:00:00`);
  const end = new Date(d);
  end.setDate(end.getDate() + periodLength - 1);
  return {
    startDate,
    endDate: data.end_date ?? data.endDate ?? end.toISOString().slice(0, 10),
    periodLength,
    cycleLength,
    flow: data.flow_intensity ?? data.flow ?? "medium",
    symptoms: data.symptoms ?? [],
    notes: data.notes ?? "",
  };
}

function toFertilityPayload(data: any) {
  const mucus: Record<string, string> = {
    dry: "Dry", sticky: "Sticky", creamy: "Creamy", watery: "Watery", "egg-white": "Egg White",
  };
  const opk: Record<string, string> = { positive: "Positive", negative: "Negative" };
  return {
    logDate: data.log_date ?? data.logDate,
    cervicalMucus: mucus[data.cervical_mucus] ?? data.cervicalMucus ?? "Dry",
    ovulationTest: opk[data.opk_result] ?? data.ovulationTest ?? "Not Taken",
    symptoms: data.symptoms ?? [],
    notes: data.notes ?? "",
    pregnancyConfirmed: Boolean(data.pregnancyConfirmed ?? false),
  };
}

function toPregnancyPayload(data: any) {
  const due = data.due_date ?? data.expectedDeliveryDate;
  const lmp = data.lmp_date
    ? new Date(`${data.lmp_date}T00:00:00`)
    : (() => { const d = new Date(`${due}T00:00:00`); d.setDate(d.getDate() - 280); return d; })();
  const today = new Date();
  const daysPregnant = Math.max(1, Math.floor((today.getTime() - lmp.getTime()) / 86400000) + 1);
  const week = Math.min(42, Math.max(1, Math.floor((daysPregnant - 1) / 7) + 1));
  const day = Math.min(7, Math.max(1, ((daysPregnant - 1) % 7) + 1));
  return {
    lastMenstrualPeriod: lmp.toISOString(),
    expectedDeliveryDate: due,
    pregnancyWeek: week,
    pregnancyDay: day,
    pregnancyStatus: "Active",
    babyDetails: { babyCount: 1, babyName: data.baby_nickname ?? data.babyDetails?.babyName ?? "" },
  };
}

function mapState(s: any): UserState {
  const stage = s.isPregnant ? "pregnant" : (s.isFertilityWindow ? "fertility" : "period");
  return {
    id: String(s._id ?? s.id),
    user_id: String(s.user?._id ?? s.user ?? s.user_id ?? ""),
    stage,
    trying_to_conceive: stage === "fertility",
    avg_period_length: 28,
    updated_at: s.updatedAt ?? s.updated_at ?? new Date().toISOString(),
  };
}

export interface AuthUser {
  id: string;
  email: string;
  date_of_birth: string | null;
  age: number | null;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export type AccessReason = "age" | "active_period" | "postpartum" | null;

export interface AccessInfo {
  age: number | null;
  access: { period: boolean; fertility: boolean; pregnancy: boolean };
  pregnancyGate: { canConfirmPregnant: boolean; reason: AccessReason; until: string | null };
}

type NewRecord<T> = Partial<Omit<T, "id" | "user_id" | "created_at">>;

export const api = {
  getMe: () => request<{ user: AuthUser }>("/user/profile"),

  setDateOfBirth: async (date_of_birth: string) => {
    const body = await request<any>("/auth/dob", { method: "PUT", body: JSON.stringify({ date_of_birth }) });
    const u = body.user ?? body;
    return { user: { id: String(u.id ?? u._id), email: u.email ?? "", date_of_birth: u.date_of_birth ?? null, age: u.age ?? null } };
  },

  getAccess: async (): Promise<AccessInfo> => {
    const body = await request<any>("/patient-state/me");
    const s = unwrap(body, {});
    const cached = JSON.parse(localStorage.getItem("lumina_user") || localStorage.getItem("navjeevan_backend_user") || "{}");
    const age = cached.age ?? null;
    const until = s.recoveryEndDate ? isoDate(s.recoveryEndDate) : null;
    return {
      age,
      access: {
        period: s.canUsePeriodTracker !== false,
        fertility: s.canUseFertilityTracker !== false,
        pregnancy: s.canUsePregnancyTracker !== false,
      },
      pregnancyGate: {
        canConfirmPregnant: !s.isPregnant && !s.hasActivePeriod && !s.isRecoveryPeriod,
        reason: s.isRecoveryPeriod ? "postpartum" : (s.hasActivePeriod ? "active_period" : null),
        until,
      },
    };
  },

  getUserState: async () => {
    const body = await request<any>("/patient-state/me");
    return mapState(unwrap(body, {}));
  },

  updateUserState: async (data: NewRecord<UserState>) => {
    const body = await request<any>("/patient-state/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return mapState(unwrap(body, {}));
  },

  getPeriodCycles: async () => {
    const body = await request<any>("/periods/my");
    return (unwrap(body, []) || []).map(mapPeriod);
  },

  createPeriodCycle: async (data: NewRecord<PeriodCycle>) => {
    const body = await request<any>("/periods", { method: "POST", body: JSON.stringify(toPeriodPayload(data)) });
    return mapPeriod(unwrap(body, {}));
  },

  updatePeriodCycle: async (id: string, data: NewRecord<PeriodCycle>) => {
    const body = await request<any>(`/periods/${id}`, { method: "PUT", body: JSON.stringify(toPeriodPayload(data)) });
    return mapPeriod(unwrap(body, {}));
  },

  deletePeriodCycle: async (id: string) => {
    await request<any>(`/periods/${id}`, { method: "DELETE" });
    return { ok: true as const };
  },

  getDailyLogs: async (limit = 30) => {
    const body = await request<any>("/wellness/my-logs");
    return (unwrap(body, []) || []).slice(0, limit).map(mapWellness);
  },

  createDailyLog: async (data: NewRecord<DailyLog>) => {
    const body = await request<any>("/wellness/log", {
      method: "POST",
      body: JSON.stringify({
        date: data.log_date ?? new Date().toISOString().slice(0, 10),
        mood: String(data.mood ?? "neutral").replace(/^./, (c) => c.toUpperCase()),
        symptoms: data.symptoms ?? [],
        energyLevel: Number(data.energy_level ?? 3),
        sleepHours: Number(data.sleep_hours ?? 0),
        notes: data.notes ?? "",
      }),
    });
    return mapWellness(unwrap(body, {}));
  },

  updateDailyLog: async (id: string, data: NewRecord<DailyLog>) => {
    const body = await request<any>(`/wellness/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        date: data.log_date,
        mood: String(data.mood ?? "neutral").replace(/^./, (c) => c.toUpperCase()),
        symptoms: data.symptoms ?? [],
        energyLevel: Number(data.energy_level ?? 3),
        sleepHours: Number(data.sleep_hours ?? 0),
        notes: data.notes ?? "",
      }),
    });
    return mapWellness(unwrap(body, {}));
  },

  deleteDailyLog: async (id: string) => {
    await request<any>(`/wellness/${id}`, { method: "DELETE" });
    return { ok: true as const };
  },

  getPregnancyProfile: async () => {
    try {
      const body = await request<any>("/pregnancy/active");
      return mapPregnancy(unwrap(body, null));
    } catch (e: any) {
      if (String(e.message).includes("No active pregnancy")) return null;
      throw e;
    }
  },

  upsertPregnancyProfile: async (data: NewRecord<PregnancyProfile>) => {
    const payload = toPregnancyPayload(data);
    let body: any;
    try {
      const existing = await api.getPregnancyProfile();
      if (existing?.id) {
        body = await request<any>(`/pregnancy/${existing.id}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        body = await request<any>("/pregnancy", { method: "POST", body: JSON.stringify(payload) });
      }
    } catch (e) {
      body = await request<any>("/pregnancy", { method: "POST", body: JSON.stringify(payload) });
    }
    return mapPregnancy(unwrap(body, {}));
  },

  getFertilityLogs: async (limit = 60) => {
    const body = await request<any>("/fertility/my");
    return (unwrap(body, []) || []).slice(0, limit).map(mapFertility);
  },

  createFertilityLog: async (data: NewRecord<FertilityLog>) => {
    const body = await request<any>("/fertility", { method: "POST", body: JSON.stringify(toFertilityPayload(data)) });
    return mapFertility(unwrap(body, {}));
  },

  updateFertilityLog: async (id: string, data: NewRecord<FertilityLog>) => {
    const body = await request<any>(`/fertility/${id}`, { method: "PUT", body: JSON.stringify(toFertilityPayload(data)) });
    return mapFertility(unwrap(body, {}));
  },

  deleteFertilityLog: async (id: string) => {
    await request<any>(`/fertility/${id}`, { method: "DELETE" });
    return { ok: true as const };
  },

  getAppointments: async () => {
    const body = await request<any>("/appointments/my");
    return (unwrap(body, []) || []).map(mapAppointment);
  },

  createAppointment: async (data: NewRecord<Appointment>) => {
    const body = await request<any>("/appointments", { method: "POST", body: JSON.stringify(data) });
    return mapAppointment(unwrap(body, {}));
  },

  updateAppointment: async (id: string, data: NewRecord<Appointment>) => {
    const body = await request<any>(`/appointments/${id}`, { method: "PUT", body: JSON.stringify(data) });
    return mapAppointment(unwrap(body, {}));
  },

  deleteAppointment: async (id: string) => {
    await request<any>(`/appointments/${id}/cancel`, { method: "PATCH", body: JSON.stringify({ reason: "Cancelled by patient" }) });
    return { ok: true as const };
  },

  getWeightEntries: async (): Promise<WeightEntry[]> => {
    const b = await request<any>("/health/weight");
    return unwrap(b, []);
  },
  createWeightEntry: async (data: NewRecord<WeightEntry>): Promise<WeightEntry> => {
    const b = await request<any>("/health/weight", {method:"POST",body:JSON.stringify(data)});
    return unwrap(b, {});
  },
  deleteWeightEntry: async (id: string) => { await request(`/health/weight/${id}`,{method:"DELETE"}); return {ok:true as const}; },

  getMedications: async (): Promise<Medication[]> => {
    const b=await request<any>("/health/medication"); return unwrap(b,[]);
  },
  createMedication: async (data: NewRecord<Medication>): Promise<Medication> => {
    const b=await request<any>("/health/medication",{method:"POST",body:JSON.stringify(data)}); return unwrap(b,{});
  },
  updateMedication: async (id: string, data: NewRecord<Medication>): Promise<Medication> => {
    const b=await request<any>(`/health/medication/${id}`,{method:"PUT",body:JSON.stringify(data)}); return unwrap(b,{});
  },
  deleteMedication: async (id: string) => { await request(`/health/medication/${id}`,{method:"DELETE"}); return {ok:true as const}; },

  getNutritionLogs: async (): Promise<NutritionLog[]> => {
    const b=await request<any>("/health/nutrition"); return unwrap(b,[]);
  },
  upsertNutritionLog: async (data: NewRecord<NutritionLog>): Promise<NutritionLog> => {
    const b=await request<any>("/health/nutrition",{method:"POST",body:JSON.stringify(data)}); return unwrap(b,{});
  },
  deleteNutritionLog: async (id: string) => { await request(`/health/nutrition/${id}`,{method:"DELETE"}); return {ok:true as const}; },

  getSymptoms: async (): Promise<Symptom[]> => {
    const b=await request<any>("/health/symptom"); return unwrap(b,[]);
  },
  createSymptom: async (data: NewRecord<Symptom>): Promise<Symptom> => {
    const b=await request<any>("/health/symptom",{method:"POST",body:JSON.stringify(data)}); return unwrap(b,{});
  },
  updateSymptom: async (id: string, data: NewRecord<Symptom>): Promise<Symptom> => {
    const b=await request<any>(`/health/symptom/${id}`,{method:"PUT",body:JSON.stringify(data)}); return unwrap(b,{});
  },
  deleteSymptom: async (id: string) => { await request(`/health/symptom/${id}`,{method:"DELETE"}); return {ok:true as const}; },
};
