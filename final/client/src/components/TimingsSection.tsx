import { MapPin, Phone, MessageCircle, Clock, AlertTriangle} from 'lucide-react';
import type { AppPage } from '../types';

interface TimingsSectionProps {
  onNavigate: (page: AppPage) => void;
}

export default function TimingsSection({ onNavigate }: TimingsSectionProps) {
  return (
    <section className="bg-cream-50 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Timings */}
          <div>
            <p className="text-emerald-600 text-sm font-semibold tracking-widest uppercase mb-3">Visit us</p>
            <h2 className="font-serif text-4xl font-bold text-navy-800 mb-4">Clinic Timings</h2>
            <p className="text-gray-500 leading-relaxed mb-8">
              Open Monday to Saturday. Walk-ins welcome — booking ahead is recommended to avoid waiting.
            </p>

            <div className="space-y-3 mb-6">
              {/* Mon-Sat session 1 */}
              <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Clock size={16} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">Monday – Saturday</p>
                    <p className="text-xs text-gray-500">Morning session</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full mb-1">Open</span>
                  <p className="text-sm font-semibold text-gray-800">9:00 AM – 1:00 PM</p>
                </div>
              </div>

              {/* Mon-Sat session 2 */}
              <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Clock size={16} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">Monday – Saturday</p>
                    <p className="text-xs text-gray-500">Evening session</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full mb-1">Open</span>
                  <p className="text-sm font-semibold text-gray-800">3:00 PM – 6:00 PM</p>
                </div>
              </div>

              {/* Sunday */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-200 flex items-center justify-center">
                    <Clock size={16} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">Sunday</p>
                    <p className="text-xs text-gray-500">Weekly closing day</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 bg-gray-200 text-gray-600 text-xs font-semibold rounded-full mb-1">Closed</span>
                  <p className="text-sm font-semibold text-gray-600">Clinic closed</p>
                </div>
              </div>

              {/* Emergency */}
              <div className="flex items-center justify-between p-4 bg-rose-50 rounded-xl border border-rose-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-rose-100 flex items-center justify-center">
                    <AlertTriangle size={16} className="text-rose-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">Emergency</p>
                    <p className="text-xs text-gray-500">Call anytime</p>
                  </div>
                </div>
                <div className="text-right">
                  <a href="tel:7428926418" className="text-rose-700 font-bold text-sm hover:underline">74289 26418</a>
                  <p className="text-xs text-rose-500">Always available</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact card */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
            <h3 className="font-serif text-2xl font-bold text-navy-800 mb-6">Find &amp; Reach Us</h3>

            <div className="space-y-5 mb-7">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                  <MapPin size={18} className="text-rose-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">C-130, Puri Gali</p>
                  <p className="text-gray-500 text-sm">Near Angelic Convent School</p>
                  <p className="text-gray-500 text-sm">Maujpur, Delhi – 110053</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Phone size={18} className="text-blue-600" />
                </div>
                <div>
                  <a href="tel:7428926418" className="font-semibold text-gray-800 text-sm hover:text-rose-700 transition-colors">74289 26418</a>
                  <p className="text-gray-500 text-sm">Call for appointments &amp; emergencies</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={18} className="text-green-600" />
                </div>
                <div>
                  <a href="https://wa.me/917428926418" target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-800 text-sm hover:text-green-700 transition-colors">WhatsApp: 74289 26418</a>
                  <p className="text-gray-500 text-sm">Message us anytime for queries</p>
                </div>
              </div>
            </div>

            {/* Google Map embed */}
            <div className="rounded-xl overflow-hidden shadow-sm mb-5 border border-gray-200" style={{ position: 'relative', paddingBottom: '52%', height: 0 }}>
              <iframe
                title="Navjeevan Clinic Location — Maujpur, Delhi"
                src="https://www.google.com/maps?q=C-130+Puri+Gali+Near+Angelic+Convent+School+Maujpur+Delhi+110053&output=embed"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <a
                href="https://maps.google.com/?q=C-130+Puri+Gali+Near+Angelic+Convent+School+Maujpur+Delhi+110053"
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 text-center text-sm font-semibold text-white bg-rose-700 rounded-xl hover:bg-rose-800 transition-colors"
              >
                Get Directions →
              </a>
              <a
                href="https://wa.me/917428926418"
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 text-center text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle size={14} /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
