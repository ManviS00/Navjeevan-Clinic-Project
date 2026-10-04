import HeroSection from '../components/HeroSection';
import ServicesSection from '../components/ServicesSection';
import DoctorSection from '../components/DoctorSection';
import TimingsSection from '../components/TimingsSection';
import ReviewsCarousel from '../components/ReviewsCarousel';
import BookingForm from '../components/BookingForm';
import Reveal from '../components/Reveal';
import { Phone, MessageCircle, Shield, Award, Heart } from 'lucide-react';
import type { AppPage } from '../types';

interface HomePageProps {
  onNavigate: (page: AppPage) => void;
  onOpenLogin: () => void;
}

export default function HomePage({ onNavigate, onOpenLogin }: HomePageProps) {
  return (
    <div>
      <HeroSection onNavigate={onNavigate} />

      {/* Why choose us */}
      <section className="bg-white py-16 px-4 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Award, title: 'Highly Qualified', desc: 'MBBS, MS (OBG & Gynae), DNB — highest credentials in obstetrics & gynaecology', color: 'text-rose-600 bg-rose-50' },
              { icon: Shield, title: 'Evidence-Based Care', desc: 'Treatments grounded in the latest clinical guidelines and research', color: 'text-blue-600 bg-blue-50' },
              { icon: Heart, title: 'Compassionate Approach', desc: 'Every patient receives dignified, personalised care in a comfortable setting', color: 'text-pink-600 bg-pink-50' },
              { icon: Phone, title: 'Emergency Availability', desc: 'Call anytime for emergencies — we are always reachable on 74289 26418', color: 'text-emerald-600 bg-emerald-50' },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.1}>
                <div className="group h-full flex flex-col items-start p-6 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-gray-100">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${item.color} transition-transform group-hover:scale-110 group-hover:-rotate-6`}>
                    <item.icon size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2 text-base">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <ServicesSection onNavigate={onNavigate} onBook={(sid) => { onNavigate('booking'); }} />
      <DoctorSection onNavigate={onNavigate} />
      <TimingsSection onNavigate={onNavigate} />
      <ReviewsCarousel />

      {/* Booking CTA section */}
      <section className="bg-white py-20 px-4" id="home-booking">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left info */}
            <Reveal>
              <div>
                <p className="text-rose-600 text-sm font-semibold tracking-widest uppercase mb-3">Book online</p>
                <h2 className="font-serif text-4xl font-bold text-navy-800 mb-4">Request an Appointment</h2>
                <p className="text-gray-500 leading-relaxed mb-8">
                  Fill in your details and we'll confirm your slot within a few hours.
                  Your privacy is completely respected.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    'No waiting in queues — know your slot in advance',
                    'All consultations are private and confidential',
                    'Affordable fees — no hidden charges',
                    'Emergency availability — call anytime',
                    'Hindi & English speaking staff',
                  ].map((item, i) => (
                    <Reveal as="li" key={item} delay={i * 0.08} className="flex items-center gap-3 text-sm text-gray-600 list-none">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                      {item}
                    </Reveal>
                  ))}
                </ul>
                <div className="flex gap-3">
                  <a href="tel:7428926418" className="flex items-center gap-2 px-5 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200 hover:-translate-y-0.5 transition-all">
                    <Phone size={15} /> Call Now
                  </a>
                  <a href="https://wa.me/917428926418" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-3 bg-green-50 text-green-700 rounded-xl font-medium text-sm hover:bg-green-100 hover:-translate-y-0.5 transition-all">
                    <MessageCircle size={15} /> WhatsApp
                  </a>
                </div>
              </div>
            </Reveal>

            {/* Form card */}
            <Reveal direction="left" delay={0.15}>
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 transition-transform duration-500 hover:-translate-y-1 hover:shadow-2xl">
                <h3 className="font-serif text-xl font-semibold text-gray-800 mb-6">Book Your Visit 🌸</h3>
                <BookingForm onOpenLogin={onOpenLogin} />
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
