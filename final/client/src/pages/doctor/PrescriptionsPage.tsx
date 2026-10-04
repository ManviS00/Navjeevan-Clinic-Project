import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pill, Plus, Download, CalendarClock, Search } from 'lucide-react';
import Layout from '@/components/doctor/Layout';
import { Spinner, ErrorState, EmptyState } from '@/components/doctor/ui';
import { getPrescriptions } from '@/services/doctorApi';
import type { Prescription } from '@/types';

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const filtered = prescriptions.filter((rx) =>
    (rx.patient?.name ?? '').toLowerCase().includes(query.trim().toLowerCase())
  );

  useEffect(() => {
    (async () => {
      try {
        const data = await getPrescriptions();
        setPrescriptions(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load prescriptions');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function downloadPDF(rx: Prescription, patientName: string) {
    const win = window.open('', '_blank');
    if (!win) return;
    const clinicLogo = `${window.location.origin}/navjeevan-logo.jpeg`;
    const doctorName = 'Dr. Aayushi Pal';
    const meds = (rx.medicines ?? [])
      .map(
        (m) =>
          `<tr><td>${m.name}</td><td>${m.morning ? 'Yes' : '-'}</td><td>${m.afternoon ? 'Yes' : '-'}</td><td>${m.night ? 'Yes' : '-'}</td></tr>`
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
    <table><thead><tr><th>Medicine</th><th>Morning</th><th>Afternoon</th><th>Night</th></tr></thead><tbody>${meds}</tbody></table>
    <h3>Tests Recommended</h3><p>${rx.tests_recommended ?? '-'}</p>
    <h3>Advice</h3><p>${rx.advice ?? '-'}</p>
    ${rx.follow_up_date ? `<p><b>Follow-up:</b> ${rx.follow_up_date}</p>` : ''}
    <div class="foot"><div class="sig"><div class="signature-name">${doctorName}</div><b>${doctorName}</b><br><span>Digital signature of treating doctor</span></div><p>Navjeevan Clinic</p></div>
    <script>window.onload=function(){window.print()}</script>
    </body></html>`);
    win.document.close();
  }

  return (
    <Layout title="Prescriptions" subtitle={`${prescriptions.length} prescriptions issued`}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patient..."
            className="input pl-9"
          />
        </div>
        <Link to="/doctor/prescriptions/new" className="btn-primary">
          <Plus className="h-4 w-4" />
          New Prescription
        </Link>
      </div>

      <div className="card overflow-hidden">
        {error ? (
          <div className="p-4">
            <ErrorState message={error} />
          </div>
        ) : loading ? (
          <div className="flex justify-center py-12">
            <Spinner className="h-7 w-7" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Pill}
            title={query ? 'No matching prescriptions' : 'No prescriptions yet'}
            hint={query ? 'Try a different patient name' : 'Create your first prescription'}
          />
        ) : (
          <div className="divide-y divide-slate-50">
            {filtered.map((rx) => (
              <div
                key={rx.id}
                className="flex flex-col gap-3 px-5 py-4 transition hover:bg-slate-50/70 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-600">
                    <Pill className="h-5 w-5" />
                  </div>
                  <div>
                    <Link
                      to={`/doctor/patients/${rx.patient_id}`}
                      className="text-sm font-semibold text-slate-800 hover:text-brand-600"
                    >
                      {rx.patient?.name ?? 'Unknown'}
                    </Link>
                    <p className="text-xs text-slate-400">
                      {rx.diagnosis ?? 'Untitled'} ·{' '}
                      {new Date(rx.created_at).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex flex-wrap gap-1">
                    {rx.medicines?.slice(0, 3).map((m, i) => (
                      <span key={i} className="badge bg-slate-100 text-slate-600">
                        {m.name}
                      </span>
                    ))}
                  </div>
                  {rx.follow_up_date && (
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <CalendarClock className="h-3 w-3" />
                      {rx.follow_up_date}
                    </span>
                  )}
                  <button
                    onClick={() => downloadPDF(rx, rx.patient?.name ?? 'Patient')}
                    className="btn-ghost text-xs"
                  >
                    <Download className="h-3.5 w-3.5" />
                    PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
