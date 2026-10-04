import { useState, useEffect } from 'react';
import {Phone,MapPin,MessageCircle,Clock,Instagram,Youtube,} from 'lucide-react';

export default function ContactPage() {
  const clinicImages = [
    "/clinic/clinic1.jpeg",
    "/clinic/clinic2.jpeg",
    "/clinic/clinic3.jpeg",
    "/clinic/clinic4.jpeg",
    "/clinic/clinic5.jpeg",
  ];
  const [currentSlide, setCurrentSlide] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % clinicImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="pt-20">
      
      {/* Header */}
      <section className="bg-gradient-to-br from-cream-50 to-rose-50 py-16 px-4 text-center">
        <p className="text-rose-600 text-sm font-semibold tracking-widest uppercase mb-3">Get in touch</p>
        <h1 className="font-serif text-5xl font-bold text-navy-800 mb-4">Contact Us</h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          We'd love to hear from you. Reach out via phone, WhatsApp.
        </p>
      </section>

      <section className="bg-white py-16 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
          {/* Contact info */}
          <div>
            <h2 className="font-serif text-2xl font-bold text-navy-800 mb-8">Clinic Information</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                  <MapPin size={20} className="text-rose-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 mb-1">Address</p>
                  <p className="text-gray-600">C-130, Puri Gali</p>
                  <p className="text-gray-600">Near Angelic Convent School</p>
                  <p className="text-gray-600">Maujpur, Delhi – 110053</p>
                  <a
                    href="https://maps.google.com/?q=C-130+Puri+Gali+Near+Angelic+Convent+School+Maujpur+Delhi+110053"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-rose-600 text-sm font-medium hover:underline mt-1 inline-block"
                  >
                    Get Directions →
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Phone size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 mb-1">Phone / Emergency</p>
                  <a href="tel:7428926418" className="text-gray-600 hover:text-rose-700 transition-colors text-lg font-medium">74289 26418</a>
                  <p className="text-gray-400 text-sm">Call for appointments or emergencies</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 mb-1">WhatsApp</p>
                  <a href="https://wa.me/917428926418" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-green-700 transition-colors font-medium">+91 74289 26418</a>
                  <p className="text-gray-400 text-sm">Message us anytime for quick queries</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Clock size={20} className="text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 mb-2">Working Hours</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between gap-6">
                      <span className="text-gray-600">Mon–Sat (Morning)</span>
                      <span className="font-medium text-gray-800">9:00 AM – 1:00 PM</span>
                    </div>
                    <div className="flex justify-between gap-6">
                      <span className="text-gray-600">Mon–Sat (Evening)</span>
                      <span className="font-medium text-gray-800">3:00 PM – 6:00 PM</span>
                    </div>
                    <div className="flex justify-between gap-6">
                      <span className="text-gray-600">Sunday</span>
                      <span className="font-medium text-gray-800">Closed</span>
                    </div>
                    <div className="flex justify-between gap-6 text-rose-600">
                      <span>Emergency</span>
                      <span className="font-semibold">Available 24/7</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social */}
            <div className="mt-8 pt-8 border-t border-gray-100">
              <p className="font-semibold text-gray-800 mb-3">Follow Us</p>
              <div className="flex gap-3">
                <a href="https://instagram.com/navjeevanclinic" target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center hover:scale-110 transition-transform">
                  <Instagram size={30} className="text-white" />
                </a>
                <a href="https://youtube.com/@navjeevanclinic" target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center hover:scale-110 transition-transform">
                  <Youtube size={30} className="text-white" />
                </a>
                <a href="https://wa.me/917428926418" target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center hover:scale-110 transition-transform">
                  <MessageCircle size={30} className="text-white" />
                </a>
              </div>
            </div>
          </div>

          {/* Clinic Gallery */}
          <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="text-center mb-6">
              <h2 className="font-serif text-3xl font-bold text-navy-800">
                Our Clinic 
              </h2>
              <p className="text-gray-500 mt-2">
                A glimpse of our clean, modern and patient-friendly clinic.
              </p>
            </div>

          {/* Main Slideshow */}
          <div className="relative overflow-hidden rounded-2xl">
          <img
          src={clinicImages[currentSlide]}
          alt={`Clinic ${currentSlide + 1}`}
          className="w-full h-[320px] object-cover rounded-2xl transition-all duration-700"/>
          
          {/* Previous */}
          <button
          onClick={() =>
            setCurrentSlide((currentSlide - 1 + clinicImages.length) % clinicImages.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white w-11 h-11 rounded-full shadow-lg flex items-center justify-center text-xl">
              ❮</button>
          
          {/* Next */}
          <button onClick={() => setCurrentSlide((currentSlide + 1) % clinicImages.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white w-11 h-11 rounded-full shadow-lg flex items-center justify-center text-xl">
          ❯</button>
        </div>
        
      {/* Dots */}
      <div className="flex justify-center gap-2 mt-5">
        {clinicImages.map((_, index) => (
          <button key={index}
          onClick={() => setCurrentSlide(index)}
          className={`transition-all duration-300 rounded-full ${
          currentSlide === index
            ? "w-8 h-3 bg-rose-600"
            : "w-3 h-3 bg-gray-300"
          }`}
      />
    ))}
  </div>

  {/* Thumbnail Gallery */}
<div className="flex justify-center gap-2 mt-5 flex-wrap">

  {clinicImages.map((image, index) => (
    <img
      key={index}
      src={image}
      alt={`Clinic ${index + 1}`}
      onClick={() => setCurrentSlide(index)}
      className={`w-20 h-14 object-cover rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 border-2 ${
        currentSlide === index
          ? "border-rose-600"
          : "border-transparent"
      }`}
    />
  ))}

</div>
</div>
</div>
</section>

      {/* Google Map */}
      <section className="bg-gray-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <p className="text-rose-600 text-sm font-semibold tracking-widest uppercase mb-2">Find us</p>
            <h2 className="font-serif text-3xl font-bold text-navy-800">Visit Navjeevan Clinic</h2>
            <p className="text-gray-500 text-sm mt-2">C-130, Puri Gali, Near Angelic Convent School, Maujpur, Delhi – 110053</p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200" style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
            <iframe
              title="Navjeevan Clinic Location — Maujpur, Delhi"
              src="https://www.google.com/maps?q=C-130+Puri+Gali+Near+Angelic+Convent+School+Maujpur+Delhi+110053&output=embed"
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
          <div className="flex justify-center mt-6">
            <a
              href="https://maps.google.com/?q=C-130+Puri+Gali+Near+Angelic+Convent+School+Maujpur+Delhi+110053"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-rose-700 text-white rounded-xl font-semibold text-sm hover:bg-rose-800 transition-colors"
            >
              <MapPin size={16} /> Open in Google Maps
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
