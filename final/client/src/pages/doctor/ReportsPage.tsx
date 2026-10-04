import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FlaskConical,
  Download,
  Trash2,
  Eye,
  X,
  SlidersHorizontal,
  Check,
} from 'lucide-react';
import Layout from '@/components/doctor/Layout';
import { Spinner, ErrorState, EmptyState } from '@/components/doctor/ui';
import { getReports, deleteReport } from '@/services/doctorApi';
import type { Report } from '@/types';

const reportTypes = [
  'Ultrasound',
  'Blood Reports',
  'Scan Reports',
  'Pregnancy Reports',
  'Lab Reports',
];

export default function ReportsPage() {
  const [params] = useSearchParams();
  const preselectedPatient = params.get('patient');

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('All');
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [viewing, setViewing] = useState<Report | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await getReports();
        setReports(r);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setFilterMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = reports.filter((r) => {
    const matchesType = filter === 'All' || r.type === filter;
    const matchesPatient = !preselectedPatient || r.patient_id === preselectedPatient;
    return matchesType && matchesPatient;
  });

  async function handleDelete(id: string) {
    try {
      await deleteReport(id);
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete report');
    }
  }

  async function downloadReport(report: Report) {
    if (!report.file_url) return;
    try {
      const response = await fetch(report.file_url);
      if (!response.ok) throw new Error('Unable to download report');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = report.title || `medical-report-${report.id}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to download report');
    }
  }

  return (
    <Layout title="Reports" subtitle="View and download medical reports">
      {error && (
        <div className="mb-4">
          <ErrorState message={error} />
        </div>
      )}

      <div className="mb-4 flex items-center gap-1.5">
        <button
          onClick={() => setFilter('All')}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            filter === 'All'
              ? 'bg-brand-600 text-white'
              : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setFilterMenuOpen((o) => !o)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              filter !== 'All'
                ? 'bg-brand-600 text-white'
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {filter === 'All' ? 'Filter' : filter}
          </button>

          {filterMenuOpen && (
            <div className="absolute left-0 z-10 mt-1.5 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg animate-d-scale-in">
              {reportTypes.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setFilter(t);
                    setFilterMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  {t}
                  {filter === t && <Check className="h-3.5 w-3.5 text-brand-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner className="h-7 w-7" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={FlaskConical}
            title="No reports found"
            hint="Reports will appear here once available"
          />
        ) : (
          <div className="divide-y divide-slate-50">
            {filtered.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between px-5 py-3.5 transition hover:bg-slate-50/70"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-amber-50 text-amber-600">
                    <FlaskConical className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {r.title ?? r.type}
                    </p>
                    <p className="text-xs text-slate-400">
                      {r.patient?.name ?? 'Unknown'} · {r.type} ·{' '}
                      {new Date(r.created_at).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setViewing(r)}
                    className="btn-ghost px-2 py-1.5 text-xs"
                    title="View"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  {r.file_url && (
                    <button
                      onClick={() => downloadReport(r)}
                      className="btn-ghost px-2 py-1.5 text-xs"
                      title="Download"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="btn-ghost px-2 py-1.5 text-xs text-rose-500 hover:bg-rose-50"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View modal */}
      {viewing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
          onClick={() => setViewing(null)}
        >
          <div
            className="card w-full max-w-lg p-6 animate-d-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900">
                  {viewing.title ?? viewing.type}
                </h2>
                <p className="text-sm text-slate-400">
                  {viewing.patient?.name ?? 'Unknown'} ·{' '}
                  {new Date(viewing.created_at).toLocaleDateString('en-IN')}
                </p>
              </div>
              <button onClick={() => setViewing(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Type</p>
                <p className="text-sm text-slate-700">{viewing.type}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Notes</p>
                <p className="text-sm text-slate-700">{viewing.notes ?? 'No notes.'}</p>
              </div>
              {viewing.file_url && (
                <button
                  onClick={() => downloadReport(viewing)}
                  className="btn-outline w-full"
                >
                  <Download className="h-4 w-4" />
                  Download File
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
