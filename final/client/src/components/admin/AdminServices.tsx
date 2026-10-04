import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Search, Pencil, Trash2, X, Clock, IndianRupee, Stethoscope, CheckCircle2, XCircle } from 'lucide-react';
import { getServices, createService, updateService, deleteService } from '@/services/adminApi';
import type { ClinicService } from '@/types';
import { SERVICES } from '@/data/services';

function serviceKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

const emptyForm = {
  name: '',
  description: '',
  consultation_fee: '',
  duration_minutes: '',
  active: true,
};

export default function AdminServices() {
  const [services, setServices] = useState<ClinicService[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getServices()
      .then(setServices)
      .catch((e) => setError(e.message ?? 'Failed to load services'))
      .finally(() => setLoading(false));
  }, []);

  const homeServiceNames = new Set(SERVICES.map((service) => serviceKey(service.name)));
  const canonicalServices = services
    .filter((service) => homeServiceNames.has(serviceKey(service.name)))
    .sort((a, b) => {
      const ai = SERVICES.findIndex((service) => serviceKey(service.name) === serviceKey(a.name));
      const bi = SERVICES.findIndex((service) => serviceKey(service.name) === serviceKey(b.name));
      return ai - bi;
    });
  const filtered = canonicalServices.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setForm(emptyForm);
    setEditId(null);
    setError(null);
    setShowForm(true);
  };

  const openEdit = (s: ClinicService) => {
    setForm({
      name: s.name,
      description: s.description,
      consultation_fee: String(s.consultation_fee),
      duration_minutes: String(s.duration_minutes),
      active: s.active,
    });
    setEditId(s.id);
    setError(null);
    setShowForm(true);
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        consultation_fee: Number(form.consultation_fee),
        duration_minutes: Number(form.duration_minutes),
        active: form.active,
      };
      if (editId) {
        const updated = await updateService(editId, payload);
        setServices((list) => list.map((s) => (s.id === editId ? updated : s)));
      } else {
        const created = await createService(payload);
        setServices((list) => [...list, created]);
      }
      setShowForm(false);
      setEditId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save service');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteService(id);
      setServices((list) => list.filter((s) => s.id !== id));
    } finally {
      setConfirmDelete(null);
    }
  }

  async function toggleActive(s: ClinicService) {
    const updated = await updateService(s.id, { active: !s.active });
    setServices((list) => list.map((item) => (item.id === s.id ? updated : item)));
  }

  if (loading) return <div className="text-center py-16 text-gray-400">Loading services…</div>;

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-navy-900 font-serif">All Services ({canonicalServices.length})</h2>
          <p className="text-xs text-gray-400">Manage clinic services, pricing, and availability</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center justify-center gap-2 bg-rose-700 hover:bg-rose-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <Plus size={18} />
          Add Service
        </button>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search services..."
          className="admin-input pl-11"
        />
      </div>

      <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-navy-900/5 text-left">
              <th className="px-5 py-3.5 text-xs font-bold text-navy-900 uppercase tracking-wider">Service</th>
              <th className="px-5 py-3.5 text-xs font-bold text-navy-900 uppercase tracking-wider">Fee</th>
              <th className="px-5 py-3.5 text-xs font-bold text-navy-900 uppercase tracking-wider">Duration</th>
              <th className="px-5 py-3.5 text-xs font-bold text-navy-900 uppercase tracking-wider">Status</th>
              <th className="px-5 py-3.5 text-xs font-bold text-navy-900 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-4">
                  <p className="font-semibold text-sm text-navy-900">{s.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 max-w-xs">{s.description}</p>
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm font-bold text-navy-900">₹{s.consultation_fee}</span>
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Clock size={13} className="text-gray-400" />
                    {s.duration_minutes} min
                  </span>
                </td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => toggleActive(s)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                      s.active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {s.active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    {s.active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(s)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-navy-900/10 text-navy-900 hover:bg-navy-900/20 transition-colors">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => setConfirmDelete(s.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {filtered.map((s) => (
          <div key={s.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-navy-900">{s.name}</h3>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{s.description}</p>
              </div>
              <button
                onClick={() => toggleActive(s)}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold flex-shrink-0 ${
                  s.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {s.active ? 'Active' : 'Inactive'}
              </button>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-navy-900">₹{s.consultation_fee}</span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock size={12} />
                  {s.duration_minutes} min
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(s)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-navy-900/10 text-navy-900">
                  <Pencil size={15} />
                </button>
                <button onClick={() => setConfirmDelete(s.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-600">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Stethoscope size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400 text-sm">No services found</p>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-navy-900">{editId ? 'Edit Service' : 'Add New Service'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Service Name *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="admin-input" placeholder="e.g. Antenatal Care" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Description *</label>
                <textarea
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="admin-input resize-none"
                  placeholder="Brief description of the service..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Consultation Fee (₹) *</label>
                  <div className="relative">
                    <IndianRupee size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      required
                      type="number"
                      value={form.consultation_fee}
                      onChange={(e) => setForm({ ...form, consultation_fee: e.target.value })}
                      className="admin-input pl-9"
                      placeholder="500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Duration (min) *</label>
                  <div className="relative">
                    <Clock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      required
                      type="number"
                      value={form.duration_minutes}
                      onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
                      className="admin-input pl-9"
                      placeholder="30"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Status</label>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, active: !form.active })}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    form.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <span className={`w-9 h-5 rounded-full relative transition-colors ${form.active ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${form.active ? 'left-4' : 'left-0.5'}`} />
                  </span>
                  {form.active ? 'Active' : 'Inactive'}
                </button>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-sm font-semibold transition-colors disabled:opacity-60">
                  {saving ? 'Saving…' : editId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={26} className="text-red-600" />
            </div>
            <h2 className="font-bold text-navy-900 text-lg">Delete Service?</h2>
            <p className="text-sm text-gray-400 mt-1">This action cannot be undone.</p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
