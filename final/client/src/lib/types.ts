export type FlowIntensity = 'light' | 'medium' | 'heavy';

export interface PeriodCycle {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string | null;
  period_length: number;
  flow_intensity: FlowIntensity | null;
  notes: string | null;
  created_at: string;
}

export interface DailyLog {
  id: string;
  user_id: string;
  log_date: string;
  mood: string | null;
  symptoms: string[] | null;
  energy_level: number | null;
  sleep_hours: number | null;
  notes: string | null;
  created_at: string;
}

export type PregnancyOutcome = 'live_birth' | 'miscarriage' | 'stillbirth' | 'termination' | 'premature';

export interface PregnancyProfile {
  id: string;
  user_id: string;
  due_date: string;
  lmp_date: string | null;
  conception_date: string | null;
  baby_nickname: string | null;
  outcome: PregnancyOutcome | null;
  outcome_date: string | null;
  created_at: string;
}

export type CervicalMucus = 'dry' | 'sticky' | 'creamy' | 'watery' | 'egg-white';
export type OPKResult = 'positive' | 'negative';

export interface FertilityLog {
  id: string;
  user_id: string;
  log_date: string;
  bbt_temperature: number | null;
  cervical_mucus: CervicalMucus | null;
  opk_result: OPKResult | null;
  had_intercourse: boolean;
  notes: string | null;
  created_at: string;
}

export type ReproductiveStage = 'period' | 'fertility' | 'pregnant' | 'postpartum';

export interface UserState {
  id: string;
  user_id: string;
  stage: ReproductiveStage;
  trying_to_conceive: boolean;
  avg_period_length: number;
  updated_at: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  title: string;
  date: string;
  time: string | null;
  location: string | null;
  notes: string | null;
  completed: boolean;
  created_at: string;
}

export interface WeightEntry {
  id: string;
  user_id: string;
  log_date: string;
  weight_kg: number;
  notes: string | null;
  created_at: string;
}

export interface Medication {
  id: string;
  user_id: string;
  name: string;
  dosage: string | null;
  frequency: string | null;
  time_of_day: string | null;
  notes: string | null;
  active: boolean;
  created_at: string;
}

export interface NutritionLog {
  id: string;
  user_id: string;
  log_date: string;
  water_glasses: number;
  prenatal_vitamin: boolean;
  folic_acid: boolean;
  iron_supplement: boolean;
  meals: string[];
  notes: string | null;
  created_at: string;
}

export interface Symptom {
  id: string;
  user_id: string;
  log_date: string;
  symptom: string;
  notes: string | null;
  created_at: string;
}

export const MUCUS_OPTIONS: { value: CervicalMucus; label: string; fertility: 'low' | 'medium' | 'high' }[] = [
  { value: 'dry', label: 'Dry', fertility: 'low' },
  { value: 'sticky', label: 'Sticky', fertility: 'low' },
  { value: 'creamy', label: 'Creamy', fertility: 'medium' },
  { value: 'watery', label: 'Watery', fertility: 'high' },
  { value: 'egg-white', label: 'Egg White', fertility: 'high' },
];

export type Mood = 'happy' | 'calm' | 'neutral' | 'sad' | 'anxious' | 'irritable';

export const MOOD_OPTIONS: { value: Mood; label: string; emoji: string }[] = [
  { value: 'happy', label: 'Happy', emoji: '😊' },
  { value: 'calm', label: 'Calm', emoji: '😌' },
  { value: 'neutral', label: 'Neutral', emoji: '😐' },
  { value: 'sad', label: 'Sad', emoji: '😢' },
  { value: 'anxious', label: 'Anxious', emoji: '😟' },
  { value: 'irritable', label: 'Irritable', emoji: '😤' },
];

export const SYMPTOM_OPTIONS: string[] = [
  'Cramps', 'Headache', 'Bloating', 'Tender breasts', 'Fatigue',
  'Nausea', 'Backache', 'Acne', 'Cravings', 'Insomnia', 'Mood swings', 'Spotting',
];

// Mood-lift suggestions shown when a patient logs a low mood.
export const MOOD_SUGGESTIONS: Partial<Record<Mood, string[]>> = {
  sad: [
    'Step outside for a few minutes of fresh air and sunlight — natural light can gently lift mood.',
    'Reach out to someone you trust, even a short message; connection helps more than we expect.',
    'Play a favourite song or watch something that makes you smile — small comforts add up.',
    'Try 5 minutes of slow, deep breathing or gentle stretching to release tension.',
    'Write down one thing you\'re grateful for today, however small.',
  ],
  anxious: [
    'Try a short guided meditation or calming music to settle your mind.',
    'Practice box breathing: inhale 4 seconds, hold 4, exhale 4, hold 4 — repeat a few times.',
    'Take a slow walk outside; movement and fresh air can ease anxious energy.',
    'Ground yourself with the 5-4-3-2-1 technique: name 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste.',
    'Limit caffeine for the rest of the day, as it can amplify anxious feelings.',
  ],
  irritable: [
    'Take a short break from whatever is frustrating you — even 10 minutes helps reset your mood.',
    'Try some light physical activity like stretching or a brisk walk to release tension.',
    'Have a glass of water and a light snack — irritability is often tied to hunger or dehydration.',
    'Practice a few slow exhales, longer than your inhales, to calm your nervous system.',
    'Journal what\'s bothering you for a couple of minutes; naming it can take the edge off.',
  ],
};
