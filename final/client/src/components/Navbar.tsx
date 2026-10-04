import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Phone, ChevronDown, User, LogOut, Calendar, Settings, Stethoscope } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { AppPage } from '../types';

interface NavbarProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  onOpenLogin: () => void;
  onOpenSignup: () => void;
}

export default function Navbar({ currentPage, onNavigate, onOpenLogin, onOpenSignup }: NavbarProps) {
  const { user, profile, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks: { label: string; page: AppPage }[] = [
    { label: 'Home', page: 'home' },
    { label: 'Services', page: 'services' },
    { label: 'About', page: 'about' },
    { label: 'Contact', page: 'contact' },
  ];

  function handleNav(page: AppPage) {
    onNavigate(page);
    setMobileOpen(false);
  }

  const backendUser = (() => {
    try { return JSON.parse(localStorage.getItem('navjeevan_backend_user') || 'null'); } catch { return null; }
  })();
  const backendRole = backendUser?.role as string | undefined;
  const displayName = profile?.full_name?.split(' ')[0] ?? backendUser?.fullName?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'Account';

  function openAccount() {
    if (backendRole === 'doctor') { window.location.href = '/doctor/profile'; return; }
    if (backendRole === 'admin') { handleNav('admin'); return; }
    // A patient's My Profile entry opens the complete patient dashboard,
    // not the small profile-information modal.
    handleNav('dashboard');
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || mobileOpen
            ? 'bg-white shadow-md'
            : 'bg-white/95 backdrop-blur-sm'
        }`}
      >
        {/* Top strip */}
        <div className="bg-rose-700 text-white text-xs py-1.5 px-4 hidden md:flex items-center justify-between">
          <span>Mon–Sat: 9:00 AM–1:00 PM &amp; 3:00 PM–6:00 PM &nbsp;|&nbsp; Sunday: Closed</span>
          <div className="flex items-center gap-4">
            <a href="tel:7428926418" className="flex items-center gap-1 hover:text-rose-200 transition-colors">
              <Phone size={11} /> 74289 26418
            </a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => handleNav('home')}
              className="flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden bg-white flex items-center justify-center shadow-md group-hover:shadow-rose-200 transition-shadow">
                <img src="/navjeevan-logo.jpeg" alt="Navjeevan Clinic logo" className="w-full h-full object-contain" />
              </div>
              <div className="text-left">
                <p className="font-serif font-semibold text-navy-700 text-base leading-tight">Navjeevan Clinic</p>
                <p className="text-[10px] text-rose-700 font-medium tracking-wide leading-tight">
                  Complete Women's Care
                </p>
              </div>
            </button>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.page}
                  onClick={() => handleNav(link.page)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === link.page
                      ? 'text-rose-700 bg-rose-50'
                      : 'text-gray-600 hover:text-rose-700 hover:bg-rose-50'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Auth / CTA */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                      <User size={16} className="text-rose-700" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{displayName}</span>
                    <ChevronDown size={14} className={`text-gray-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-fade-in">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-800">{backendRole === 'admin' ? 'Clinic Administrator' : backendRole === 'doctor' ? (backendUser?.fullName ?? 'Doctor') : (profile?.full_name ?? 'Patient')}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <button
                        onClick={() => { openAccount(); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 transition-colors"
                      >
                        {backendRole === 'doctor' ? (
                          <><Calendar size={14} className="text-rose-600" /> Doctor Profile</>
                        ) : backendRole === 'admin' ? (
                          <><Settings size={14} className="text-rose-600" /> Admin Profile</>
                        ) : (
                          <><Settings size={14} className="text-rose-600" /> My Profile</>
                        )}
                      </button>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={() => { signOut(); setUserMenuOpen(false); }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={14} /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button
                    onClick={onOpenLogin}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-rose-700 transition-colors"
                  >
                    Log In
                  </button>
                  <button
                    onClick={onOpenSignup}
                    className="px-4 py-2 text-sm font-semibold text-white bg-rose-700 rounded-lg hover:bg-rose-800 transition-colors shadow-sm"
                  >
                    Sign Up
                  </button>
                </>
              )}
              {(!user || backendRole === 'patient') && (
                <button
                  onClick={() => handleNav('booking')}
                  className="px-4 py-2 text-sm font-semibold text-rose-700 border-2 border-rose-700 rounded-lg hover:bg-rose-700 hover:text-white transition-all"
                >
                  Book Appointment
                </button>
              )}
            </div>

            {/* Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1 animate-fade-in">
            {navLinks.map((link) => (
              <button
                key={link.page}
                onClick={() => handleNav(link.page)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === link.page ? 'text-rose-700 bg-rose-50' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </button>
            ))}
            <div className="pt-2 flex flex-col gap-2 border-t border-gray-100">
              {(!user || backendRole === 'patient') && (
                <button
                  onClick={() => { handleNav('booking'); setMobileOpen(false); }}
                  className="w-full py-3 text-sm font-semibold text-white bg-rose-700 rounded-lg"
                >
                  Book Appointment
                </button>
              )}
              {user ? (
                <button
                  onClick={() => { openAccount(); setMobileOpen(false); }}
                  className="w-full py-3 text-sm font-medium text-rose-700 border border-rose-200 rounded-lg"
                >
                  {backendRole === 'doctor' ? 'Doctor Profile' : backendRole === 'admin' ? 'Admin Profile' : 'My Profile'}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => { onOpenLogin(); setMobileOpen(false); }} className="flex-1 py-3 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg">Log In</button>
                  <button onClick={() => { onOpenSignup(); setMobileOpen(false); }} className="flex-1 py-3 text-sm font-semibold text-rose-700 border border-rose-200 rounded-lg">Sign Up</button>
                </div>
              )}
              <a href="tel:7428926418" className="w-full py-3 text-sm font-medium text-center text-gray-600 flex items-center justify-center gap-2">
                <Phone size={14} /> 74289 26418
              </a>
              <Link
                to="/doctor/login"
                className="w-full py-3 text-sm font-medium text-center text-gray-500 flex items-center justify-center gap-2"
              >
                <Stethoscope size={14} /> Doctor Login
              </Link>
            </div>
          </div>
        )}
      </nav>


      {/* Backdrop */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
      )}
    </>
  );
}
