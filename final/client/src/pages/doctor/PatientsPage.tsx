import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Users } from 'lucide-react';
import Layout from '@/components/doctor/Layout';
import { Spinner, EmptyState, ErrorState } from '@/components/doctor/ui';
import PatientList from '@/components/doctor/PatientList';
import { getPatients } from '@/services/doctorApi';
import type { Patient } from '@/types';

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get('search') ?? '');

  useEffect(() => { setQuery(searchParams.get('search') ?? ''); }, [searchParams]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getPatients();
        setPatients(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load patients');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      (p.phone ?? '').includes(query) ||
      (p.medical_history ?? '').toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Layout title="All Patients" subtitle={`${patients.length} registered patients`}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, phone, or diagnosis..."
            className="input pl-9"
          />
        </div>
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
          <EmptyState icon={Users} title="No patients found" hint="Try a different search or add a new patient" />
        ) : (
          <PatientList patients={filtered} />
        )}
      </div>
    </Layout>
  );
}
