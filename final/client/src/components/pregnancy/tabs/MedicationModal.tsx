import { useState } from 'react';
import { X } from 'lucide-react';
import { api } from '@/lib/api';

export default function MedicationModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [frequency, setFrequency] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true); setError(null);
    try {
      await api.createMedication({
        name, dosage: dosage || null, frequency: frequency || null,
        time_of_day: timeOfDay || null, notes: `${notes || ''}${weight || height ? `\nPatient context: weight ${weight || '—'} kg, height ${height || '—'} cm.` : ''}`.trim() || null, active: true,
      });
      setSaving(false); onSaved();
    } catch (err) { setSaving(false); setError((err as Error).message); }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Add Medication</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none" placeholder="Prenatal vitamin, Folic acid, etc." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Dosage (mg)</label>
              <input type="text" value={dosage} onChange={(e) => setDosage(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none" placeholder="e.g. 400 mg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Frequency</label>
              <input type="text" value={frequency} onChange={(e) => setFrequency(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none" placeholder="Daily, 2x/day" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Current weight (kg)</label><input type="number" min="1" step="0.1" value={weight} onChange={e=>setWeight(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200" placeholder="e.g. 62" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Height (cm)</label><input type="number" min="30" step="0.1" value={height} onChange={e=>setHeight(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200" placeholder="e.g. 160" /></div>
          </div>
          <div className="rounded-xl bg-amber-50 border border-amber-100 p-3 text-xs text-amber-800">Dosage is recorded in mg. Age, weight and height can help a clinician assess medication needs, but this tracker does not calculate or prescribe doses automatically.</div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Time of day</label>
            <input type="text" value={timeOfDay} onChange={(e) => setTimeOfDay(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none" placeholder="Morning, with meals" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none resize-none" />
          </div>
          {error && <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>}
          <button onClick={save} disabled={saving || !name} className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold transition disabled:opacity-50">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
