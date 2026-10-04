import { useEffect, useState } from 'react';
import { Download, FileText, Pill, CalendarDays } from 'lucide-react';
import { backendRequest } from '@/lib/backendApi';

interface PatientPrescription {
  id: string;
  diagnosis: string;
  medicines: Array<{ medicineName: string; dosage: string; frequency: string; duration: string; instructions?: string }>;
  recommendedTests: string[];
  advice: string;
  followUpDate?: string | null;
  createdAt: string;
  doctor?: { fullName?: string; qualification?: string; specialization?: string };
  appointment?: { appointmentNumber?: string; appointmentDate?: string; timeSlot?: string };
}

function escapeHtml(value: unknown) {
  return String(value ?? '').replace(/[&<>'"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c] as string));
}

export default function PatientPrescriptions() {
  const [items, setItems] = useState<PatientPrescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    try {
      const raw = localStorage.getItem('navjeevan_backend_user');
      const user = raw ? JSON.parse(raw) : null;
      if (!user?.id) {
        setError('Please log in to view your prescriptions.');
        setLoading(false);
        return;
      }
      backendRequest<any>(`/prescriptions/patient/${encodeURIComponent(user.id)}`)
        .then((result) => {
          if (!cancelled) setItems((result.data ?? []).map((p: any) => ({ ...p, id: String(p._id ?? p.id) })));
        })
        .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : 'Unable to load prescriptions.'); })
        .finally(() => { if (!cancelled) setLoading(false); });
    } catch {
      setError('Unable to load your prescriptions.');
      setLoading(false);
    }
    return () => { cancelled = true; };
  }, []);

  function downloadPrescription(rx: PatientPrescription) {
    const doctor = rx.doctor ?? {};
    const meds = (rx.medicines ?? []).map((m, index) => `<tr><td>${index + 1}. ${escapeHtml(m.medicineName)}</td><td>${escapeHtml(m.dosage)}</td><td>${escapeHtml(m.frequency)}</td><td>${escapeHtml(m.duration)}</td><td>${escapeHtml(m.instructions || '—')}</td></tr>`).join('');
    const win = window.open('', '_blank');
    if (!win) return;
    const clinicLogo = `${window.location.origin}/navjeevan-logo.jpeg`;
    const doctorName = doctor.fullName || 'Dr. Aayushi Pal';
    win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Navjeevan Clinic Prescription</title><style>
      body{font-family:Arial,sans-serif;max-width:850px;margin:32px auto;padding:0 28px;color:#263238}.head{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;border-bottom:3px solid #c41e3a;padding-bottom:14px}.head h1{margin:0;color:#a91731;font-size:27px}.muted{color:#64748b;font-size:13px}.logo-box{text-align:right}.clinic-logo{width:82px;height:82px;object-fit:contain;display:block;margin-left:auto}.logo-caption{margin-top:4px;font-size:11px;color:#64748b}.meta{margin:18px 0;padding:12px;background:#fff6f7;border-radius:10px}.section{margin-top:22px}.section h3{font-size:15px;color:#a91731;border-bottom:1px solid #ead5d9;padding-bottom:6px}table{width:100%;border-collapse:collapse;font-size:12px}th,td{text-align:left;padding:8px;border-bottom:1px solid #e5e7eb;vertical-align:top}th{background:#fff1f3;color:#8f1830}.footer{margin-top:42px;text-align:right}.signature{display:inline-block;min-width:250px;border-top:1px solid #64748b;padding-top:8px;text-align:center}.signature-name{font-family:"Segoe Script","Brush Script MT",cursive;font-size:28px;line-height:1.05;color:#1f2937;margin-bottom:7px}@media print{body{margin:0;max-width:none}}</style></head><body>
      <div class="head"><div><h1>Navjeevan Clinic</h1><div class="muted">Obstetrics &amp; Gynaecology</div><div class="muted">Digital Prescription</div></div><div class="logo-box"><img class="clinic-logo" src="${clinicLogo}" alt="Navjeevan Clinic logo"/><div class="logo-caption">Navjeevan Clinic</div></div></div>
      <div class="meta"><b>Prescription date:</b> ${escapeHtml(new Date(rx.createdAt).toLocaleDateString('en-IN'))}<br><b>Appointment:</b> ${escapeHtml(rx.appointment?.appointmentNumber || '—')} &nbsp; ${escapeHtml(rx.appointment?.appointmentDate || '')} ${escapeHtml(rx.appointment?.timeSlot || '')}</div>
      <div class="section"><h3>Diagnosis</h3><p>${escapeHtml(rx.diagnosis || '—')}</p></div>
      <div class="section"><h3>Medicines</h3><table><thead><tr><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Instructions</th></tr></thead><tbody>${meds || '<tr><td colspan="5">No medicines listed</td></tr>'}</tbody></table></div>
      <div class="section"><h3>Recommended Tests</h3><p>${escapeHtml((rx.recommendedTests || []).join(', ') || 'None')}</p></div>
      <div class="section"><h3>Advice</h3><p>${escapeHtml(rx.advice || '—')}</p></div>
      ${rx.followUpDate ? `<div class="section"><h3>Follow-up</h3><p>${escapeHtml(new Date(rx.followUpDate).toLocaleDateString('en-IN'))}</p></div>` : ''}
      <div class="footer"><div class="signature"><div class="signature-name">${escapeHtml(doctorName)}</div><b>${escapeHtml(doctorName)}</b><br><span class="muted">Digital signature of treating doctor</span><br><span class="muted">${escapeHtml([doctor.qualification, doctor.specialization].filter(Boolean).join(' · '))}</span></div></div>
      <script>window.onload=function(){window.print()}</script></body></html>`);
    win.document.close();
  }

  return <div>
    <div className="mb-6"><h2 className="text-2xl font-bold text-gray-900">My Prescriptions</h2><p className="text-sm text-gray-500 mt-1">View and download prescriptions issued after your completed consultations.</p></div>
    {loading ? <div className="py-12 text-center text-gray-400">Loading prescriptions…</div> : error ? <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">{error}</div> : items.length === 0 ? <div className="rounded-2xl border bg-white py-16 text-center"><FileText className="mx-auto mb-3 text-gray-300" size={42}/><p className="font-medium text-gray-600">No prescriptions available yet.</p></div> : <div className="space-y-4">{items.map((rx) => <div key={rx.id} className="bg-white rounded-2xl border border-brand-100 shadow-sm p-5"><div className="flex flex-col md:flex-row md:justify-between gap-4"><div className="min-w-0"><div className="flex items-center gap-2 text-brand-700 mb-2"><Pill size={18}/><span className="font-semibold">Prescription</span></div><h3 className="font-semibold text-gray-800">{rx.diagnosis || 'Prescription'}</h3><p className="text-sm text-gray-500 mt-1">{rx.doctor?.fullName || 'Treating Doctor'}{rx.doctor?.specialization ? ` · ${rx.doctor.specialization}` : ''}</p><p className="text-xs text-gray-400 flex items-center gap-1 mt-2"><CalendarDays size={13}/>{new Date(rx.createdAt).toLocaleDateString('en-IN')}</p><div className="mt-3 flex flex-wrap gap-2">{(rx.medicines || []).map((m, i) => <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-brand-50 text-brand-700">{m.medicineName}</span>)}</div></div><button onClick={() => downloadPrescription(rx)} className="self-start md:self-center inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700"><Download size={16}/> Download Prescription</button></div></div>)}</div>}
  </div>;
}
