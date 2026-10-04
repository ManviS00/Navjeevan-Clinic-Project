import { Phone, MessageCircle, Star, Shield, Heart } from 'lucide-react';
import type { AppPage } from '../types';

interface HeroSectionProps {
  onNavigate: (page: AppPage) => void;
}

export default function HeroSection({ onNavigate }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-cream-50 via-white to-rose-50 overflow-hidden pt-20">
      {/* Background decorations */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-rose-100 rounded-full blur-3xl opacity-40 pointer-events-none animate-drift" />
      <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-40 pointer-events-none animate-float-slow" />
      <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-rose-200 rounded-full blur-2xl opacity-30 pointer-events-none animate-float" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — content */}
          <div className="order-2 lg:order-1">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 rounded-full text-rose-700 text-sm font-medium mb-6 border border-rose-100 animate-slide-up">
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex w-full h-full rounded-full bg-rose-500 animate-pulse-ring" />
                <span className="relative inline-flex w-2 h-2 rounded-full bg-rose-500" />
              </span>
              Women's Health Specialists · Maujpur, Delhi
            </div>

            <h1 className="font-serif text-5xl md:text-6xl font-bold text-navy-800 leading-tight mb-6 text-balance animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Compassionate Care for{' '}
              <span className="gradient-text-animated italic">Every Woman,</span>
              <br />Every Stage
            </h1>

            <p className="text-gray-600 text-lg leading-relaxed mb-8 max-w-xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Expert obstetrics &amp; gynaecology by <strong>Dr. Aayushi Pal</strong> — evidence-based,
              affordable, and always dignified. Safe motherhood and women's wellness, under one roof in Maujpur, Delhi.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-4 mb-10 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <button
                onClick={() => onNavigate('booking')}
                className="px-7 py-4 bg-rose-700 text-white font-semibold rounded-xl hover:bg-rose-800 transition-all shadow-lg shadow-rose-200 hover:shadow-rose-300 hover:-translate-y-0.5 active:scale-95"
              >
                Book an Appointment →
              </button>
              <a
                href="tel:7428926418"
                className="flex items-center gap-2 px-7 py-4 border-2 border-rose-200 text-rose-700 font-semibold rounded-xl hover:bg-rose-50 hover:-translate-y-0.5 transition-all"
              >
                <Phone size={16} /> Call 74289 26418
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-2 group">
                <div className="w-10 h-10 rounded-full bg-navy-700 text-white flex items-center justify-center font-bold text-sm transition-transform group-hover:scale-110 group-hover:-rotate-6">20+</div>
                <span className="text-sm text-gray-600">Services<br />Available</span>
              </div>
              <div className="flex items-center gap-2 group">
                <div className="w-10 h-10 rounded-full bg-navy-700 text-white flex items-center justify-center font-bold text-sm transition-transform group-hover:scale-110 group-hover:-rotate-6">10+</div>
                <span className="text-sm text-gray-600">Years of<br />Experience</span>
              </div>
              <div className="flex items-center gap-2 group">
                <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center transition-transform group-hover:scale-110 group-hover:-rotate-6">
                  <Shield size={16} />
                </div>
                <span className="text-sm text-gray-600">Emergency<br />Available</span>
              </div>
            </div>
          </div>

          {/* Right — visual card */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end relative animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <div className="relative w-full max-w-md">
              {/* Main card */}
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-rose-50 transition-transform duration-500 hover:-translate-y-1">
                {/* Clinic image */}
                <div className="rounded-2xl overflow-hidden mb-6 aspect-video bg-gray-100">
                  <img
                    src="/images/image.png"
                    alt="Navjeevan Clinic – C-130, Puri Gali, Maujpur, Delhi"
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>

                {/* Doctor info */}
                <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-xl mb-4 transition-all hover:bg-rose-100">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md">
                  <img src="/doctor/doctor.jpeg"
                  alt="Dr. Aayushi Pal"
                  className="w-full h-full object-cover"/>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Dr. Aayushi Pal</p>
                    <p className="text-xs text-gray-500">MBBS, MS (OBG &amp; Gynae), DNB</p>
                    <div className="flex gap-0.5 mt-1">
                      {[1,2,3,4,5].map((s) => <Star key={s} size={10} className="text-amber-400 fill-amber-400" />)}
                    </div>
                  </div>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-blue-50 rounded-xl text-center transition-transform hover:scale-105">
                    <p className="text-xl font-bold text-navy-700">21</p>
                    <p className="text-xs text-gray-600">Services</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-xl text-center transition-transform hover:scale-105">
                    <p className="text-xl font-bold text-green-700">4.9★</p>
                    <p className="text-xs text-gray-600">Patient Rating</p>
                  </div>
                </div>
              </div>

              {/* Floating badge — WhatsApp */}
              <a
                href="https://wa.me/917428926418"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute -bottom-4 -left-4 flex items-center gap-2 bg-white rounded-xl shadow-lg px-4 py-3 border border-green-100 hover:shadow-xl hover:-translate-y-1 transition-all animate-float"
              >
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <MessageCircle size={15} className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700">WhatsApp Us</p>
                  <p className="text-xs text-gray-400">Quick response</p>
                </div>
              </a>

              {/* Floating badge — emergency */}
              <div className="absolute -top-4 -right-4 flex items-center gap-2 bg-white rounded-xl shadow-lg px-4 py-3 border border-rose-100 animate-float-slow">
                <div className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center">
                  <Heart size={14} className="text-white fill-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700">Emergency</p>
                  <p className="text-xs text-rose-600 font-medium">Available 24/7</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-12">
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,60 L0,60 Z" fill="#ffffff" />
        </svg>
      </div>
    </section>
  );
}
