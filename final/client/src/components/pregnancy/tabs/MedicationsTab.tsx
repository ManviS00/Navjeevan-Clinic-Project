import { useEffect, useState, useCallback } from 'react';
import { Plus, Pill, X } from 'lucide-react';
import { api } from '@/lib/api';
import type { Medication } from '@/lib/types';
import MedicationModal from './MedicationModal';

export default function MedicationsTab() {
  const [meds, setMeds] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const fetchMeds = useCallback(async () => {
    setLoading(true);
    try { setMeds((await api.getMedications()) as Medication[]); } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchMeds(); }, [fetchMeds]);

  if (loading) return <div className="text-center py-12 text-gray-400">Loading…</div>;

  const active = meds.filter(m => m.active);
  const inactive = meds.filter(m => !m.active);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Medications & Supplements</h2>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-medium transition shadow-md shadow-brand-200">
          <Plus className="w-4 h-4" /> Add Medication
        </button>
      </div>

      {meds.length === 0 ? (
        <div className="bg-white rounded-2xl border border-brand-100 p-8 text-center">
          <Pill className="w-10 h-10 text-brand-200 mx-auto mb-3" />
          <p className="text-gray-500">No medications or supplements logged yet. Track your prenatal vitamins and any prescribed medications.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {active.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Active</h3>
              {active.map((m) => (
                <div key={m.id} className="bg-white rounded-2xl p-4 border border-brand-100 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                    <Pill className="w-5 h-5 text-brand-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{m.name}</p>
                    <p className="text-sm text-gray-400">
                      {m.dosage && `${m.dosage} · `}{m.frequency || 'As needed'}
                      {m.time_of_day && ` · ${m.time_of_day}`}
                    </p>
                    {m.notes && <p className="text-sm text-gray-400 mt-0.5">{m.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={async () => { await api.updateMedication(m.id, { active: false }); fetchMeds(); }}
                      className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                    >
                      Stop
                    </button>
                    <button
                      onClick={async () => { await api.deleteMedication(m.id); fetchMeds(); }}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {inactive.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Inactive</h3>
              {inactive.map((m) => (
                <div key={m.id} className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 opacity-60">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                    <Pill className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-700">{m.name}</p>
                    <p className="text-sm text-gray-400">{m.dosage || ''} {m.frequency || ''}</p>
                  </div>
                  <button
                    onClick={async () => { await api.deleteMedication(m.id); fetchMeds(); }}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showAdd && <MedicationModal onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); fetchMeds(); }} />}
    </div>
  );
}
