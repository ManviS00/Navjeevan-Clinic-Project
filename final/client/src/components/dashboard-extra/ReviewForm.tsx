import { useState, useEffect } from 'react';
import { Star, CheckCircle } from 'lucide-react';
import { useAuth as useSiteAuth } from '../../context/AuthContext';
import { backendRequest } from '../../lib/backendApi';
import type { Appointment } from '../../types';

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}
function mapAppointment(a: any): Appointment {
  return {
    id: String(a._id ?? a.id), patient_id: String(a.patient?._id ?? a.patient ?? ''),
    patient_name: a.patient?.fullName ?? 'Patient', patient_phone: a.patient?.phone ?? '',
    patient_email: a.patient?.email ?? '', service: a.service?.name ?? 'Appointment',
    preferred_date: a.appointmentDate ?? '', notes: a.notes ?? '', status: a.status,
    created_at: a.createdAt ?? new Date().toISOString(),
  };
}

export default function ReviewForm() {
  const { user } = useSiteAuth();
  const [completedAppts, setCompletedAppts] = useState<Appointment[]>([]);
  const [reviewForm, setReviewForm] = useState({ appointmentId: '', rating: 5, comment: '' });
  const [reviewSent, setReviewSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    Promise.all([
      backendRequest<any>('/appointments/my'),
      backendRequest<any>('/reviews/mine'),
    ])
      .then(([appointmentsResponse, reviewsResponse]) => {
        const reviewedIds = new Set<string>(
          (reviewsResponse.data ?? [])
            .map((review: any) => String(review.appointment?._id ?? review.appointment ?? ''))
            .filter(Boolean),
        );
        setCompletedAppts(
          (appointmentsResponse.data ?? [])
            .filter((a: any) => a.status === 'completed')
            .map(mapAppointment)
            .filter((a: Appointment) => !reviewedIds.has(a.id)),
        );
      })
      .catch(() => {
        setCompletedAppts([]);
      });
  }, [user]);

  async function submitReview() {
    if (!user || !reviewForm.appointmentId || !reviewForm.comment.trim()) { setError('Please select an appointment and enter your review.'); return; }
    setError('');
    try {
      await backendRequest('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          appointmentId: reviewForm.appointmentId || undefined,
          rating: reviewForm.rating,
          comment: reviewForm.comment.trim(),
        }),
      });
      setReviewSent(true);
      setCompletedAppts((current) => current.filter((a) => a.id !== reviewForm.appointmentId));
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not submit review.'); }
  }

  return (
    <div className="max-w-xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Leave a Review</h2>
      <p className="text-gray-500 text-sm mb-6">Your review helps other patients and appears on the clinic website after submission.</p>
      {reviewSent ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-brand-100"><CheckCircle size={36} className="text-green-500 mx-auto mb-3"/><h3 className="font-semibold text-gray-800 mb-1">Review Submitted!</h3><p className="text-gray-500 text-sm">Thank you. Your review is now visible on the clinic website.</p></div>
      ) : (
        <div className="bg-white rounded-2xl border border-brand-100 shadow-sm p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Select an appointment for review</label>
            <select value={reviewForm.appointmentId} onChange={(e) => setReviewForm({...reviewForm, appointmentId:e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm" disabled={completedAppts.length === 0}>
              <option value="">{completedAppts.length ? 'Select a completed appointment...' : 'No completed appointments available for review'}</option>
              {completedAppts.map(a => <option key={a.id} value={a.id}>{a.service.replace(/-/g,' ')} — {formatDate(a.preferred_date)}</option>)}
            </select>
            <p className="text-[11px] text-gray-400 mt-1.5">Each completed appointment can be reviewed only once.</p>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label><div className="flex gap-2">{[1,2,3,4,5].map(s => <button key={s} type="button" onClick={()=>setReviewForm({...reviewForm,rating:s})} className={`w-10 h-10 rounded-lg ${s<=reviewForm.rating?'bg-amber-400 text-white':'bg-gray-100 text-gray-400'}`}><Star size={16} className="mx-auto" fill={s<=reviewForm.rating?'currentColor':'none'}/></button>)}</div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Your Review</label><textarea value={reviewForm.comment} onChange={e=>setReviewForm({...reviewForm,comment:e.target.value})} placeholder="Share your experience with Navjeevan Clinic…" rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none"/></div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button onClick={submitReview} disabled={!reviewForm.appointmentId || !reviewForm.comment.trim()} className="w-full py-3.5 bg-brand-500 text-white rounded-xl font-semibold text-sm disabled:opacity-50">Submit Review →</button>
        </div>
      )}
    </div>
  );
}
