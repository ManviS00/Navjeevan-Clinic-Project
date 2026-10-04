import Reveal from './Reveal';
import type { AppPage } from '../types';

interface DoctorSectionProps {
  onNavigate: (page: AppPage) => void;
}
export default function DoctorSection({ onNavigate }: DoctorSectionProps) {
  return (
    <section className="bg-navy-800 py-16 px-4 overflow-hidden relative">

      {/* Background Effects */}
      <div className="absolute top-10 right-10 w-72 h-72 bg-rose-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl" />
      <div className="max-w-7xl mx-auto relative z-10">

        {/* Heading */}
        <Reveal>
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold leading-tight">
              <span className="text-white">
                Experienced.
              </span>
              <span className="gradient-text-animated">
                {" "}Trusted.
              </span>
              <span className="text-white">
                {" "}Compassionate.
              </span>
            </h2>
          </div>
        </Reveal>
        {/* Doctor Card */}
        <Reveal>
        <div className="flex justify-center">
          <div className="relative group">
            
        {/* Background Layer */}
        <div className="absolute -top-3 left-3 w-full h-full rounded-3xl bg-rose-600/20 transition-all duration-300 group-hover:left-4 group-hover:-top-4"></div>
        
        {/* Main Card */}
        <div className="relative bg-gradient-to-br from-navy-700 to-navy-900 border border-white/10 rounded-3xl shadow-2xl px-6 py-5 w-[430px] transition-all duration-300 hover:-translate-y-2 hover:shadow-rose-500/20">

        {/* Doctor Icon */}
        <div className="w-36 h-38 mx-auto rounded-full overflow-hidden border-4 border-rose-300 shadow-lg">
          <img src="/doctor/doctor.jpeg"
          alt="Dr. Aayushi Pal"
          className="w-full h-full object-cover"/>
        </div>

        {/* Doctor Details */}
        <div className="text-center mt-3">
          <h3 className="font-serif text-2xl font-bold text-white">
            Dr. Aayushi Pal
          </h3>
          <p className="text-rose-400 text-sm font-medium mt-1">
            MBBS, MS (OBG & Gynae), DNB
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Consultant Obstetrician & Gynaecologist
          </p>
        </div>

        {/* Divider */}
        <div className="w-16 h-1 bg-rose-500 rounded-full mx-auto my-3"></div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 rounded-xl text-center py-2 px-2">
            <p className="text-lg font-bold text-white">
              10+
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              Years Experience
            </p>
          </div>
          <div className="bg-white/5 rounded-xl text-center py-2 px-2">
            <p className="text-lg font-bold text-white">
              21+
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              Services
            </p>
          </div>
          <div className="bg-white/5 rounded-xl text-center py-2 px-2">
            <p className="text-lg font-bold text-white">
              3
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              Hospitals
            </p>
          </div>
        </div>

        {/* Button */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => onNavigate('about')}
            className="group bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-semibold px-6 py-2.5 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
          >
            View Full Profile
            <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
              →
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</Reveal>
      </div>
    </section>
  );
}