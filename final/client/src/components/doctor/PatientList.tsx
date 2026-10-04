import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';

function initials(name: string) {
  return name.trim().charAt(0).toUpperCase() || 'P';
}
import type { Patient } from '@/types';

export default function PatientList({ patients }: { patients: Patient[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
            <th className="px-4 py-3 font-semibold">Name</th>
            <th className="hidden px-4 py-3 font-semibold sm:table-cell">Phone</th>
            <th className="hidden px-4 py-3 font-semibold md:table-cell">Last Visit</th>
            <th className="hidden px-4 py-3 font-semibold lg:table-cell">Diagnosis</th>
            <th className="px-4 py-3 font-semibold text-right">View</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {patients.map((p) => (
            <tr key={p.id} className="group transition hover:bg-slate-50/70">
              <td className="px-4 py-3">
                <Link to={`/doctor/patients/${p.id}`} className="flex items-center gap-2.5">
                  {p.photo_url ? (
                    <img src={p.photo_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-brand-50 text-brand-700 grid place-items-center text-xs font-bold" aria-label={p.name}>
                      {initials(p.name)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800 group-hover:text-brand-600">
                      {p.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {p.age !== null && p.age !== undefined ? `${p.age} yrs` : 'Age not available'}
                    </p>
                  </div>
                </Link>
              </td>
              <td className="hidden px-4 py-3 text-slate-500 sm:table-cell">
                {p.phone ?? '-'}
              </td>
              <td className="hidden px-4 py-3 text-slate-500 md:table-cell">
                {p.last_visit ?? '-'}
              </td>
              <td className="hidden px-4 py-3 text-slate-500 lg:table-cell max-w-[200px] truncate">
                {p.medical_history ?? '-'}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  to={`/doctor/patients/${p.id}`}
                  className="btn-ghost px-2 py-1.5 text-xs"
                >
                  <Eye className="h-3.5 w-3.5" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
