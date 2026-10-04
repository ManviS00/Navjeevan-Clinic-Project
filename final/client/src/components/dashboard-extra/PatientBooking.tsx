import { ArrowLeft, CalendarPlus } from 'lucide-react';
import BookingForm from '../BookingForm';

export default function PatientBooking({ onBack }: { onBack: () => void }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 rounded-xl border border-brand-100 bg-white text-gray-500 hover:text-brand-600 hover:bg-brand-50 transition" title="Back to My Bookings">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <CalendarPlus className="w-5 h-5 text-brand-600" />
            <h2 className="text-2xl font-bold text-gray-900">Book an Appointment</h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">Book directly from your patient dashboard without leaving your account.</p>
        </div>
      </div>
      <div className="bg-white rounded-3xl border border-brand-100 shadow-sm p-5 sm:p-8">
        <BookingForm />
      </div>
    </div>
  );
}
