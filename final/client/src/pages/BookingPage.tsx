import { Phone, MessageCircle, Clock, Shield } from 'lucide-react';
import BookingForm from '../components/BookingForm';
import type { AppPage } from '../types';

interface BookingPageProps {
  onNavigate: (page: AppPage) => void;
  onOpenLogin: () => void;
}

export default function BookingPage({ onOpenLogin }: BookingPageProps) {
  return (
    <div className="pt-20 min-h-screen bg-cream-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-700 to-rose-900 py-14 px-4 text-white text-center">
        <p className="text-rose-200 text-sm font-semibold tracking-widest uppercase mb-3">Book online</p>
        <h1 className="font-serif text-5xl font-bold mb-3">Book an Appointment</h1>
        <p className="text-rose-100 text-lg max-w-xl mx-auto">
          We'll confirm your slot within a few hours. Your information is completely private.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-14">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Sidebar info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">Why Book Online?</h3>
              <ul className="space-y-3">
                {[
                  'Skip the queue — confirm your slot in advance',
                  'All consultations are private & confidential',
                  'Affordable fees, no hidden charges',
                  'Hindi & English speaking staff',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">Clinic Hours</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Mon–Sat</span>
                  <span className="font-medium text-gray-800">9:00 AM–1:00 PM,<br/> 3:00 – 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Sunday</span>
                  <span className="font-medium text-gray-600">Closed</span>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span>Emergency</span>
                  <span className="font-semibold">Always Available</span>
                </div>
              </div>
            </div>

            <div className="bg-navy-700 rounded-2xl p-6 text-white">
              <h3 className="font-semibold mb-3">Prefer to Call?</h3>
              <p className="text-gray-300 text-sm mb-4">Our staff will help you book your appointment over the phone or WhatsApp.</p>
              <a href="tel:7428926418" className="flex items-center gap-2 w-full py-3 bg-white text-navy-700 rounded-xl justify-center font-semibold text-sm mb-2 hover:bg-gray-100 transition-colors">
                <Phone size={14} /> 74289 26418
              </a>
              <a href="https://wa.me/917428926418" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 w-full py-3 bg-green-500 text-white rounded-xl justify-center font-semibold text-sm hover:bg-green-600 transition-colors">
                <MessageCircle size={14} /> WhatsApp Us
              </a>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400 justify-center">
              <Shield size={12} /> Your data is secure and never shared.
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <Clock size={18} className="text-rose-600" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-gray-800">Appointment Request</h2>
              </div>
            </div>
            <BookingForm onOpenLogin={onOpenLogin} />
          </div>
        </div>
      </div>
    </div>
  );
}
