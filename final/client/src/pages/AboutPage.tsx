import { Award, Heart, Target, Eye } from 'lucide-react';
import type { AppPage } from '../types';

export default function AboutPage({ onNavigate: _onNavigate }: { onNavigate?: (page: AppPage) => void } = {}) {

  const hospitals = [
    { name: 'Safdarjung Hospital, Delhi', role: 'Consultant Obstetrician & Gynaecologist', note: 'One of India\'s largest government hospitals' },
    { name: 'Ram Manohar Lohia (RML) Hospital', role: 'Consultant, OBG Department', note: 'Premier central government hospital, New Delhi' },
    { name: 'Vastirba Hospital, Daryaganj', role: 'Senior Consultant', note: 'Multi-specialty hospital, Old Delhi' },
  ];

  return (
    <div className="pt-20">
    {/* Meet Your Doctor */}
    <section className="bg-gradient-to-br from-navy-800 to-navy-900 py-20 px-4">
      <div className="max-w-6xl mx-auto">

    {/* Section Heading */}
    <div className="text-center mb-14">
      <p className="text-rose-400 uppercase tracking-[5px] text-sm font-semibold">
        Meet Your Doctor
      </p>
      <h2 className="font-serif text-5xl font-bold text-white mt-2">
        Dr. Aayushi Pal
      </h2>
      <p className="text-gray-400 mt-3">
        Dedicated to providing compassionate and evidence-based women's healthcare.
      </p>
    </div>
    <div className="grid lg:grid-cols-[38%_62%] gap-12 items-center">

      {/* Doctor Image */}
      <div className="flex justify-center">
        <div className="w-[360px] h-[460px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 transition-transform duration-500 hover:scale-105">
        <img src="/doctor/doctor.jpeg"
        alt="Dr. Aayushi Pal"
        className="w-full h-full object-cover"/>
        </div>
      </div>

      {/* Right Side */}
      <div>

        {/* Blue Card */}
        <div className="bg-navy-700 rounded-3xl p-8 max-w-xl shadow-2xl border border-white/10 transition-all duration-300 hover:shadow-blue-500/20">
          <div className="grid md:grid-cols-2 gap-8">

            {/* Qualifications */}
            <div>
              <h4 className="text-rose-300 text-sm uppercase tracking-wider font-semibold mb-4">
                🎓 Qualifications
              </h4>
              <ul className="space-y-3 text-gray-200 text-sm">
                <li>✓ MBBS</li>
                <li>✓ MS (Obstetrics & Gynaecology)</li>
                <li>✓ DNB (OBGYN)</li>
                <li>✓ Consultant Obstetrician & Gynaecologist</li>
                <li>✓ Women's Health Specialist</li>
              </ul>
            </div>

            {/* Expertise */}
            <div>
              <h4 className="text-rose-300 text-sm uppercase tracking-wider font-semibold mb-4">
                ⭐ Areas of Expertise
              </h4>
              <ul className="space-y-3 text-gray-200 text-sm">
                <li>✓ High-Risk Pregnancy</li>
                <li>✓ Normal & Caesarean Deliveries</li>
                <li>✓ PCOS / PCOD Management</li>
                <li>✓ Infertility Treatment</li>
                <li>✓ Laparoscopic Surgery</li>
                <li>✓ Menstrual & Hormonal Disorders</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quote */}
        <div className="mt-12">
          <p className="text-gray-300 text-base md:text-lg italic leading-7 max-w-xl">
            "My goal is to ensure every woman who walks through our doors receives the same quality of care she would at a top hospital—with the warmth and attention of a trusted local doctor."
          </p>
          <p className="mt-4 text-rose-400 text-base md:text-lg font-semibold">
            — Dr. Aayushi Pal
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

      {/* Hospital affiliations */}
      <section className="bg-cream-50 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl font-bold text-navy-800 mb-3">Former Hospital Affiliations</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Dr. Pal trained and served at Delhi's premier government hospitals before establishing Navjeevan Clinic.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {hospitals.map((h) => (
              <div key={h.name} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-navy-700 flex items-center justify-center mb-4">
                  <Award size={18} className="text-white" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">{h.name}</h3>
                <p className="text-rose-700 text-sm font-medium mb-2">{h.role}</p>
                <p className="text-gray-500 text-xs">{h.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="p-8 bg-rose-50 rounded-3xl border border-rose-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center mb-4">
              <Eye size={22} className="text-rose-700" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-navy-800 mb-3">Our Vision</h3>
            <p className="text-gray-600 leading-relaxed">
              To become a trusted center for women's healthcare by providing ethical, affordable, and quality
              medical services in Maujpur and the surrounding areas of North-East Delhi.
            </p>
          </div>
          <div className="p-8 bg-navy-700 rounded-3xl">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
              <Target size={22} className="text-white" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-white mb-3">Our Mission</h3>
            <p className="text-gray-300 leading-relaxed">
              To provide compassionate, evidence-based healthcare while ensuring dignity, comfort, and personalised
              treatment for every woman who walks through our doors — regardless of age or background.
            </p>
          </div>
        </div>
      </section>

      {/* About the clinic */}
      <section className="bg-gradient-to-br from-rose-50 to-cream-50 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Heart size={32} className="text-rose-600 mx-auto mb-4" />
          <h2 className="font-serif text-3xl font-bold text-navy-800 mb-4">About Navjeevan Clinic</h2>
          <p className="text-gray-600 leading-relaxed text-lg mb-6">
            Navjeevan Clinic is dedicated to providing comprehensive, compassionate, and evidence-based healthcare
            for women of all age groups, offering preventive, diagnostic, medical, and surgical care with
            personalised attention in obstetrics and gynaecology.
          </p>
          <p className="text-gray-500">
            Established in 2026 · C-130, Puri Gali, Near Angelic Convent School, Maujpur, Delhi – 110053
          </p>
        </div>
      </section>
    </div>
  );
}
