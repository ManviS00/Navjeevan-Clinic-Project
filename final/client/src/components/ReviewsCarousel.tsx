import { useEffect, useState } from 'react';
import { Star, Quote } from 'lucide-react';
import type { Review } from '../types';
import { backendRequest } from '../lib/backendApi';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={14} className={s <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-300'} />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="w-80 flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mx-3">
      <div className="flex items-start justify-between mb-4">
        <Quote size={20} className="text-rose-200 rotate-180" />
        <StarRating rating={review.rating} />
      </div>
      <p className="text-gray-600 text-sm leading-relaxed mb-5 line-clamp-4">{review.comment}</p>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white text-sm font-semibold">
          {(review.patient_name || 'P').charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">{review.patient_name || 'Patient'}</p>
          <p className="text-xs text-gray-400">Patient, Delhi</p>
        </div>
      </div>
    </div>
  );
}

export default function ReviewsCarousel() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    backendRequest<any>('/reviews/public')
      .then((result) => {
        if (!mounted) return;
        const rows = (result.data ?? []).map((r: any) => ({
          id: String(r._id ?? r.id),
          patient_id: r.patient?._id ?? r.patient_id,
          appointment_id: r.appointment?._id ?? r.appointment_id,
          patient_name: r.patient?.fullName ?? 'Patient',
          rating: Number(r.rating ?? 0),
          comment: r.comment ?? '',
          status: r.status ?? 'approved',
          created_at: r.createdAt ?? new Date().toISOString(),
        }));
        setReviews(rows);
      })
      .catch(() => { if (mounted) setReviews([]); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (reviews.length < 2) return;
    const interval = setInterval(() => setCurrentIndex((prev) => (prev + 1) % reviews.length), 5000);
    return () => clearInterval(interval);
  }, [reviews.length]);

  if (loading || reviews.length === 0) return null;

  const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % reviews.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);

  return (
    <section className="bg-gradient-to-br from-rose-50 to-cream-50 py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-12 text-center">
        <p className="text-rose-600 text-sm font-semibold tracking-widest uppercase mb-3">Patient Stories</p>
        <h2 className="font-serif text-4xl md:text-5xl font-bold text-navy-800 mb-4">What Our Patients Say</h2>
        <div className="flex items-center justify-center gap-3 mt-4">
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map((s) => <Star key={s} size={20} className={s <= Math.round(Number(avgRating)) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-300'} />)}
          </div>
          <span className="text-2xl font-bold text-gray-800">{avgRating}</span>
          <span className="text-gray-500 text-sm">from {reviews.length} patient{reviews.length === 1 ? '' : 's'}</span>
        </div>
      </div>
      <div className="relative max-w-6xl mx-auto px-4">
        {reviews.length > 1 && <button onClick={prevSlide} className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg rounded-full w-12 h-12 flex items-center justify-center hover:bg-rose-50 transition">❮</button>}
        <div className="overflow-hidden max-w-[1032px] mx-auto">
          <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(calc(-${currentIndex * 33.33}%))` }}>
            {reviews.map((review) => <ReviewCard key={review.id} review={review} />)}
          </div>
        </div>
        {reviews.length > 1 && <button onClick={nextSlide} className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg rounded-full w-12 h-12 flex items-center justify-center hover:bg-rose-50 transition">❯</button>}
      </div>
    </section>
  );
}
