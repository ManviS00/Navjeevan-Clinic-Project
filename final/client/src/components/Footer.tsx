import { Phone, MapPin, MessageCircle, Clock, Instagram, Youtube } from 'lucide-react';
import type { AppPage } from '../types';

interface FooterProps {
  onNavigate: (page: AppPage) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const quickLinks: { label: string; page: AppPage }[] = [
    { label: 'Home', page: 'home' },
    { label: 'Services', page: 'services' },
    { label: 'About Doctor', page: 'about' },
    { label: 'Book Appointment', page: 'booking' },
    { label: 'Contact Us', page: 'contact' },
  ];

  return (
    <footer className="bg-navy-800 text-white">
      {/* CTA strip */}
      <div className="bg-rose-700 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-serif text-xl font-semibold">Ready to take care of your health?</p>
            <p className="text-rose-100 text-sm mt-0.5">Book an appointment with Dr. Aayushi Pal today.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => onNavigate('booking')}
              className="px-6 py-3 bg-white text-rose-700 font-semibold rounded-lg hover:bg-rose-50 transition-colors text-sm"
            >
              Book Appointment
            </button>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="lg:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-white flex items-center justify-center shadow">
              <img src="/navjeevan-logo.jpeg" alt="Navjeevan Clinic logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="font-serif font-semibold text-white text-lg leading-tight">Navjeevan Clinic</p>
              <p className="text-rose-300 text-xs">Complete Women's Care</p>
            </div>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed mb-4">
            Dedicated to comprehensive, compassionate, evidence-based healthcare
            for women of all ages — from Maujpur, Delhi.
          </p>
          <p className="text-gray-400 text-xs italic leading-relaxed">
            "To become a trusted center for women's healthcare by providing
            ethical, affordable, and quality medical services."
          </p>

          {/* Social icons */}
          <div className="flex gap-3 mt-5">
            <a
              href="https://instagram.com/navjeevanclinic"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-pink-600 transition-colors"
            >
              <Instagram size={45} />
            </a>
            <a
              href="https://youtube.com/@navjeevanclinic-j4s?si=ja5X76fEZIRYLjsW"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <Youtube size={45} />
            </a>
            <a
              href="https://wa.me/917428926418"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-green-600 transition-colors"
            >
              <MessageCircle size={45} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold text-white mb-4 text-sm tracking-wide uppercase">Quick Links</h3>
          <ul className="space-y-2">
            {quickLinks.map((link) => (
              <li key={link.page}>
                <button
                  onClick={() => onNavigate(link.page)}
                  className="text-gray-300 hover:text-rose-300 text-sm transition-colors text-left"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Services */}
        <div>
          <h3 className="font-semibold text-white mb-4 text-sm tracking-wide uppercase">Our Services</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>Pregnancy &amp; Antenatal Care</li>
            <li>High-Risk Pregnancy</li>
            <li>PCOS / PCOD Treatment</li>
            <li>Infertility Consultation</li>
            <li>Menstrual Disorders</li>
            <li>Laparoscopic Surgery</li>
            <li>Cervical Cancer Screening</li>
            <li>HPV Vaccination</li>
            <li>Family Planning</li>
            <li>Adolescent Health</li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-semibold text-white mb-4 text-sm tracking-wide uppercase">Contact &amp; Timings</h3>
          <ul className="space-y-3">
            <li className="flex gap-3 text-sm text-gray-300">
              <MapPin size={15} className="text-rose-400 mt-0.5 flex-shrink-0" />
              <span>C-130, Puri Gali, Near Angelic Convent School, Maujpur, Delhi – 110053</span>
            </li>
            <li className="flex gap-3 text-sm">
              <Phone size={15} className="text-rose-400 mt-0.5 flex-shrink-0" />
              <a href="tel:7428926418" className="text-gray-300 hover:text-white transition-colors">74289 26418</a>
            </li>
            <li className="flex gap-3 text-sm">
              <MessageCircle size={15} className="text-rose-400 mt-0.5 flex-shrink-0" />
              <a href="https://wa.me/917428926418" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">74289 26418</a>
            </li>
            <li className="flex gap-3 text-sm text-gray-300">
              <Clock size={15} className="text-rose-400 mt-0.5 flex-shrink-0" />
              <div>
                <p>Mon–Sat: 9:00 AM–1:00 PM</p>
                <p>&amp; 3:00 PM–6:00 PM</p>
                <p>Sunday: Closed</p>
                <p className="text-rose-400 text-xs mt-1">🚨 Emergency: Available</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 py-5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
          <p>© 2026 Navjeevan Clinic · Dr. Aayushi Pal · All rights reserved.</p>
          <p className="italic text-gray-500">"Safe Motherhood · Women's Wellness"</p>
        </div>
      </div>
    </footer>
  );
}
