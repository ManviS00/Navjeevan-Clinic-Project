import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { todayISO, formatDateShort } from "@/lib/date";
import type { Symptom } from "@/lib/types";

const symptomOptions = [
  "Nausea",
  "Headache",
  "Back Pain",
  "Fatigue",
  "Dizziness",
  "Heartburn",
  "Swelling",
  "Leg Cramps",
  "Shortness of Breath",
  "Mood Changes",
];

export default function SymptomsTab() {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(symptomOptions[0]);
  const [notes, setNotes] = useState("");

  const fetchSymptoms = useCallback(async () => {
    setLoading(true);
    try {
      setSymptoms(await api.getSymptoms());
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSymptoms();
  }, [fetchSymptoms]);

  async function addSymptom() {
    await api.createSymptom({
      log_date: todayISO(),
      symptom: selected,
      notes,
    });

    setNotes("");
    fetchSymptoms();
  }

    async function deleteSymptom(id: string) {
    await api.deleteSymptom(id);
    fetchSymptoms();
    }

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-5">

      <div className="bg-white rounded-2xl p-6 border">
        <h3 className="text-lg font-semibold mb-4">
          Log Today's Symptoms
        </h3>

        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full border rounded-xl p-3 mb-3"
        >
          {symptomOptions.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>

        <textarea
          placeholder="Additional notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full border rounded-xl p-3 h-24 mb-4"
        />

        <button
          onClick={addSymptom}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-500 text-white hover:bg-brand-600"
        >
          <Plus className="w-5 h-5" />
          Add Symptom
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 border">
        <h3 className="text-lg font-semibold mb-4">
          Symptom History
        </h3>

        {symptoms.length === 0 ? (
          <p className="text-gray-500">
            No symptoms recorded yet.
          </p>
        ) : (
          <div className="space-y-3">
            {symptoms.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center p-4 border rounded-xl"
              >
                <div>
                  <p className="font-semibold">
                    {item.symptom}
                  </p>

                  <p className="text-sm text-gray-500">
                    {formatDateShort(item.log_date)}
                  </p>

                  {item.notes && (
                    <p className="text-sm text-gray-600 mt-1">
                      {item.notes}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => deleteSymptom(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}