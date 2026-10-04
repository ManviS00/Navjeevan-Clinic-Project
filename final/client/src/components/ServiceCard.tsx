import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Play, Building2, Sparkles } from 'lucide-react';
import ServiceVideoPreview from './ServiceVideoPreview';
import type { Service } from '../types';

interface ServiceCardProps {
  service: Service;
  onBook?: (serviceId: string) => void;
  compact?: boolean;
}

export default function ServiceCard({ service, onBook, compact }: ServiceCardProps) {
  const [videoOpen, setVideoOpen] = useState(false);

  const categoryColors: Record<string, string> = {
    obstetrics: 'bg-pink-100 text-pink-700',
    gynaecology: 'bg-purple-100 text-purple-700',
    surgical: 'bg-blue-100 text-blue-700',
    preventive: 'bg-emerald-100 text-emerald-700',
    wellness: 'bg-amber-100 text-amber-700',
  };

  const tagColor = categoryColors[service.category] ?? 'bg-gray-100 text-gray-600';
  const tagLabel = service.hospitalBased ? 'Hospital-Based' : service.category.charAt(0).toUpperCase() + service.category.slice(1);

  return (
    <>
      <div
        className={`group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col ${compact ? 'p-4' : 'p-6'}`}
      >
        {service.hospitalBased && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg mb-4 text-xs text-amber-700">
            <Building2 size={12} />
            <span>Performed at affiliated hospitals</span>
          </div>
        )}

        <div className="flex items-start justify-between mb-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${service.hospitalBased ? 'bg-amber-50' : 'bg-rose-50'} group-hover:scale-110 transition-transform`}>
            {service.icon}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setVideoOpen(true)}
              title="Watch video about this service"
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-rose-100 flex items-center justify-center transition-colors opacity-60 hover:opacity-100"
            >
              <Play size={12} className="text-rose-600 ml-0.5" />
            </button>
          </div>
        </div>

        <h3 className={`font-serif font-semibold text-gray-800 mb-2 ${compact ? 'text-base' : 'text-lg'}`}>
          {service.name}
        </h3>

        {!compact && (
          <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-1">{service.description}</p>
        )}

        <div className="flex items-center gap-1.5 text-xs text-rose-700 bg-rose-50 px-3 py-2 rounded-lg mb-3">
          <Sparkles size={11} />
          <span className="font-medium">{service.benefit}</span>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${tagColor}`}>
            {tagLabel}
          </span>
          {onBook && (
            <button
              onClick={() => onBook(service.id)}
              className="text-xs font-semibold text-rose-700 hover:text-rose-800 transition-colors"
            >
              Book →
            </button>
          )}
        </div>
      </div>

      {/* Fullscreen video overlay — portal to body to escape any transformed ancestors */}
      {videoOpen && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setVideoOpen(false)}
        >
          <div className="absolute inset-0 bg-black" />
          <div
            className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setVideoOpen(false)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <span className="text-xl">✕</span>
            </button>

            {/* Video container — fills viewport while keeping aspect ratio */}
            <div className="w-full max-w-4xl">
              <ServiceVideoPreview serviceId={service.id} />
            </div>

            {/* Service name + description below video */}
            <div className="w-full max-w-4xl mt-4 text-center">
              <h3 className="font-serif font-semibold text-white text-xl mb-1">{service.name}</h3>
              <p className="text-sm text-gray-400 leading-relaxed max-w-2xl mx-auto">{service.description}</p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
