import { useState } from 'react';
import { Info } from 'lucide-react';
import { SERVICES, SERVICE_CATEGORIES } from '../data/services';
import ServiceCard from './ServiceCard';
import Reveal from './Reveal';
import type { AppPage } from '../types';

interface ServicesSectionProps {
  onNavigate: (page: AppPage) => void;
  onBook?: (serviceId: string) => void;
  showAll?: boolean;
}

export default function ServicesSection({ onNavigate, onBook, showAll }: ServicesSectionProps) {
  const [activeFilter, setActiveFilter] = useState('all');

  const filtered = showAll
    ? SERVICES.filter((s) => activeFilter === 'all' || s.category === activeFilter)
    : SERVICES.filter((s) => activeFilter === 'all' || s.category === activeFilter).slice(0, 9);

  return (
    <section className="bg-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Reveal>
          <div className="text-center mb-12">
            <p className="text-rose-600 text-sm font-semibold tracking-widest uppercase mb-3">What we treat</p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-navy-800 mb-4">Our Services</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
              Comprehensive, evidence-based care across the full spectrum of women's health —
              from adolescence to menopause and beyond.
            </p>
          </div>
        </Reveal>

        {/* Filter tabs */}
        <Reveal delay={0.1}>
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {SERVICE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeFilter === cat.id
                    ? 'bg-rose-700 text-white shadow-md shadow-rose-200 scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-rose-50 hover:text-rose-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Services grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {filtered.map((service, i) => (
            <Reveal key={service.id} delay={(i % 3) * 0.1}>
              <ServiceCard
                service={service}
                onBook={onBook ? () => onBook(service.id) : undefined}
              />
            </Reveal>
          ))}
        </div>

        {/* Hospital note */}
        <Reveal delay={0.1}>
          <div className="flex items-start gap-3 p-5 bg-amber-50 border border-amber-200 rounded-2xl max-w-3xl mx-auto mb-8">
            <Info size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-800 leading-relaxed">
              <strong>Note:</strong> Normal Delivery, Cesarean Section, and Laparoscopic Surgery are performed at
              affiliated hospitals, not at the clinic. Dr. Aayushi Pal accompanies and oversees all hospital-based
              procedures. Charges depend on the respective hospital package.
            </p>
          </div>
        </Reveal>

        {/* Show all CTA */}
        {!showAll && (
          <Reveal>
            <div className="text-center">
              <button
                onClick={() => onNavigate('services')}
                className="px-8 py-4 border-2 border-rose-700 text-rose-700 font-semibold rounded-xl hover:bg-rose-700 hover:text-white transition-all hover:-translate-y-0.5 active:scale-95"
              >
                View All 21 Services →
              </button>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
