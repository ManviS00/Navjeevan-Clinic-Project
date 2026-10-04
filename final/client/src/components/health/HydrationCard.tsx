import { useEffect, useState } from "react";
import { Droplet } from "lucide-react";

import HealthCard from "./HealthCard";
import CardHeader from "./CardHeader";
import { api } from "@/lib/api";
import { todayISO } from "@/lib/date";

export default function HydrationCard() {
  const [water, setWater] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getNutritionLogs().then((logs) => {
      const today = logs.find((l) => l.log_date === todayISO());
      setWater(today?.water_glasses ?? 0);
    }).catch(() => {});
  }, []);

  async function persistWater(next: number) {
    setWater(next);
    setSaving(true);
    try {
      const logs = await api.getNutritionLogs();
      const today = logs.find((l) => l.log_date === todayISO());
      // Only send the actual data fields (never the full record, which also
      // carries id/user_id/created_at) so a stale id can't leak into the
      // saved entry and later break "latest log" lookups elsewhere.
      await api.upsertNutritionLog({
        log_date: todayISO(),
        prenatal_vitamin: today?.prenatal_vitamin ?? false,
        folic_acid: today?.folic_acid ?? false,
        iron_supplement: today?.iron_supplement ?? false,
        meals: today?.meals ?? [],
        notes: today?.notes ?? null,
        water_glasses: next,
      });
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  }

  const goal = 10;
  const circumference = 2 * Math.PI * 54;
  const progress = Math.min(water / goal, 1);
  const reachedGoal = water >= goal;
  const overGoal = water > goal;

  function logGlass() {
    // Keep counting glasses (and updating the circle) even past the
    // daily goal — only the numbered grid buttons below are capped at 10.
    void persistWater(water + 1);
  }

  function selectGlass(n: number) {
    void persistWater(water === n ? n - 1 : n);
  }

  return (
    <HealthCard>
      <CardHeader
        icon={<Droplet className="w-7 h-7 text-blue-500" />}
        iconBgClassName="bg-blue-50"
        title="Hydration"
        subtitle="Stay hydrated for a healthy pregnancy"
        buttonText={saving ? "Saving…" : "+ Log Water"}
        onClick={logGlass}
      />

      <div className="px-6 pb-6">

        <p className="text-gray-500 mb-5">
          Aim for 8–10 glasses of water daily
        </p>

        {reachedGoal && !overGoal && (
          <div className="mb-5 p-3 rounded-xl bg-blue-50 text-blue-700 text-sm font-medium text-center">
            💧 Amazing! You've hit your goal for today. Your body thanks you!
          </div>
        )}
        {overGoal && (
          <div className="mb-5 p-3 rounded-xl bg-blue-50 text-blue-700 text-sm font-medium text-center">
            You've passed today's 10-glass goal — {water} glasses logged. Great job staying hydrated!
          </div>
        )}

        <div className="flex items-center justify-between gap-6">

          <div className="grid grid-cols-5 gap-2 flex-1">

            {Array.from({ length: goal }).map((_, index) => {
              const n = index + 1;
              const filled = n <= water;

              return (
                <button
                  key={n}
                  onClick={() => selectGlass(n)}
                  className={`h-12 rounded-xl flex items-center justify-center font-semibold transition ${
                    filled
                      ? "bg-blue-500 text-white shadow-sm"
                      : "bg-blue-50 text-blue-400 hover:bg-blue-100"
                  }`}
                >
                  {n}
                </button>
              );
            })}

          </div>

          <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">

            <svg viewBox="0 0 120 120" className="w-28 h-28 -rotate-90">

              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#dbeafe"
                strokeWidth="8"
              />

              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress)}
                className="transition-all duration-500"
              />

            </svg>

            <div className="absolute flex flex-col items-center">
              <Droplet className="w-5 h-5 text-blue-500 mb-0.5" fill="currentColor" />
              <span className="text-2xl font-bold text-gray-900 leading-none">
                {water}
              </span>
              <span className="text-xs text-gray-400 mt-0.5">
                / {goal}
              </span>
            </div>

          </div>

        </div>

      </div>

    </HealthCard>
  );
}