import { useEffect, useState } from "react";
import { Scale, Trash2, TrendingUp } from "lucide-react";

import HealthCard from "./HealthCard";
import CardHeader from "./CardHeader";
import EmptyState from "./EmptyState";
import HealthModal from "./HealthModal";

import { api } from "@/lib/api";
import type { WeightEntry } from "@/lib/types";
import { todayISO, formatDateShort } from "@/lib/date";

export default function WeightCard() {
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [open, setOpen] = useState(false);

  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");

  async function loadWeights() {
    try {
      const data = await api.getWeightEntries();

      data.sort(
        (a, b) =>
          new Date(b.log_date).getTime() -
          new Date(a.log_date).getTime()
      );

      setWeights(data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadWeights();
  }, []);

  async function saveWeight() {
    if (!weight) return;
    if (loggedToday) return;

    await api.createWeightEntry({
      log_date: todayISO(),
      weight_kg: Number(weight),
      notes,
    });

    setWeight("");
    setNotes("");

    setOpen(false);

    loadWeights();
  }

  async function removeWeight(id: string) {
    await api.deleteWeightEntry(id);
    loadWeights();
  }

  const latest = weights[0];
  const loggedToday = weights.some((w) => w.log_date === todayISO());

  return (
    <>
      <HealthModal
        open={open}
        onClose={() => setOpen(false)}
        title="Log Weight"
        subtitle="Track your pregnancy weight"
        icon={<Scale className="w-7 h-7 text-brand-600" />}
      >
        <div className="space-y-5">

          <div>

            <label className="block text-sm font-medium mb-2">
              Weight (kg)
            </label>

            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Enter weight"
              className="w-full rounded-2xl border px-4 py-3"
            />

          </div>

          <div>

            <label className="block text-sm font-medium mb-2">
              Notes
            </label>

            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional..."
              className="w-full rounded-2xl border px-4 py-3"
            />

          </div>

          <div className="flex gap-3 pt-2">

            <button
              onClick={() => setOpen(false)}
              className="flex-1 rounded-xl border py-3"
            >
              Cancel
            </button>

            <button
              onClick={saveWeight}
              className="flex-1 rounded-xl bg-gradient-to-r from-brand-500 to-brand-500 text-white py-3"
            >
              Save Weight
            </button>

          </div>

        </div>
      </HealthModal>

      <HealthCard>

        <CardHeader
          icon={<Scale className="w-7 h-7 text-brand-600" />}
          iconBgClassName="bg-brand-50"
          title="Weight Tracking"
          subtitle="Monitor your pregnancy weight gain"
          buttonText={loggedToday ? "Logged Today ✓" : "+ Log Weight"}
          onClick={() => !loggedToday && setOpen(true)}
          disabled={loggedToday}
        />

        <div className="px-6 pb-6">

          {weights.length === 0 ? (
            <EmptyState
              icon={<TrendingUp className="w-10 h-10 text-brand-400" />}
              bgClassName="bg-brand-50"
              title="No weight entries yet."
              description="Start logging to track your pregnancy weight gain."
            />
          ) : (
            <>
              <div className="rounded-3xl bg-gradient-to-br from-brand-500 to-brand-600 p-6 text-white">

                <p className="text-brand-100">
                  Current Weight
                </p>

                <h2 className="text-5xl font-bold mt-2">
                  {latest.weight_kg}
                  <span className="text-2xl ml-2">
                    kg
                  </span>
                </h2>

                <p className="mt-4 text-brand-100">
                  {formatDateShort(latest.log_date)}
                </p>

              </div>

              <h3 className="font-semibold mt-6 mb-4">
                Recent Entries
              </h3>

              <div className="space-y-3">

                {weights.slice(0, 5).map((entry) => (

                  <div
                    key={entry.id}
                    className="flex justify-between items-center rounded-2xl border border-gray-100 p-4 hover:bg-brand-50 transition"
                  >

                    <div>

                      <h4 className="font-semibold">
                        {entry.weight_kg} kg
                      </h4>

                      <p className="text-sm text-gray-500">
                        {formatDateShort(entry.log_date)}
                      </p>

                      {entry.notes && (
                        <p className="text-sm text-gray-400 mt-1">
                          {entry.notes}
                        </p>
                      )}

                    </div>

                    <button
                      onClick={() => removeWeight(entry.id)}
                      className="rounded-xl p-2 text-gray-400 hover:text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-5 h-5"/>
                    </button>

                  </div>

                ))}

              </div>
            </>
          )}

        </div>

      </HealthCard>
    </>
  );
}