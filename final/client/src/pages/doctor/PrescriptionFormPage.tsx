import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Download, Pill } from 'lucide-react';
import Layout from '@/components/doctor/Layout';
import { Spinner } from '@/components/doctor/ui';
import { getPatients, createPrescription, getPrescriptions, getAppointments } from '@/services/doctorApi';
import type { Patient, Prescription, Medicine, ClinicAppointment } from '@/types';

export default function PrescriptionFormPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const preselectedPatient = params.get('patient');
  const preselectedAppointment = params.get('appointment');

  const [patients, setPatients] = useState<Patient[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [appointments, setAppointments] = useState<ClinicAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [patientId, setPatientId] = useState(preselectedPatient ?? '');
  const [appointmentId, setAppointmentId] = useState(preselectedAppointment ?? '');
  const [diagnosis, setDiagnosis] = useState('');
  const [tests, setTests] = useState('');
  const [advice, setAdvice] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([{ name: '', morning: false, afternoon: false, night: false, dosage: '', frequency: '', duration: '', instructions: '' }]);

  useEffect(() => {
    (async () => {
      try {
        const [p, rx, appts] = await Promise.all([getPatients(), getPrescriptions(), getAppointments()]);
        setPatients(p);
        setPrescriptions(rx);
        setAppointments(appts.filter(a => a.status === 'completed' && a.appointment_date <= new Date().toISOString().slice(0,10)));
        if (!preselectedAppointment && preselectedPatient) {
          const match = appts.find(a => a.patient_id === preselectedPatient && a.status === 'completed' && a.appointment_date <= new Date().toISOString().slice(0,10));
          if (match) setAppointmentId(match.id);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function updateMedicine(i: number, field: keyof Medicine, value: string | boolean) {
    setMedicines((prev) =>
      prev.map((m, idx) => (idx === i ? { ...m, [field]: value } : m))
    );
  }

  function addMedicine() { setMedicines(prev => [...prev, { name:'', morning:false, afternoon:false, night:false, dosage:'', frequency:'', duration:'', instructions:'' }]); }

  function removeMedicine(i: number) {
    setMedicines((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!patientId) { setError('Please select a patient.'); return; }
    if (!appointmentId) { setError('Please select a completed appointment.'); return; }
    if (!diagnosis.trim()) { setError('Diagnosis is required.'); return; }
    const validMedicines = medicines.filter(m => m.name.trim());
    if (!validMedicines.length) { setError('Add at least one medicine.'); return; }
    if (validMedicines.some(m => !m.dosage?.trim() || !m.frequency?.trim() || !m.duration?.trim())) { setError('Each medicine must have dosage in mg, frequency and duration.'); return; }
    if (followUp && (followUp < minFollowUpDate || followUp > maxFollowUpDate)) { setError('Follow-up date must be within the next 14 days.'); return; }
    setSaving(true);
    setError(null);
    try {
      await createPrescription({
        patient_id: patientId,
        appointment_id: appointmentId,
        diagnosis: diagnosis || null,
        medicines: medicines.filter((m) => m.name.trim()).map(m => ({ medicineName: m.name.trim(), dosage: m.dosage?.trim() || '', frequency: m.frequency?.trim() || '', duration: m.duration?.trim() || '', instructions: m.instructions?.trim() || '' })),
        tests_recommended: tests || null,
        advice: advice || null,
        follow_up_date: followUp || null,
      });
      navigate('/doctor/prescriptions');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save prescription');
    } finally {
      setSaving(false);
    }
  }

  function downloadPDF(rx: Prescription, patientName: string) {
    const win = window.open('', '_blank');
    if (!win) return;
    const clinicLogo = `${window.location.origin}/navjeevan-logo.jpeg`;
    const doctorName = 'Dr. Aayushi Pal';
    const meds = (rx.medicines ?? [])
      .map(
        (m) =>
          `<tr><td>${m.name}</td><td>${m.dosage ?? '-'}</td><td>${m.frequency ?? '-'}</td><td>${m.duration ?? '-'}</td></tr>`
      )
      .join('');
    win.document.write(`<!doctype html><html><head><title>Prescription</title>
    <style>
      body{font-family:Georgia,serif;max-width:700px;margin:40px auto;padding:0 24px;color:#1e293b}
      .head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #c41e3a;padding-bottom:16px}
      .head h1{font-size:22px;color:#c41e3a;margin:0}
      .head p{margin:2px 0;font-size:13px;color:#64748b}
      .patient{margin:20px 0;font-size:14px}
      .patient b{color:#a11731}
      h3{color:#c41e3a;font-size:15px;margin-top:24px;border-bottom:1px solid #e2e8f0;padding-bottom:4px}
      table{width:100%;border-collapse:collapse;font-size:13px;margin-top:8px}
      th,td{text-align:left;padding:6px 8px;border-bottom:1px solid #e2e8f0}
      th{background:#fff1f3;color:#a11731}
      .clinic-logo{width:82px;height:82px;object-fit:contain;display:block;margin-left:auto}.logo-caption{font-size:11px;color:#64748b;margin-top:4px;text-align:right}
      .foot{margin-top:40px;text-align:right}
      .foot p{font-size:13px;color:#475569}
      .sig{margin-top:30px;border-bottom:1px solid #94a3b8;padding-bottom:8px;display:inline-block;font-size:14px;min-width:250px;text-align:center}.signature-name{font-family:"Segoe Script","Brush Script MT",cursive;font-size:29px;line-height:1.05;color:#1f2937;margin-bottom:7px}
    </style></head><body>
    <div class="head">
      <div><h1>Navjeevan Clinic</h1><p>Obstetrics &amp; Gynaecology</p><p>Digital Prescription</p></div>
      <div style="text-align:right"><img class="clinic-logo" src="${clinicLogo}" alt="Navjeevan Clinic logo"/><div class="logo-caption">Navjeevan Clinic</div></div>
    </div>
    <div class="patient"><b>Patient:</b> ${patientName} &nbsp;|&nbsp; <b>Date:</b> ${new Date(rx.created_at).toLocaleDateString('en-IN')}</div>
    <h3>Diagnosis</h3><p>${rx.diagnosis ?? '-'}</p>
    <h3>Medicines</h3>
    <table><thead><tr><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th></tr></thead><tbody>${meds}</tbody></table>
    <h3>Tests Recommended</h3><p>${rx.tests_recommended ?? '-'}</p>
    <h3>Advice</h3><p>${rx.advice ?? '-'}</p>
    ${rx.follow_up_date ? `<p><b>Follow-up:</b> ${rx.follow_up_date}</p>` : ''}
    <div class="foot"><div class="sig"><div class="signature-name">${doctorName}</div><b>${doctorName}</b><br><span>Digital signature of treating doctor</span></div><p>Navjeevan Clinic</p></div>
    <script>window.onload=function(){window.print()}</script>
    </body></html>`);
    win.document.close();
  }

  if (loading) {
    return (
      <Layout title="Prescriptions">
        <div className="flex justify-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      </Layout>
    );
  }

  const showForm = preselectedPatient !== null || patientId !== '';
  const patientAppointments = appointments.filter(a => !patientId || a.patient_id === patientId);
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate()+1);
  const maxFollow = new Date(); maxFollow.setDate(maxFollow.getDate()+14);
  const minFollowUpDate = tomorrow.toISOString().slice(0,10);
  const maxFollowUpDate = maxFollow.toISOString().slice(0,10);

  return (
    <Layout title="Prescriptions" subtitle="Create and manage prescriptions">
      <Link
        to="/doctor/prescriptions"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to prescriptions
      </Link>

      {error && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card mx-auto max-w-3xl p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Patient *</label>
            <select
              className="input"
              value={patientId}
              onChange={(e) => { setPatientId(e.target.value); setAppointmentId(''); }}
            >
              <option value="">Select patient...</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.age} yrs)
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Completed Appointment *</label>
            <select
              className="input"
              value={appointmentId}
              onChange={(e) => {
                setAppointmentId(e.target.value);
                const selected = appointments.find(a => a.id === e.target.value);
                if (selected) setPatientId(selected.patient_id);
              }}
            >
              <option value="">Select completed appointment...</option>
              {patientAppointments.map(a => (
                <option key={a.id} value={a.id}>
                  {a.appointment_date} · {a.appointment_time} · {a.patient?.name ?? 'Patient'}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Diagnosis</label>
            <input
              className="input"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. PCOD with insulin resistance"
            />
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between">
            <label className="label mb-0">Medicines</label>
            <button
              type="button"
              onClick={addMedicine}
              className="btn-ghost px-2 py-1 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          </div>
          <div className="mt-2 space-y-2">
            {medicines.map((m, i) => (
              <div
                key={i}
                className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3 sm:flex-row sm:items-center"
              >
                <div className="grid flex-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <input className="input" placeholder="Medicine name *" value={m.name} onChange={(e) => updateMedicine(i, 'name', e.target.value)} />
                  <div className="flex gap-1"><input className="input" type="number" min="0.1" step="0.1" placeholder="Dose *" value={(m.dosage ?? '').replace(/\s?(mg|mcg|g)$/i,'')} onChange={(e) => updateMedicine(i, 'dosage', `${e.target.value} mg`)} /><span className="flex items-center px-2 rounded-lg bg-slate-100 text-xs font-semibold text-slate-600">mg</span></div>
                  <select className="input" value={m.frequency ?? ''} onChange={(e) => updateMedicine(i, 'frequency', e.target.value)}><option value="">Frequency *</option><option>Once daily</option><option>Twice daily</option><option>Three times daily</option><option>At bedtime</option><option>As directed</option></select>
                  <input className="input" placeholder="Duration *" value={m.duration ?? ''} onChange={(e) => updateMedicine(i, 'duration', e.target.value)} />
                </div>
                <div className="flex items-center gap-3 text-sm"><button type="button" onClick={() => removeMedicine(i)} className="text-rose-400 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button></div>              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Tests Recommended</label>
            <textarea
              className="input min-h-[70px]"
              value={tests}
              onChange={(e) => setTests(e.target.value)}
              placeholder="Fasting insulin, LH:FSH ratio..."
            />
          </div>
          <div>
            <label className="label">Advice</label>
            <textarea
              className="input min-h-[70px]"
              value={advice}
              onChange={(e) => setAdvice(e.target.value)}
              placeholder="Exercise 30 min daily..."
            />
          </div>
          <div>
            <label className="label">Follow-up Date</label>
            <input type="date" className="input" min={minFollowUpDate} max={maxFollowUpDate} value={followUp} onChange={(e) => setFollowUp(e.target.value)} />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? <Spinner /> : <Save className="h-4 w-4" />}
            Save Prescription
          </button>
        </div>
      </form>

      {/* Recent prescriptions list */}
      {prescriptions.length > 0 && !showForm && (
        <div className="mt-8 card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
            <Pill className="h-5 w-5 text-brand-600" />
            <h2 className="font-display text-base font-bold text-slate-900">
              Recent Prescriptions
            </h2>
          </div>
          <div className="divide-y divide-slate-50">
            {prescriptions.map((rx) => (
              <div
                key={rx.id}
                className="flex items-center justify-between px-5 py-3.5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800">
                    {rx.patient?.name ?? 'Unknown'} — {rx.diagnosis ?? 'Untitled'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(rx.created_at).toLocaleDateString('en-IN')} ·{' '}
                    {rx.medicines?.length ?? 0} medicines
                  </p>
                </div>
                <button
                  onClick={() => downloadPDF(rx, rx.patient?.name ?? 'Patient')}
                  className="btn-ghost text-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  PDF
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
