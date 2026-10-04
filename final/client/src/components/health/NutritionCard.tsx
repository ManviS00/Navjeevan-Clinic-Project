import { useEffect, useState } from "react";
import { Salad, Trash2, CheckCircle2, Pill, X } from "lucide-react";
import HealthCard from "./HealthCard";
import CardHeader from "./CardHeader";
import HealthModal from "./HealthModal";
import { api } from "@/lib/api";
import type { NutritionLog } from "@/lib/types";
import { todayISO, formatDateShort } from "@/lib/date";

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snacks"] as const;
type MealType = (typeof MEAL_TYPES)[number];

// Personalized, meal-specific ideas so suggestions actually make sense for
// the time of day the patient is logging (e.g. no "grilled fish" for breakfast).
const MEAL_SUGGESTIONS: Record<MealType, { tip: string; ideas: string[] }> = {
  Breakfast: {
    tip: "Start the day with protein and fibre to keep energy steady through the morning.",
    ideas: ["Vegetable poha", "Moong dal chilla", "Oats with milk & fruit", "Boiled eggs & toast", "Idli & sambar"],
  },
  Lunch: {
    tip: "Aim for a balanced plate: whole grains, dal/protein, vegetables and curd.",
    ideas: ["Dal, roti & sabzi", "Rice, rajma & salad", "Curd rice with vegetables", "Khichdi with ghee", "Roti, paneer & greens"],
  },
  Snacks: {
    tip: "Keep snacks light but nourishing — good for managing hunger between meals.",
    ideas: ["Roasted chana", "Fruit chaat", "Sprouts salad", "Nuts & dates", "Buttermilk (chaas)"],
  },
  Dinner: {
    tip: "Keep dinner lighter and earlier in the evening for better digestion and sleep.",
    ideas: ["Vegetable soup & khichdi", "Roti with light sabzi", "Dal & steamed rice", "Grilled paneer & salad", "Curd & fruit"],
  },
};

// A single meal string is stored as "MealType: description". These helpers
// keep that format in one place instead of scattering `startsWith` checks.
function parseMeal(meal: string): { type: string; text: string } {
  const idx = meal.indexOf(":");
  if (idx === -1) return { type: "Other", text: meal };
  return { type: meal.slice(0, idx).trim(), text: meal.slice(idx + 1).trim() };
}

export default function NutritionCard() {
  const [logs, setLogs] = useState<NutritionLog[]>([]);
  const [open, setOpen] = useState(false);
  const [mealType, setMealType] = useState<MealType>("Breakfast");
  const [mealText, setMealText] = useState("");
  const [notes, setNotes] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  async function loadLogs() {
    try { setLogs(await api.getNutritionLogs()); } catch (err) { console.error(err); }
  }
  useEffect(() => { void loadLogs(); }, []);

  async function saveLog() {
    const todayLog = logs.find((l) => l.log_date === todayISO());
    const existingMeals = todayLog?.meals ?? [];
    const otherMeals = existingMeals.filter((m) => !m.startsWith(`${mealType}:`));
    const newMeals = mealText.trim() ? [...otherMeals, `${mealType}: ${mealText.trim()}`] : otherMeals;
    // Only send the actual nutrition fields — never spread the whole
    // `todayLog` object here, since it carries `id`/`user_id`/`created_at`
    // that must not be sent back as part of the log's data.
    await api.upsertNutritionLog({
      log_date: todayISO(),
      water_glasses: todayLog?.water_glasses ?? 0,
      prenatal_vitamin: todayLog?.prenatal_vitamin ?? false,
      folic_acid: todayLog?.folic_acid ?? false,
      iron_supplement: todayLog?.iron_supplement ?? false,
      meals: newMeals,
      notes,
    });
    setMealText(""); setNotes(""); setOpen(false); void loadLogs();
  }

  // Delete a single meal entry (e.g. just today's lunch) rather than the
  // whole day's log.
  async function removeMeal(log: NutritionLog, meal: string) {
    setDeleting(meal);
    try {
      const remainingMeals = log.meals.filter((m) => m !== meal);
      await api.upsertNutritionLog({
        log_date: log.log_date,
        water_glasses: log.water_glasses,
        prenatal_vitamin: log.prenatal_vitamin,
        folic_acid: log.folic_acid,
        iron_supplement: log.iron_supplement,
        meals: remainingMeals,
        notes: log.notes,
      });
      await loadLogs();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  }

  // Delete the entire log entry for a day.
  async function removeLog(id: string) {
    await api.deleteNutritionLog(id);
    void loadLogs();
  }

  const latest = logs[0];
  const suggestion = MEAL_SUGGESTIONS[mealType];

  return <>
    <HealthModal open={open} onClose={() => setOpen(false)} title="Nutrition Log" subtitle="Record meals and nutrition notes" icon={<Salad className="w-7 h-7 text-green-600" />}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Meal</label>
          <select value={mealType} onChange={e => setMealType(e.target.value as MealType)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200">
            {MEAL_TYPES.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div className="rounded-xl bg-green-50 border border-green-100 p-3">
          <p className="text-xs text-gray-600 mb-2">{suggestion.tip}</p>
          <div className="flex flex-wrap gap-1.5">
            {suggestion.ideas.map((idea) => (
              <button
                key={idea}
                type="button"
                onClick={() => setMealText((prev) => (prev.trim() ? `${prev.trim()}, ${idea}` : idea))}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-white border border-green-200 text-green-700 hover:bg-green-100 transition"
              >
                + {idea}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">What did you eat?</label>
          <textarea value={mealText} onChange={e=>setMealText(e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-gray-200" placeholder="e.g. Dal, roti, vegetables and curd" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-gray-200" placeholder="Nutrition notes" />
        </div>
        <button onClick={saveLog} disabled={!mealText.trim()} className="w-full py-3 rounded-xl bg-brand-500 text-white font-semibold disabled:opacity-50">Save Nutrition</button>
      </div>
    </HealthModal>

    <HealthCard>
      <CardHeader icon={<Salad className="w-7 h-7 text-green-600" />} iconBgClassName="bg-green-50" title="Nutrition" subtitle="Track meals and pregnancy nutrition" buttonText="+ Log Meal" onClick={() => setOpen(true)} />
      <div className="px-6 pb-6">
        <div className="rounded-2xl bg-green-50 border border-green-100 p-4 mb-4 flex items-start gap-3">
          <Pill className="w-5 h-5 text-green-600 mt-0.5" />
          <div><p className="font-semibold text-gray-800 text-sm">Keep meals balanced</p><p className="text-xs text-gray-500 mt-1">Include protein, whole grains, vegetables, fruit and iron-rich foods as advised by your clinician.</p></div>
        </div>
        {latest ? <>
          <p className="text-xs text-gray-400 mb-2">Latest log · {formatDateShort(latest.log_date)}</p>
          {latest.meals?.length ? (
            <div className="space-y-2">
              {latest.meals.map((meal, i) => {
                const { type, text } = parseMeal(meal);
                return (
                  <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-gray-50">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    <span className="text-sm text-gray-700 flex-1">
                      <span className="font-medium text-gray-800">{type}:</span> {text}
                    </span>
                    <button
                      onClick={() => removeMeal(latest, meal)}
                      disabled={deleting === meal}
                      title={`Delete ${type.toLowerCase()} entry`}
                      className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : <p className="text-sm text-gray-400">No meals logged yet.</p>}
          <div className="mt-4 text-sm text-gray-500">{latest.notes || "Add a meal log to keep your nutrition history organized."}</div>
          <button onClick={() => removeLog(latest.id)} className="mt-3 text-xs text-gray-400 hover:text-red-500 flex items-center gap-1"><Trash2 className="w-3.5 h-3.5"/> Delete entire log</button>
        </> : <p className="text-sm text-gray-400">No nutrition logs yet.</p>}
      </div>
    </HealthCard>
  </>;
}
